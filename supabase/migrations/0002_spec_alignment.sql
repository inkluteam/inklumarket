-- IncluMarket — 0002: spec alignment (futureupdate.md)
-- Adds: im_cart, im_order_status_history, im_ui_prefs, im_audit_logs,
--       view im_low_stock_alerts, RPC create_order_with_items,
--       updated_at touch triggers. Idempotent — safe to re-run.

-- ── 1. Cart (server-side, per FR-04) ──────────────────────────
create table if not exists im_cart (
  id          bigint generated always as identity primary key,
  user_id     bigint not null references im_profiles(id) on delete cascade,
  product_id  bigint not null references im_products(id) on delete cascade,
  variant_id  bigint references im_product_variants(id) on delete set null,
  quantity    int not null default 1 check (quantity > 0),
  created_at  timestamptz default now()
);
create unique index if not exists idx_im_cart_uniq
  on im_cart(user_id, product_id, coalesce(variant_id, 0));
create index if not exists idx_im_cart_user on im_cart(user_id);

alter table im_cart enable row level security;
drop policy if exists cart_own on im_cart;
create policy cart_own on im_cart for all
  using (user_id = im_current_profile_id()) with check (user_id = im_current_profile_id());

-- ── 2. Order status history (per FR-05) ───────────────────────
create table if not exists im_order_status_history (
  id          bigint generated always as identity primary key,
  order_id    bigint not null references im_orders(id) on delete cascade,
  old_status  text,
  new_status  text not null,
  note        text,
  updated_by  bigint references im_profiles(id) on delete set null,
  created_at  timestamptz default now()
);
create index if not exists idx_im_osh_order on im_order_status_history(order_id);

alter table im_order_status_history enable row level security;
drop policy if exists osh_select_participant on im_order_status_history;
create policy osh_select_participant on im_order_status_history for select
  using (exists (select 1 from im_orders o where o.id = order_id
                 and (o.buyer_id = im_current_profile_id() or im_current_profile_role() = 'admin')));

-- auto-log every order_status transition
create or replace function im_log_order_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.order_status is distinct from old.order_status then
    insert into im_order_status_history (order_id, old_status, new_status, updated_by)
    values (new.id, old.order_status, new.order_status, im_current_profile_id());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_im_orders_status_history on im_orders;
create trigger trg_im_orders_status_history
  after update of order_status on im_orders
  for each row execute procedure im_log_order_status();

-- ── 3. UI accessibility prefs (per FR-14 / im_ui_prefs) ───────
create table if not exists im_ui_prefs (
  user_id         bigint primary key references im_profiles(id) on delete cascade,
  contrast        text not null default 'normal' check (contrast in ('normal','high','dark')),
  font_size_px    int  not null default 16 check (font_size_px between 12 and 32),
  dyslexia_font   boolean not null default false,
  tts_enabled     boolean not null default false,
  voice_commands  boolean not null default false,
  reading_mode    boolean not null default false,
  reduced_motion  boolean not null default false,
  visual_alerts   boolean not null default false,
  updated_at      timestamptz default now()
);

alter table im_ui_prefs enable row level security;
drop policy if exists uiprefs_own on im_ui_prefs;
create policy uiprefs_own on im_ui_prefs for all
  using (user_id = im_current_profile_id()) with check (user_id = im_current_profile_id());

-- ── 4. Audit logs (compliance-grade, per NFR-08) ──────────────
create table if not exists im_audit_logs (
  id          bigint generated always as identity primary key,
  actor_id    bigint references im_profiles(id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   text,
  target      text,
  details     text,
  created_at  timestamptz default now()
);
create index if not exists idx_im_audit_actor on im_audit_logs(actor_id);
create index if not exists idx_im_audit_action on im_audit_logs(action);

alter table im_audit_logs enable row level security;
drop policy if exists audit_select_admin on im_audit_logs;
create policy audit_select_admin on im_audit_logs for select
  using (im_current_profile_role() = 'admin');
drop policy if exists audit_insert_auth on im_audit_logs;
create policy audit_insert_auth on im_audit_logs for insert with check (true);

-- ── 5. Low stock alerts view (spec §4.3) ──────────────────────
create or replace view im_low_stock_alerts as
select p.id as product_id, p.title, p.stock, p.seller_id, pr.name as seller_name,
       pr.email as seller_email, v.id as variant_id, v.sku_code, v.color_name, v.size,
       v.stock_qty, 5 as threshold
from im_products p
join im_profiles pr on pr.id = p.seller_id
left join im_product_variants v on v.product_id = p.id
where p.status = 'approved'
  and (p.stock <= 5 or coalesce(v.stock_qty, 99) <= 5);

grant select on im_low_stock_alerts to authenticated;

-- ── 6. Atomic checkout RPC (stock check + decrement + history + notify) ──
create or replace function create_order_with_items(
  order_data jsonb,
  items_data jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order      im_orders%rowtype;
  v_item       jsonb;
  v_product    im_products%rowtype;
  v_variant    im_product_variants%rowtype;
  v_unit_price numeric(10,2);
  v_seller_ids bigint[];
begin
  -- lock + validate every line before writing anything
  for v_item in select * from jsonb_array_elements(items_data) loop
    select * into v_product from im_products
      where id = (v_item->>'product_id')::bigint for update;
    if not found then
      raise exception 'PRODUCT_NOT_FOUND:%', v_item->>'product_id';
    end if;
    if v_product.status <> 'approved' then
      raise exception 'PRODUCT_NOT_AVAILABLE:%', v_product.title;
    end if;

    if v_item->>'variant_id' is not null then
      select * into v_variant from im_product_variants
        where id = (v_item->>'variant_id')::bigint for update;
      if found and v_variant.stock_qty < (v_item->>'quantity')::int then
        raise exception 'INSUFFICIENT_STOCK:%', coalesce(v_variant.sku_code, v_product.title);
      end if;
    end if;
    if (v_item->>'variant_id' is null) and v_product.stock < (v_item->>'quantity')::int then
      raise exception 'INSUFFICIENT_STOCK:%', v_product.title;
    end if;
  end loop;

  -- create the order
  insert into im_orders (buyer_id, total_amount, payment_method, payment_provider,
                         shipping_address, notes, order_status)
  values (
    (order_data->>'buyer_id')::bigint,
    (order_data->>'total_amount')::numeric,
    order_data->>'payment_method',
    order_data->>'payment_provider',
    order_data->>'shipping_address',
    order_data->>'notes',
    'pending'
  )
  returning * into v_order;

  -- insert items, decrement stock, collect sellers
  for v_item in select * from jsonb_array_elements(items_data) loop
    select * into v_product from im_products where id = (v_item->>'product_id')::bigint;

    v_unit_price := coalesce(
      (v_item->>'unit_price')::numeric,
      v_product.base_price + coalesce((v_item->>'price_mod')::numeric, 0)
    );

    insert into im_order_items (order_id, product_id, variant_id, quantity, unit_price)
    values (
      v_order.id,
      (v_item->>'product_id')::bigint,
      (v_item->>'variant_id')::bigint,
      (v_item->>'quantity')::int,
      v_unit_price
    );

    update im_products set stock = greatest(stock - (v_item->>'quantity')::int, 0)
      where id = v_product.id;

    if v_item->>'variant_id' is not null then
      update im_product_variants
        set stock_qty = greatest(stock_qty - (v_item->>'quantity')::int, 0)
        where id = (v_item->>'variant_id')::bigint;
    end if;

    if not (v_product.seller_id = any(v_seller_ids)) then
      v_seller_ids := array_append(v_seller_ids, v_product.seller_id);
    end if;
  end loop;

  -- initial status-history row
  insert into im_order_status_history (order_id, old_status, new_status, note)
  values (v_order.id, null, 'pending', 'Order placed');

  -- notify each affected seller
  for i in array_lower(v_seller_ids, 1) .. array_upper(v_seller_ids, 1) loop
    insert into im_notifications (user_id, type, message, link)
    values (
      v_seller_ids[i], 'new_order',
      'New order ' || v_order.order_ref || ' includes your products.',
      '/seller/seller-orders'
    );
  end loop;

  -- clear purchased lines from the buyer's server-side cart
  delete from im_cart c
  where c.user_id = v_order.buyer_id
    and exists (
      select 1 from jsonb_array_elements(items_data) it
      where (it->>'product_id')::bigint = c.product_id
        and ((it->>'variant_id')::bigint is not distinct from c.variant_id)
    );

  return to_jsonb(v_order);
end;
$$;

-- ── 7. updated_at touch triggers ──────────────────────────────
create or replace function im_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['im_profiles','im_products','im_orders','im_support_tickets','im_payouts'] loop
    execute format('drop trigger if exists trg_%s_touch on %I', t, t);
    execute format(
      'create trigger trg_%s_touch before update on %I
       for each row execute procedure im_touch_updated_at()', t, t);
  end loop;
end $$;
