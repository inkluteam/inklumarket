-- 0003_client_features.sql — IncluMarket Phase 0 + P0 batch
-- Run in Supabase SQL Editor (idempotent).

-- ─── Support Tickets (server-side parity for localStorage flow) ──────────────
create table if not exists im_support_tickets (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  user_name   text,
  subject     text not null,
  description text not null,
  priority    text not null default 'normal' check (priority in ('low','normal','high')),
  status      text not null default 'open' check (status in ('open','in_progress','resolved')),
  admin_note  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);
create table if not exists im_ticket_messages (
  id         bigserial primary key,
  ticket_id  text not null references im_support_tickets(id) on delete cascade,
  author_id  uuid not null references auth.users(id) on delete cascade,
  author_name text,
  is_admin   boolean not null default false,
  body       text not null,
  sent_at    timestamptz not null default now()
);
create index if not exists idx_tickets_user on im_support_tickets(user_id);
create index if not exists idx_tmsgs_ticket on im_ticket_messages(ticket_id);

alter table im_support_tickets enable row level security;
alter table im_ticket_messages enable row level security;
drop policy if exists "own tickets" on im_support_tickets;
create policy "own tickets" on im_support_tickets
  for all using (auth.uid() = user_id or exists (select 1 from public.im_profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (auth.uid() = user_id or exists (select 1 from public.im_profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "ticket thread" on im_ticket_messages;
create policy "ticket thread" on im_ticket_messages
  for all using (
    exists (select 1 from im_support_tickets t where t.id = ticket_id and (t.user_id = auth.uid()
      or exists (select 1 from public.im_profiles p where p.id = auth.uid() and p.role = 'admin')))
  ) with check (
    exists (select 1 from im_support_tickets t where t.id = ticket_id and (t.user_id = auth.uid()
      or exists (select 1 from public.im_profiles p where p.id = auth.uid() and p.role = 'admin')))
  );

-- ─── Notifications ────────────────────────────────────────────────────────────
create table if not exists im_notifications (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null default 'system' check (type in ('ticket','order','product','system')),
  message    text not null,
  link       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notif_user on im_notifications(user_id, created_at desc);
alter table im_notifications enable row level security;
drop policy if exists "own notifications" on im_notifications;
create policy "own notifications" on im_notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Blocklist & Ban ──────────────────────────────────────────────────────────
create table if not exists im_blocklist (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  reason     text,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
alter table im_blocklist enable row level security;
drop policy if exists "own blocklist" on im_blocklist;
create policy "own blocklist" on im_blocklist
  for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);
drop policy if exists "read blocks affecting me" on im_blocklist;
create policy "read blocks affecting me" on im_blocklist
  for select using (auth.uid() = blocker_id or auth.uid() = blocked_id);

alter table im_profiles add column if not exists banned_at timestamptz;
alter table im_profiles add column if not exists ban_reason text;
alter table im_profiles add column if not exists kyc_status text default 'none'
  check (kyc_status in ('none','pending','verified','rejected'));
alter table im_profiles add column if not exists kyc_doc_url text;

-- ─── Wallets & Payouts ────────────────────────────────────────────────────────
create table if not exists im_wallets (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  balance    numeric(12,2) not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);
create table if not exists im_wallet_txns (
  id        bigserial primary key,
  wallet_id uuid not null references im_wallets(user_id) on delete cascade,
  type      text not null check (type in ('credit','debit','payout')),
  amount    numeric(12,2) not null check (amount > 0),
  ref       text,
  created_at timestamptz not null default now()
);
alter table im_wallets enable row level security;
alter table im_wallet_txns enable row level security;
drop policy if exists "own wallet" on im_wallets;
create policy "own wallet" on im_wallets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own wallet txns" on im_wallet_txns;
create policy "own wallet txns" on im_wallet_txns
  for select using (auth.uid() = wallet_id);

-- ─── Vouchers / Returns / Pickup Points / Shipping Methods / Options ─────────
create table if not exists im_vouchers (
  code         text primary key,
  discount_type text not null check (discount_type in ('percent','fixed')),
  value        numeric(12,2) not null check (value > 0),
  min_spend    numeric(12,2) default 0,
  expires_at   timestamptz,
  usage_limit  int,
  used_count   int not null default 0,
  active       boolean not null default true,
  created_by   uuid references auth.users(id)
);
create table if not exists im_returns (
  id            bigserial primary key,
  order_item_id bigint not null references im_order_items(id) on delete cascade,
  requester_id  uuid not null references auth.users(id) on delete cascade,
  reason        text not null,
  status        text not null default 'requested'
                check (status in ('requested','approved','rejected','completed')),
  resolution    text,
  created_at    timestamptz not null default now()
);
create table if not exists im_pickup_points (
  id       bigserial primary key,
  barangay text not null,
  name     text not null,
  handler  text,
  schedule text,
  active   boolean not null default true
);
create table if not exists im_shipping_methods (
  id        bigserial primary key,
  name      text not null,
  type      text not null check (type in ('pickup','courier','lbc','jt')),
  base_rate numeric(10,2) not null default 0,
  zones     jsonb default '[]',
  active    boolean not null default true
);
insert into im_shipping_methods (name, type, base_rate)
select * from (values ('Barangay Pickup','pickup',0), ('Local Courier','courier',80), ('LBC Express','lbc',150), ('J&T Express','jt',120)) v
where not exists (select 1 from im_shipping_methods);

alter table im_products add column if not exists options jsonb default '[]';

alter table im_vouchers enable row level security; alter table im_returns enable row level security;
alter table im_pickup_points enable row level security; alter table im_shipping_methods enable row level security;

-- ─── COD flag on orders ───────────────────────────────────────────────────────
alter table im_orders add column if not exists payment_method text default 'Maya';
