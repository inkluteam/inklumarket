# IncluMarket â€” Development TODO (Blockout Plan)

> Source: client recommendations (review meetings) + manuscript Â§5.3 roadmap.
> Legend: `[ ]` pending Â· `[~]` in progress Â· `[x]` done
> Priority: **P0** = next batch Â· P1 = following Â· P2 = later

---

## â­ Priority â€” Audit Log & Financial Records Dashboard (P0)

> Fully implemented e-commerce audit trail: every money movement and approval action
> is recorded with **Date/Time Â· Entry No# Â· Actor Â· Action (approved/rejected/â€¦) Â·
> Total Amount**, and visualized in charts/graphs over time.

### A. Audit Log upgrade (`/admin/activity-logs` â†’ structured table)
- [x] Structured columns: `Date & Time`, `Entry No#` (auto-increment ref e.g. AUD-0001),
      `Actor` (name+role), `Action` (approved / rejected / created / updated /
      deleted / paid / refunded / payout / status-change), `Entity` (order/product/user/ticket), `Details`
- [x] Financial actions auto-log: order approved, payment confirmed (COD collected /
      Maya/GCash settled), refund issued, seller payout released â€” each entry carries
      **Total Amount** of the transaction
- [x] Filters: date range, action type, entity type; free-text search
- [x] Export CSV (audit log + financial ledger)
- [x] Data layer: extend `addActivityLog(action, actor, entityType, details, amount?)`
      to store `amount` + `refNo`; backfill from existing orders

### B. Financial Records ledger (new `/admin/financial-records`)
- [x] Every order/payment/payout as a ledger row: Date/Time, Record No#
      (FIN-0001), Type (sale/refund/payout/fee), Method (COD/Maya/GCash/wallet),
      Amount, Status (**pending / approved / completed / refunded**)
- [ ] Running totals row + period selector (today / week / month / year)
- [ ] Summary cards: Gross Sales Â· Refunds Â· Net Revenue Â· COD Collected Â· Pending Payouts
- [x] Approve/reject workflow on pending financial entries (writes back to audit log)

### C. Charts, Graphs & Time Analytics (Reports + Financial pages)
- [x] Custom SVG charts extended in `Reports.jsx` + Financial page \(no new deps\):
      - Line: sales/revenue over time (daily Â· weekly Â· monthly toggle)
      - Bar: revenue by category; top sellers by GMV
      - Donut: orders by status; payments by method share
      - Area: cumulative revenue trend
      - Heatmap/bar-by-hour: peak ordering hours ("time" dimension)
- [ ] Comparison mode: this week vs last week, this month vs last month (% delta badges)
- [ ] All charts keyboard-focusable with aria-labels + text summary fallback

---



## Phase 0 â€” Foundations (do first, unblocks everything)

- [x] Supabase schema 0001/0002 applied (tables, RLS, atomic checkout RPC)
- [x] SPA fallback rewrite on Vercel (`vercel.json`) â€” deep links no longer 404
- [x] Admin Dashboard â†’ Reports link path fixed (`/admin/admin-reports`)
- [~] DB migration `0003_client_features.sql` written â€” awaiting manual SQL Editor run:
      - `im_support_tickets` + `im_ticket_messages`, `im_notifications`
      - `im_blocklist` + ban/KYC columns on `im_profiles`
      - `im_wallets` + `im_wallet_txns`, `im_vouchers`, `im_returns`,
        `im_pickup_points`, `im_shipping_methods` (seeded), product `options jsonb`
      - RLS + indexes on all new tables
      - `im_blocklist(blocker_id, blocked_id, reason, created_at)`
      - `im_user_status` extension â†’ ban fields (`banned_at`, `ban_reason`, `banned_by`)
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

## Track A â€” Trust & Safety (P0)

- [ ] **Block System** â€” block/unblock user; hides their listings from feed & blocks DMs
      
- [ ] **Ban System** â€” admin bans account w/ reason; AuthGuard rejects login; banner shown
      
- [ ] **Blocklist panel** â€” admin view of all blocks; user view of own blocks + unblock
- [ ] **ID Verification** â€” seller KYC status machine: pending â†’ verified/rejected;
      admin verification queue page reusing PWD-ID upload
- [ ] **COD Verification** â€” OTP or confirm-step before COD order placement
- [ ] **Review Integrity** â€” only buyers with delivered order can review; 1 review/order/item;
      duplicate detection; admin moderation queue exists (link it)
- [ ] **Fraud Detection** â€” velocity flags (>N orders/hr, payout anomalies) â†’ `im_audit_logs`
- [ ] **Report & Mediation** â€” report button (listing/user/message) â†’ ticket queue w/ mediation states

## Track B â€” Payments & Payouts (P0/P1)

- [ ] **Cash on Delivery** â€” payment method `cod`; order flagged; collected-on-delivery workflow
      files: `Checkout.jsx`, provider registry, order badges
- [ ] **E-wallet Integration** â€” direct GCash/Maya deep-link flows (documented sandbox first)
- [ ] **Seller Wallet** â€” balance accrues on delivered orders (`im_wallets`); wallet page in SellerLayout
- [ ] **Instant Payout** â€” withdraw from wallet when balance â‰¥ threshold; auto-approval rule

## Track C â€” Support & Communication (P0)

- [ ] **Support Ticket Resolution** â€” full lifecycle openâ†’assignedâ†’resolvedâ†’closed,
      SLA due dates, buyer/seller/admin ticket pages, thread messages
- [ ] **Notification Center** â€” bell icon + `/notifications` page; rows written on
      order/approval/payout/ticket events; mark-as-read
- [ ] **LiveChat Selling Support** â€” pre-purchase buyerâ†”seller chat (reuse im_chat_sessions)
- [ ] **CS Real-Time Chatbot** â€” scripted FAQ bot; handoff creates support ticket
- [ ] **Contact Support Chatbot** â€” same bot embedded on Contact page
- [ ] **SmartChat Concern Routing** â€” classify concern (order/payment/product/account)
      via keyword match â†’ route to right queue/template

## Track D â€” Accessibility & Buyer Experience (P1)

- [ ] **Accessibility Mode** â€” one-tap profile preset (font+contrast+motion+TTS) saved to prefs
- [ ] **Low-Data Mode** â€” toggle: lazy images, thumbnail quality, disable autoplay sections
- [ ] **Multi-Language Support** â€” i18n dictionary (EN/FIL/Chavacano), language switcher in footer
- [ ] **Voice Feedback System** â€” speak confirmations for add-to-cart/checkout actions
- [ ] **Keyword Filter System** â€” banned-word list checked on listing/review/chat submit
- [ ] **Size / Color variants** â€” optional option sets on products; selected at detailâ†’cart
- [ ] **Only-Available toggle** â€” catalog filter switch hiding out-of-stock

## Track E â€” Shipping & Fulfillment (P1)

- [ ] **Shipping Types** â€” pickup / local courier / LBC-J&T placeholders at checkout
- [ ] **Shipping Manage** â€” admin rates/zones screen; methods table seeded
- [ ] **Shipping Report** â€” fulfillment export (lead time, failures) in Reports page
- [ ] **Returns Hub** â€” return request per item â†’ seller approve â†’ admin arbitrate; status emails

## Track F â€” Community Commerce & Seller Enablement (P2)

- [ ] **Group Buying** â€” batch deals: join-until-deadline â†’ single bulk order to seller
- [ ] **Rural Pickup Points** â€” barangay pickup selection at checkout (im_pickup_points)
- [ ] **Barangay Storefront** â€” geo-filtered catalog view (`?brgy=`)
- [ ] **Voucher System** â€” codes at checkout; validation vs rules/expiry/usage
- [ ] **Micro-Seller Onboarding** â€” 3-step guided wizard for first-time sellers
- [ ] **Training Hub** â€” static tutorial section (videos/PDFs) curated by AVRC
- [ ] **Offline Upload Advance** â€” queue drafts offline (localStorage), sync on reconnect
- [ ] **Greetings Module** â€” time-aware greeting on dashboards ("Magandang umaga, John!")
- [ ] **Date/Time Standardization** â€” Asia/Manila tz helper + relative "2h ago" everywhere

## Track G â€” Extras (P2)

- [ ] **QR Code Support** â€” QR per product (share) + QR payments reference on receipts
- [ ] **bitly.com Links** â€” short-link generation for product shares via Bitly API

---

## Site & Docs (continuous)

- [x] `/docs` system documentation + deck
- [x] `/format` format guide + deck
- [x] `/manual` manuscript (new TRB format) + defense deck + Â§5.3 roadmap
- [ ] Add each shipped Track feature to: manuscript Ch.4 evidence, docs site features list
- [ ] Keep both aliases synced after every deploy (`vercel alias set â€¦ inklusivemarketâ€¦`)

## Definition of Done (per feature)

1. Migration + RLS applied (if DB-backed)
2. UI complete for all affected roles (buyer/seller/admin)
3. ARIA labels + keyboard operable + reduced-motion respected
4. `npm run build` clean; lint clean
5. Deployed prod; aliases re-synced; verified by HTTP check
6. Manuscript/docs updated with the new capability
