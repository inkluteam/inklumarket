-- IncluMarket — Full Schema Migration (v2, dependency-ordered, idempotent)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/pzacrgfuhdllujuqebkr/sql
-- All tables use im_ prefix to share the Supabase project safely.
-- Safe to re-run: every statement is guarded with if-not-exists / drop-if-exists.

-- ── Extensions ────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── 1. Profiles ───────────────────────────────────────────────
create table if not exists im_profiles (
  id              bigint generated always as identity primary key,
  auth_user_id    uuid references auth.users(id) on delete cascade,
  email           text unique not null,
  name            text,
  phone           text,
  role            text not null default 'buyer' check (role in ('buyer','seller','admin')),
  account_status  text not null default 'active' check (account_status in ('active','suspended','pending')),
  disability_type text,
  assistive_needs text,
  pwd_id_url      text,
  avatar_url      text,
  bio             text,
  location        text default 'Zamboanga City',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists idx_im_profiles_auth_user_id on im_profiles(auth_user_id);
create index if not exists idx_im_profiles_role on im_profiles(role);

-- ── 2. Categories ─────────────────────────────────────────────
create table if not exists im_categories (
  id            text primary key,
  name          text not null,
  icon          text,
  description   text,
  product_count int default 0,
  created_at    timestamptz default now()
);

-- ── 3. Payment Providers (must exist before orders/transactions) ──
create table if not exists im_payment_providers (
  id           text primary key,
  display_name text not null,
  enabled      boolean default true,
  fee_percent  numeric(5,2) default 0,
  created_at   timestamptz default now()
);
insert into im_payment_providers (id, display_name, enabled, fee_percent) values
  ('cod',      'Cash on Delivery', true,  0.0),
  ('gcash',    'GCash',            true,  1.5),
  ('maya',     'Maya (PayMaya)',   true,  1.5),
  ('paymongo', 'PayMongo',         false, 2.5),
  ('stripe',   'Stripe',           false, 2.9),
  ('paypal',   'PayPal',           false, 3.0)
on conflict (id) do nothing;

-- ── 4. Products ───────────────────────────────────────────────
create table if not exists im_products (
  id            bigint generated always as identity primary key,
  seller_id     bigint references im_profiles(id) on delete cascade,
  category_id   text references im_categories(id) on delete set null,
  title         text not null,
  description   text,
  base_price    numeric(10,2) not null check (base_price >= 0),
  stock         int not null default 0 check (stock >= 0),
  status        text not null default 'pending_review' check (status in ('pending_review','approved','flagged')),
  is_featured   boolean default false,
  accessibility text,
  image_url     text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index if not exists idx_im_products_seller_id on im_products(seller_id);
create index if not exists idx_im_products_status on im_products(status);
create index if not exists idx_im_products_category_id on im_products(category_id);

-- ── 5. Product Variants ───────────────────────────────────────
create table if not exists im_product_variants (
  id          bigint generated always as identity primary key,
  product_id  bigint references im_products(id) on delete cascade,
  sku_code    text unique,
  color_name  text,
  size        text,
  stock_qty   int not null default 0 check (stock_qty >= 0),
  price_mod   numeric(10,2) default 0,
  created_at  timestamptz default now()
);
create index if not exists idx_im_variants_product on im_product_variants(product_id);

-- ── 6. Product Images ─────────────────────────────────────────
create table if not exists im_product_images (
  id          bigint generated always as identity primary key,
  product_id  bigint references im_products(id) on delete cascade,
  url         text not null,
  is_primary  boolean default false,
  created_at  timestamptz default now()
);

-- ── 7. Chat Sessions (before tickets — tickets escalate from these) ──
create table if not exists im_chat_sessions (
  id                  bigint generated always as identity primary key,
  user_id             bigint references im_profiles(id) on delete set null,
  guest_id            text,
  status              text not null default 'open' check (status in ('open','escalated','closed')),
  escalated_ticket_id bigint,
  created_at          timestamptz default now()
);

-- ── 8. Chat Messages ──────────────────────────────────────────
create table if not exists im_chat_messages (
  id          bigint generated always as identity primary key,
  session_id  bigint references im_chat_sessions(id) on delete cascade,
  role        text not null check (role in ('user','bot','agent')),
  body        text not null,
  created_at  timestamptz default now()
);

-- ── 9. Support Tickets ────────────────────────────────────────
create table if not exists im_support_tickets (
  id              bigint generated always as identity primary key,
  ticket_ref      text unique default ('TKT-' || floor(random()*900000+100000)::text),
  user_id         bigint references im_profiles(id) on delete set null,
  subject         text not null,
  description     text,
  ticket_status   text not null default 'open' check (ticket_status in ('open','in_progress','resolved')),
  priority_level  text not null default 'normal' check (priority_level in ('low','normal','high')),
  assigned_to     bigint references im_profiles(id) on delete set null,
  escalated_from  bigint references im_chat_sessions(id) on delete set null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 10. Ticket Responses ──────────────────────────────────────
create table if not exists im_ticket_responses (
  id          bigint generated always as identity primary key,
  ticket_id   bigint references im_support_tickets(id) on delete cascade,
  author_id   bigint references im_profiles(id) on delete set null,
  message     text not null,
  created_at  timestamptz default now()
);

-- ── 11. Orders ────────────────────────────────────────────────
create table if not exists im_orders (
  id               bigint generated always as identity primary key,
  order_ref        text unique default ('ORD-' || floor(random()*900000+100000)::text),
  buyer_id         bigint references im_profiles(id) on delete set null,
  total_amount     numeric(10,2) not null check (total_amount >= 0),
  order_status     text not null default 'pending' check (order_status in ('pending','processing','shipped','delivered','returned','cancelled')),
  payment_method   text,
  payment_provider text references im_payment_providers(id) on delete set null,
  shipping_address text,
  tracking_number  text,
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
create index if not exists idx_im_orders_buyer on im_orders(buyer_id);
create index if not exists idx_im_orders_status on im_orders(order_status);

-- back-fill the chat_sessions FK now that orders' deps are stable
do $$ begin
  alter table im_chat_sessions add constraint im_chat_sessions_escalated_ticket_fkey
    foreign key (escalated_ticket_id) references im_support_tickets(id) on delete set null;
exception when duplicate_object then null; end $$;

-- ── 12. Order Items ───────────────────────────────────────────
create table if not exists im_order_items (
  id          bigint generated always as identity primary key,
  order_id    bigint references im_orders(id) on delete cascade,
  product_id  bigint references im_products(id) on delete set null,
  variant_id  bigint references im_product_variants(id) on delete set null,
  quantity    int not null check (quantity > 0),
  unit_price  numeric(10,2) not null check (unit_price >= 0),
  created_at  timestamptz default now()
);
create index if not exists idx_im_items_order on im_order_items(order_id);

-- ── 13. Transactions ──────────────────────────────────────────
create table if not exists im_transactions (
  id              bigint generated always as identity primary key,
  order_id        bigint references im_orders(id) on delete set null,
  provider_id     text references im_payment_providers(id) on delete set null,
  amount          numeric(10,2) not null check (amount >= 0),
  platform_fee    numeric(10,2) default 0,
  seller_payout   numeric(10,2) default 0,
  currency        text default 'PHP',
  status          text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  created_at      timestamptz default now()
);

-- ── 14. Product Reviews ───────────────────────────────────────
create table if not exists im_product_reviews (
  id           bigint generated always as identity primary key,
  product_id   bigint references im_products(id) on delete cascade,
  buyer_id     bigint references im_profiles(id) on delete set null,
  rating_score int not null check (rating_score between 1 and 5),
  comment      text,
  moderated    boolean default false,
  flagged      boolean default false,
  created_at   timestamptz default now()
);
create index if not exists idx_im_reviews_product on im_product_reviews(product_id);

-- ── 15. Wishlist ──────────────────────────────────────────────
create table if not exists im_wishlist (
  id          bigint generated always as identity primary key,
  user_id     bigint references im_profiles(id) on delete cascade,
  product_id  bigint references im_products(id) on delete cascade,
  added_at    timestamptz default now()
);
create unique index if not exists idx_im_wishlist_uniq on im_wishlist(user_id, product_id);

-- ── 16. Flash Sales ───────────────────────────────────────────
create table if not exists im_flash_sales (
  id               bigint generated always as identity primary key,
  product_id       bigint references im_products(id) on delete cascade,
  discount_percent numeric(5,2) not null check (discount_percent between 0 and 100),
  starts_at        timestamptz not null,
  ends_at          timestamptz not null,
  created_at       timestamptz default now()
);

-- ── 17. Conversations ─────────────────────────────────────────
create table if not exists im_conversations (
  id               bigint generated always as identity primary key,
  buyer_id         bigint references im_profiles(id) on delete cascade,
  seller_id        bigint references im_profiles(id) on delete cascade,
  product_id       bigint references im_products(id) on delete set null,
  last_message     text,
  last_message_at  timestamptz,
  created_at       timestamptz default now(),
  unique(buyer_id, seller_id, product_id)
);
create index if not exists idx_im_conv_buyer on im_conversations(buyer_id);
create index if not exists idx_im_conv_seller on im_conversations(seller_id);

-- ── 18. Messages ──────────────────────────────────────────────
create table if not exists im_messages (
  id               bigint generated always as identity primary key,
  conversation_id  bigint references im_conversations(id) on delete cascade,
  sender_id        bigint references im_profiles(id) on delete set null,
  body             text not null,
  read_at          timestamptz,
  created_at       timestamptz default now()
);
create index if not exists idx_im_messages_conv on im_messages(conversation_id);

-- ── 19. Notifications ─────────────────────────────────────────
create table if not exists im_notifications (
  id          bigint generated always as identity primary key,
  user_id     bigint references im_profiles(id) on delete cascade,
  type        text not null,
  message     text not null,
  link        text,
  is_read     boolean default false,
  created_at  timestamptz default now()
);
create index if not exists idx_im_notif_user on im_notifications(user_id);

-- ── 20. Payouts ───────────────────────────────────────────────
create table if not exists im_payouts (
  id           bigint generated always as identity primary key,
  payout_ref   text unique default ('PAY-' || floor(random()*900000+100000)::text),
  seller_id    bigint references im_profiles(id) on delete set null,
  amount       numeric(10,2) not null check (amount > 0),
  method       text not null,
  account_name text,
  status       text not null default 'pending' check (status in ('pending','approved','completed','rejected')),
  admin_note   text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create index if not exists idx_im_payouts_seller on im_payouts(seller_id);

-- ── 21. Consent Logs ──────────────────────────────────────────
create table if not exists im_consent_logs (
  id          bigint generated always as identity primary key,
  user_id     bigint references im_profiles(id) on delete set null,
  action      text not null,
  purpose     text,
  consent     boolean not null,
  logged_at   timestamptz default now()
);

-- ── 22. Activity Logs ─────────────────────────────────────────
create table if not exists im_activity_logs (
  id          bigint generated always as identity primary key,
  actor_id    bigint references im_profiles(id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   text,
  details     text,
  created_at  timestamptz default now()
);
create index if not exists idx_im_activity_actor on im_activity_logs(actor_id);

-- ── 23. Newsletter Subscribers ────────────────────────────────
create table if not exists im_newsletter_subscribers (
  id              bigint generated always as identity primary key,
  email           text unique not null,
  user_id         bigint references im_profiles(id) on delete set null,
  active          boolean default true,
  subscribed_at   timestamptz default now(),
  unsubscribed_at timestamptz
);

-- ── 24. Addresses ─────────────────────────────────────────────
create table if not exists im_addresses (
  id           bigint generated always as identity primary key,
  user_id      bigint references im_profiles(id) on delete cascade,
  label        text,
  full_name    text,
  phone        text,
  line1        text not null,
  line2        text,
  city         text not null default 'Zamboanga City',
  province     text default 'Zamboanga del Sur',
  postal_code  text,
  is_default   boolean default false,
  created_at   timestamptz default now()
);

-- ── 25. Theme Settings (singleton) ────────────────────────────
create table if not exists im_theme_settings (
  id                bigint generated always as identity primary key,
  color_primary     text default '#0047AB',
  color_secondary   text default '#C8102E',
  color_accent      text default '#FFD700',
  color_background  text default '#FFFFFF',
  color_text        text default '#1a1a1a',
  font_size_base    int  default 16,
  border_radius     int  default 8,
  preset            text default 'dswd-default',
  updated_at        timestamptz default now()
);
insert into im_theme_settings (color_primary, color_secondary, color_accent)
select '#0047AB','#C8102E','#FFD700'
where not exists (select 1 from im_theme_settings);

-- ══════════════════════════════════════════════════════════════
-- Row Level Security
-- ══════════════════════════════════════════════════════════════
alter table im_profiles        enable row level security;
alter table im_categories      enable row level security;
alter table im_payment_providers enable row level security;
alter table im_products        enable row level security;
alter table im_product_variants  enable row level security;
alter table im_product_images    enable row level security;
alter table im_orders          enable row level security;
alter table im_order_items     enable row level security;
alter table im_transactions    enable row level security;
alter table im_product_reviews enable row level security;
alter table im_wishlist        enable row level security;
alter table im_flash_sales     enable row level security;
alter table im_conversations   enable row level security;
alter table im_messages        enable row level security;
alter table im_notifications   enable row level security;
alter table im_support_tickets enable row level security;
alter table im_ticket_responses  enable row level security;
alter table im_chat_sessions   enable row level security;
alter table im_chat_messages   enable row level security;
alter table im_payouts         enable row level security;
alter table im_addresses       enable row level security;

-- helper: current viewer's profile role (used by admin policies)
create or replace function im_current_profile_role()
returns text language sql stable security definer set search_path = public as $$
  select role from im_profiles where auth_user_id = auth.uid() limit 1
$$;

create or replace function im_current_profile_id()
returns bigint language sql stable security definer set search_path = public as $$
  select id from im_profiles where auth_user_id = auth.uid() limit 1
$$;

-- ── Policies (idempotent: drop then recreate) ──────────────────
drop policy if exists profiles_select_own on im_profiles;
create policy profiles_select_own on im_profiles for select
  using (auth.uid() = auth_user_id or im_current_profile_role() = 'admin');
drop policy if exists profiles_update_own on im_profiles;
create policy profiles_update_own on im_profiles for update
  using (auth.uid() = auth_user_id or im_current_profile_role() = 'admin');
drop policy if exists profiles_insert_self on im_profiles;
create policy profiles_insert_self on im_profiles for insert
  with check (auth.uid() = auth_user_id or auth_user_id is null);

-- public catalog readable by everyone; sellers/admin manage
drop policy if exists products_select_approved on im_products;
create policy products_select_approved on im_products for select
  using (status = 'approved' or auth.uid() is not null);
drop policy if exists products_insert_seller on im_products;
create policy products_insert_seller on im_products for insert
  with check (auth.uid() is not null);
drop policy if exists products_update_seller on im_products;
create policy products_update_seller on im_products for update
  using (auth.uid() is not null or im_current_profile_role() = 'admin');

-- categories + providers + flash sales: world-read
drop policy if exists categories_read_all on im_categories;
create policy categories_read_all on im_categories for select using (true);
drop policy if exists providers_read_all on im_payment_providers;
create policy providers_read_all on im_payment_providers for select using (true);
drop policy if exists flash_read_all on im_flash_sales;
create policy flash_read_all on im_flash_sales for select using (true);
drop policy if exists flash_write_auth on im_flash_sales;
create policy flash_write_auth on im_flash_sales for all
  using (im_current_profile_role() = 'admin') with check (im_current_profile_role() = 'admin');

-- variants / images follow product visibility
drop policy if exists variants_read_all on im_product_variants;
create policy variants_read_all on im_product_variants for select using (true);
drop policy if exists variants_write_auth on im_product_variants;
create policy variants_write_auth on im_product_variants for all
  using (auth.uid() is not null) with check (auth.uid() is not null);
drop policy if exists images_read_all on im_product_images;
create policy images_read_all on im_product_images for select using (true);
drop policy if exists images_write_auth on im_product_images;
create policy images_write_auth on im_product_images for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- orders: buyer sees own, admin sees all
drop policy if exists orders_select_own on im_orders;
create policy orders_select_own on im_orders for select
  using (buyer_id = im_current_profile_id() or im_current_profile_role() = 'admin');
drop policy if exists orders_insert_own on im_orders;
create policy orders_insert_own on im_orders for insert
  with check (buyer_id = im_current_profile_id());
drop policy if exists orders_update_admin on im_orders;
create policy orders_update_admin on im_orders for update
  using (im_current_profile_role() = 'admin');

-- order items follow the parent order
drop policy if exists items_select_participant on im_order_items;
create policy items_select_participant on im_order_items for select
  using (exists (select 1 from im_orders o where o.id = order_id
                 and (o.buyer_id = im_current_profile_id() or im_current_profile_role() = 'admin'))
         or exists (select 1 from im_order_items it join im_products p on p.id = it.product_id
                    where it.id = id and p.seller_id = im_current_profile_id()));
drop policy if exists items_insert_own on im_order_items;
create policy items_insert_own on im_order_items for insert
  with check (exists (select 1 from im_orders o where o.id = order_id and o.buyer_id = im_current_profile_id()));

-- transactions: admin only
drop policy if exists txn_admin_all on im_transactions;
create policy txn_admin_all on im_transactions for all
  using (im_current_profile_role() = 'admin') with check (im_current_profile_role() = 'admin');

-- reviews: anyone reads, authenticated writes own
drop policy if exists reviews_select_all on im_product_reviews;
create policy reviews_select_all on im_product_reviews for select using (true);
drop policy if exists reviews_insert_auth on im_product_reviews;
create policy reviews_insert_auth on im_product_reviews for insert
  with check (auth.uid() is not null);
drop policy if exists reviews_moderate_admin on im_product_reviews;
create policy reviews_moderate_admin on im_product_reviews for update
  using (im_current_profile_role() = 'admin');

-- wishlist: strict owner
drop policy if exists wishlist_own on im_wishlist;
create policy wishlist_own on im_wishlist for all
  using (user_id = im_current_profile_id()) with check (user_id = im_current_profile_id());

-- notifications: strict owner
drop policy if exists notif_own on im_notifications;
create policy notif_own on im_notifications for all
  using (user_id = im_current_profile_id()) with check (user_id = im_current_profile_id());

-- conversations: participants + admin
drop policy if exists conv_own on im_conversations;
create policy conv_own on im_conversations for all
  using (buyer_id = im_current_profile_id() or seller_id = im_current_profile_id()
         or im_current_profile_role() = 'admin')
  with check (buyer_id = im_current_profile_id() or seller_id = im_current_profile_id());

-- messages: conversation participants + admin
drop policy if exists msg_own on im_messages;
create policy msg_own on im_messages for all
  using (exists (select 1 from im_conversations c where c.id = conversation_id
                 and (c.buyer_id = im_current_profile_id() or c.seller_id = im_current_profile_id()))
         or im_current_profile_role() = 'admin');

-- tickets: owner + assigned + admin
drop policy if exists ticket_own on im_support_tickets;
create policy ticket_own on im_support_tickets for all
  using (user_id = im_current_profile_id() or assigned_to = im_current_profile_id()
         or im_current_profile_role() = 'admin')
  with check (user_id = im_current_profile_id() or im_current_profile_role() = 'admin');

-- ticket responses: thread participants + admin
drop policy if exists resp_select_thread on im_ticket_responses;
create policy resp_select_thread on im_ticket_responses for select
  using (exists (select 1 from im_support_tickets t where t.id = ticket_id
                 and (t.user_id = im_current_profile_id() or im_current_profile_role() = 'admin')));
drop policy if exists resp_insert_thread on im_ticket_responses;
create policy resp_insert_thread on im_ticket_responses for insert
  with check (auth.uid() is not null);

-- chat sessions/messages: guests need to use the bot → allow anon insert/select on own session rows
drop policy if exists chat_sess_anon on im_chat_sessions;
create policy chat_sess_anon on im_chat_sessions for insert
  with check (true);
drop policy if exists chat_msg_anon on im_chat_messages;
create policy chat_msg_anon on im_chat_messages for insert with check (true);
drop policy if exists chat_msg_read on im_chat_messages;
create policy chat_msg_read on im_chat_messages for select using (true);

-- payouts: seller owns, admin manages
drop policy if exists payout_own on im_payouts;
create policy payout_own on im_payouts for all
  using (seller_id = im_current_profile_id() or im_current_profile_role() = 'admin')
  with check (seller_id = im_current_profile_id() or im_current_profile_role() = 'admin');

-- addresses: strict owner
drop policy if exists addr_own on im_addresses;
create policy addr_own on im_addresses for all
  using (user_id = im_current_profile_id()) with check (user_id = im_current_profile_id());

-- consent/activity/newsletter: public insert, admin read
drop policy if exists consent_insert_any on im_consent_logs;
create policy consent_insert_any on im_consent_logs for insert with check (true);
drop policy if exists activity_insert_auth on im_activity_logs;
create policy activity_insert_auth on im_activity_logs for insert with check (true);
drop policy if exists newsletter_insert_any on im_newsletter_subscribers;
create policy newsletter_insert_any on im_newsletter_subscribers for insert with check (true);

-- ── Helper: auto-create profile on signup ─────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into im_profiles (auth_user_id, email, name, role, account_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    case when new.raw_user_meta_data->>'role' in ('buyer','seller') 
         then new.raw_user_meta_data->>'role' else 'buyer' end,
    'active'
  )
  on conflict (email) do update set auth_user_id = excluded.auth_user_id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
