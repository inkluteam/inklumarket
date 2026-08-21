# IncluMarket — Development TODO (Blockout Plan)

> Source: client recommendations (review meetings) + manuscript §5.3 roadmap.
> Legend: `[ ]` pending · `[~]` in progress · `[x]` done
> Priority: **P0** = next batch · P1 = following · P2 = later

---

## ⭐ Priority — Audit Log & Financial Records Dashboard (P0)

> Fully implemented e-commerce audit trail: every money movement and approval action
> is recorded with **Date/Time · Entry No# · Actor · Action (approved/rejected/…) ·
> Total Amount**, and visualized in charts/graphs over time.

### A. Audit Log upgrade (`/admin/activity-logs` → structured table)
- [ ] Structured columns: `Date & Time`, `Entry No#` (auto-increment ref e.g. AUD-0001),
      `Actor` (name+role), `Action` (approved / rejected / created / updated /
      deleted / paid / refunded / payout / status-change), `Entity` (order/product/user/ticket), `Details`
- [ ] Financial actions auto-log: order approved, payment confirmed (COD collected /
      Maya/GCash settled), refund issued, seller payout released — each entry carries
      **Total Amount** of the transaction
- [ ] Filters: date range, action type, entity type, actor; free-text search
- [ ] Export CSV / print-friendly view
- [ ] Data layer: extend `addActivityLog(action, actor, entityType, details, amount?)`
      to store `amount` + `refNo`; backfill from existing orders

### B. Financial Records ledger (new `/admin/financial-records`)
- [ ] Every order/payment/payout as a ledger row: Date/Time, Record No#
      (FIN-0001), Type (sale/refund/payout/fee), Method (COD/Maya/GCash/wallet),
      Amount, Status (**pending / approved / completed / refunded**)
- [ ] Running totals row + period selector (today / week / month / year)
- [ ] Summary cards: Gross Sales · Refunds · Net Revenue · COD Collected · Pending Payouts
- [ ] Approve/reject workflow on pending financial entries (writes back to audit log)

### C. Charts, Graphs & Time Analytics (Reports + Financial pages)
- [ ] Extend existing custom SVG charts in `Reports.jsx` (no new deps):
      - Line: sales/revenue over time (daily · weekly · monthly toggle)
      - Bar: revenue by category; top sellers by GMV
      - Donut: orders by status; payments by method share
      - Area: cumulative revenue trend
      - Heatmap/bar-by-hour: peak ordering hours ("time" dimension)
- [ ] Comparison mode: this week vs last week, this month vs last month (% delta badges)
- [ ] All charts keyboard-focusable with aria-labels + text summary fallback

---



## Phase 0 — Foundations (do first, unblocks everything)

- [x] Supabase schema 0001/0002 applied (tables, RLS, atomic checkout RPC)
- [x] SPA fallback rewrite on Vercel (`vercel.json`) — deep links no longer 404
- [x] Admin Dashboard → Reports link path fixed (`/admin/admin-reports`)
- [~] DB migration `0003_client_features.sql` written — awaiting manual SQL Editor run:
      - `im_support_tickets` + `im_ticket_messages`, `im_notifications`
      - `im_blocklist` + ban/KYC columns on `im_profiles`
      - `im_wallets` + `im_wallet_txns`, `im_vouchers`, `im_returns`,
        `im_pickup_points`, `im_shipping_methods` (seeded), product `options jsonb`
      - RLS + indexes on all new tables
      - `im_blocklist(blocker_id, blocked_id, reason, created_at)`
      - `im_user_status` extension → ban fields (`banned_at`, `ban_reason`, `banned_by`)
      - `im_support_tickets(id, user_id, subject, category, priority, status, sla_due_at)` +
        `im_ticket_messages(ticket_id, sender_role, body, created_at)`
      - `im_wallets(user_id, balance)` + `im_wallet_txns(wallet_id, type, amount, ref)`
      - `im_vouchers(code, discount_type, value, rules, expires_at, usage_limit, used_count)`
      - `im_returns(return_id, order_item_id, reason, status, resolution)`
      - `im_pickup_points(barangay, name, handler, schedule)`
      - `im_shipping_methods(name, type, base_rate, zones)` + per-order shipping snapshot cols
      - product option columns: `options jsonb` (size/color) on `im_products`
      - `im_notifications(user_id, type, payload, read_at)`
- [ ] RLS policies for every new table + indexes on FK columns

## Track A — Trust & Safety (P0)

- [ ] **Block System** — block/unblock user; hides their listings from feed & blocks DMs
      files: `db.js (blockUser/unblockUser/isBlocked)`, ProductCard filter, Messages guard
- [ ] **Ban System** — admin bans account w/ reason; AuthGuard rejects login; banner shown
      files: `Admin Users.jsx`, `AuthContext`, login flow
- [ ] **Blocklist panel** — admin view of all blocks; user view of own blocks + unblock
- [ ] **ID Verification** — seller KYC status machine: pending → verified/rejected;
      admin verification queue page reusing PWD-ID upload
- [ ] **COD Verification** — OTP or confirm-step before COD order placement
- [ ] **Review Integrity** — only buyers with delivered order can review; 1 review/order/item;
      duplicate detection; admin moderation queue exists (link it)
- [ ] **Fraud Detection** — velocity flags (>N orders/hr, payout anomalies) → `im_audit_logs`
- [ ] **Report & Mediation** — report button (listing/user/message) → ticket queue w/ mediation states

## Track B — Payments & Payouts (P0/P1)

- [ ] **Cash on Delivery** — payment method `cod`; order flagged; collected-on-delivery workflow
      files: `Checkout.jsx`, provider registry, order badges
- [ ] **E-wallet Integration** — direct GCash/Maya deep-link flows (documented sandbox first)
- [ ] **Seller Wallet** — balance accrues on delivered orders (`im_wallets`); wallet page in SellerLayout
- [ ] **Instant Payout** — withdraw from wallet when balance ≥ threshold; auto-approval rule

## Track C — Support & Communication (P0)

- [ ] **Support Ticket Resolution** — full lifecycle open→assigned→resolved→closed,
      SLA due dates, buyer/seller/admin ticket pages, thread messages
- [ ] **Notification Center** — bell icon + `/notifications` page; rows written on
      order/approval/payout/ticket events; mark-as-read
- [ ] **LiveChat Selling Support** — pre-purchase buyer↔seller chat (reuse im_chat_sessions)
- [ ] **CS Real-Time Chatbot** — scripted FAQ bot; handoff creates support ticket
- [ ] **Contact Support Chatbot** — same bot embedded on Contact page
- [ ] **SmartChat Concern Routing** — classify concern (order/payment/product/account)
      via keyword match → route to right queue/template

## Track D — Accessibility & Buyer Experience (P1)

- [ ] **Accessibility Mode** — one-tap profile preset (font+contrast+motion+TTS) saved to prefs
- [ ] **Low-Data Mode** — toggle: lazy images, thumbnail quality, disable autoplay sections
- [ ] **Multi-Language Support** — i18n dictionary (EN/FIL/Chavacano), language switcher in footer
- [ ] **Voice Feedback System** — speak confirmations for add-to-cart/checkout actions
- [ ] **Keyword Filter System** — banned-word list checked on listing/review/chat submit
- [ ] **Size / Color variants** — optional option sets on products; selected at detail→cart
- [ ] **Only-Available toggle** — catalog filter switch hiding out-of-stock

## Track E — Shipping & Fulfillment (P1)

- [ ] **Shipping Types** — pickup / local courier / LBC-J&T placeholders at checkout
- [ ] **Shipping Manage** — admin rates/zones screen; methods table seeded
- [ ] **Shipping Report** — fulfillment export (lead time, failures) in Reports page
- [ ] **Returns Hub** — return request per item → seller approve → admin arbitrate; status emails

## Track F — Community Commerce & Seller Enablement (P2)

- [ ] **Group Buying** — batch deals: join-until-deadline → single bulk order to seller
- [ ] **Rural Pickup Points** — barangay pickup selection at checkout (im_pickup_points)
- [ ] **Barangay Storefront** — geo-filtered catalog view (`?brgy=`)
- [ ] **Voucher System** — codes at checkout; validation vs rules/expiry/usage
- [ ] **Micro-Seller Onboarding** — 3-step guided wizard for first-time sellers
- [ ] **Training Hub** — static tutorial section (videos/PDFs) curated by AVRC
- [ ] **Offline Upload Advance** — queue drafts offline (localStorage), sync on reconnect
- [ ] **Greetings Module** — time-aware greeting on dashboards ("Magandang umaga, John!")
- [ ] **Date/Time Standardization** — Asia/Manila tz helper + relative "2h ago" everywhere

## Track G — Extras (P2)

- [ ] **QR Code Support** — QR per product (share) + QR payments reference on receipts
- [ ] **bitly.com Links** — short-link generation for product shares via Bitly API

---

## Site & Docs (continuous)

- [x] `/docs` system documentation + deck
- [x] `/format` format guide + deck
- [x] `/manual` manuscript (new TRB format) + defense deck + §5.3 roadmap
- [ ] Add each shipped Track feature to: manuscript Ch.4 evidence, docs site features list
- [ ] Keep both aliases synced after every deploy (`vercel alias set … inklusivemarket…`)

## Definition of Done (per feature)

1. Migration + RLS applied (if DB-backed)
2. UI complete for all affected roles (buyer/seller/admin)
3. ARIA labels + keyboard operable + reduced-motion respected
4. `npm run build` clean; lint clean
5. Deployed prod; aliases re-synced; verified by HTTP check
6. Manuscript/docs updated with the new capability
