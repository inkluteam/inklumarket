-- IncluMarket — Full Schema Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/pzacrgfuhdllujuqebkr/sql
-- All tables use im_ prefix to share the Supabase project safely.

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
  location        text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists idx_im_profiles_auth_user_id on im_profiles(auth_user_id);
create index if not exists idx_im_profiles_role on im_profiles(role);

-- ── 2. Categories ─────────────────────────────────────────────
create table if not exists im_categories (
  id           text primary key,
  name         text not null,
  icon         text,
  description  text,
  product_count int default 0,
  created_at   timestamptz default now()
);

-- ── 3. Products ───────────────────────────────────────────────
create table if not exists im_products (
  id           bigint generated always as identity primary key,
  seller_id    bigint references im_profiles(id) on delete cascade,
  category_id  text references im_categories(id) on delete set null,
  title        text not null,
  description  text,
  base_price   numeric(10,2) not null,
  stock        int not null default 0,
  status       text not null default 'pending_review' check (status in ('pending_review','approved','flagged')),
  is_featured  boolean default false,
  accessibility text,
  image_url    text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create index if not exists idx_im_products_seller_id on im_products(seller_id);
create index if not exists idx_im_products_status on im_products(status);
create index if not exists idx_im_products_category_id on im_products(category_id);

-- ── 4. Product Variants ───────────────────────────────────────
create table if not exists im_product_variants (
  id          bigint generated always as identity primary key,
  product_id  bigint references im_products(id) on delete cascade,
  sku_code    text unique,
  color_name  text,
  size        text,
  stock_qty   int not null default 0,
  price_mod   numeric(10,2) default 0,
  created_at  timestamptz default now()
);
create index if not exists idx_im_variants_product on im_product_variants(product_id);

-- ── 5. Product Images ─────────────────────────────────────────
create table if not exists im_product_images (
  id          bigint generated always as identity primary key,
  product_id  bigint references im_products(id) on delete cascade,
  url         text not null,
  is_primary  boolean default false,
  created_at  timestamptz default now()
);

-- ── 6. Orders ─────────────────────────────────────────────────
create table if not exists im_orders (
  id               bigint generated always as identity primary key,
  order_ref        text unique default ('ORD-' || floor(random()*900000+100000)::text),
  buyer_id         bigint references im_profiles(id) on delete set null,
  total_amount     numeric(10,2) not null,
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

-- ── 7. Order Items ────────────────────────────────────────────
create table if not exists im_order_items (
  id          bigint generated always as identity primary key,
  order_id    bigint references im_orders(id) on delete cascade,
  product_id  bigint references im_products(id) on delete set null,
  variant_id  bigint references im_product_variants(id) on delete set null,
  quantity    int not null,
  unit_price  numeric(10,2) not null,
  created_at  timestamptz default now()
);
create index if not exists idx_im_items_order on im_order_items(order_id);

-- ── 8. Product Reviews ────────────────────────────────────────
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

-- ── 9. Wishlist ───────────────────────────────────────────────
create table if not exists im_wishlist (
  id          bigint generated always as identity primary key,
  user_id     bigint references im_profiles(id) on delete cascade,
  product_id  bigint references im_products(id) on delete cascade,
  added_at    timestamptz default now(),
  unique(user_id, product_id)
);

-- ── 10. Flash Sales ───────────────────────────────────────────
create table if not exists im_flash_sales (
  id               bigint generated always as identity primary key,
  product_id       bigint references im_products(id) on delete cascade,
  discount_percent numeric(5,2) not null,
  starts_at        timestamptz not null,
  ends_at          timestamptz not null,
  created_at       timestamptz default now()
);

-- ── 11. Conversations ─────────────────────────────────────────
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

-- ── 12. Messages ──────────────────────────────────────────────
create table if not exists im_messages (
  id               bigint generated always as identity primary key,
  conversation_id  bigint references im_conversations(id) on delete cascade,
  sender_id        bigint references im_profiles(id) on delete set null,
  body             text not null,
  read_at          timestamptz,
  created_at       timestamptz default now()
);
create index if not exists idx_im_messages_conv on im_messages(conversation_id);

-- ── 13. Support Tickets ───────────────────────────────────────
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

-- ── 14. Ticket Responses ──────────────────────────────────────
create table if not exists im_ticket_responses (
  id          bigint generated always as identity primary key,
  ticket_id   bigint references im_support_tickets(id) on delete cascade,
  author_id   bigint references im_profiles(id) on delete set null,
  message     text not null,
  created_at  timestamptz default now()
);

-- ── 15. Notifications ─────────────────────────────────────────
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

-- ── 16. Chat Sessions ─────────────────────────────────────────
create table if not exists im_chat_sessions (
  id                  bigint generated always as identity primary key,
  user_id             bigint references im_profiles(id) on delete set null,
  guest_id            text,
  status              text not null default 'open' check (status in ('open','escalated','closed')),
  escalated_ticket_id bigint references im_support_tickets(id) on delete set null,
  created_at          timestamptz default now()
);

-- ── 17. Chat Messages ─────────────────────────────────────────
create table if not exists im_chat_messages (
  id          bigint generated always as identity primary key,
  session_id  bigint references im_chat_sessions(id) on delete cascade,
  role        text not null check (role in ('user','bot','agent')),
  body        text not null,
  created_at  timestamptz default now()
);

-- ── 18. Payouts ───────────────────────────────────────────────
create table if not exists im_payouts (
  id          bigint generated always as identity primary key,
  payout_ref  text unique default ('PAY-' || floor(random()*900000+100000)::text),
  seller_id   bigint references im_profiles(id) on delete set null,
  amount      numeric(10,2) not null,
  method      text not null,
  account_name text,
  status      text not null default 'pending' check (status in ('pending','approved','completed','rejected')),
  admin_note  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists idx_im_payouts_seller on im_payouts(seller_id);

-- ── 19. Transactions ──────────────────────────────────────────
create table if not exists im_transactions (
  id              bigint generated always as identity primary key,
  order_id        bigint references im_orders(id) on delete set null,
  provider_id     text references im_payment_providers(id) on delete set null,
  amount          numeric(10,2) not null,
  platform_fee    numeric(10,2) default 0,
  seller_payout   numeric(10,2) default 0,
  currency        text default 'PHP',
  status          text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  created_at      timestamptz default now()
);

-- ── 20. Payment Providers ─────────────────────────────────────
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

-- ── Bonus: Newsletter Subscribers ────────────────────────────
create table if not exists im_newsletter_subscribers (
  id              bigint generated always as identity primary key,
  email           text unique not null,
  user_id         bigint references im_profiles(id) on delete set null,
  active          boolean default true,
  subscribed_at   timestamptz default now(),
  unsubscribed_at timestamptz
);

-- ── Bonus: Addresses ──────────────────────────────────────────
create table if not exists im_addresses (
  id           bigint generated always as identity primary key,
  user_id      bigint references im_profiles(id) on delete cascade,
  label        text,
  full_name    text,
  phone        text,
  line1        text not null,
  line2        text,
  city         text not null,
  province     text,
  postal_code  text,
  is_default   boolean default false,
  created_at   timestamptz default now()
);

-- ── Bonus: Theme Settings (singleton) ────────────────────────
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
values ('#0047AB','#C8102E','#FFD700')
on conflict do nothing;

-- ── Row Level Security ────────────────────────────────────────
alter table im_profiles           enable row level security;
alter table im_products           enable row level security;
alter table im_orders             enable row level security;
alter table im_order_items        enable row level security;
alter table im_product_reviews    enable row level security;
alter table im_wishlist           enable row level security;
alter table im_conversations      enable row level security;
alter table im_messages           enable row level security;
alter table im_notifications      enable row level security;
alter table im_support_tickets    enable row level security;
alter table im_payouts            enable row level security;
alter table im_addresses          enable row level security;

-- Profiles: users read own, admin reads all
create policy "profiles_select_own" on im_profiles for select using (auth.uid() = auth_user_id);
create policy "profiles_update_own" on im_profiles for update using (auth.uid() = auth_user_id);

-- Products: anyone can read approved, sellers manage own
create policy "products_select_approved" on im_products for select using (status = 'approved' or auth.uid() is not null);
create policy "products_insert_seller"   on im_products for insert with check (auth.uid() is not null);
create policy "products_update_seller"   on im_products for update using (auth.uid() is not null);

-- Orders: buyers see own
create policy "orders_select_own" on im_orders for select using (
  buyer_id = (select id from im_profiles where auth_user_id = auth.uid() limit 1)
);
create policy "orders_insert_own" on im_orders for insert with check (auth.uid() is not null);

-- Wishlist: own only
create policy "wishlist_own" on im_wishlist for all using (
  user_id = (select id from im_profiles where auth_user_id = auth.uid() limit 1)
);

-- Notifications: own only
create policy "notif_own" on im_notifications for all using (
  user_id = (select id from im_profiles where auth_user_id = auth.uid() limit 1)
);

-- Reviews: anyone reads, authenticated inserts
create policy "reviews_select_all"  on im_product_reviews for select using (true);
create policy "reviews_insert_auth" on im_product_reviews for insert with check (auth.uid() is not null);

-- Conversations: participants only
create policy "conv_own" on im_conversations for all using (
  buyer_id  = (select id from im_profiles where auth_user_id = auth.uid() limit 1) or
  seller_id = (select id from im_profiles where auth_user_id = auth.uid() limit 1)
);

-- Messages: participants only
create policy "msg_own" on im_messages for all using (
  conversation_id in (
    select id from im_conversations where
      buyer_id  = (select id from im_profiles where auth_user_id = auth.uid() limit 1) or
      seller_id = (select id from im_profiles where auth_user_id = auth.uid() limit 1)
  )
);

-- Tickets: own
create policy "ticket_own" on im_support_tickets for all using (
  user_id = (select id from im_profiles where auth_user_id = auth.uid() limit 1)
);

-- Payouts: seller sees own
create policy "payout_own" on im_payouts for all using (
  seller_id = (select id from im_profiles where auth_user_id = auth.uid() limit 1)
);

-- Addresses: own only
create policy "addr_own" on im_addresses for all using (
  user_id = (select id from im_profiles where auth_user_id = auth.uid() limit 1)
);

-- ── Helper: auto-create profile on signup ────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into im_profiles (auth_user_id, email, name, role, account_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'role', 'buyer'),
    'active'
  )
  on conflict (email) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
