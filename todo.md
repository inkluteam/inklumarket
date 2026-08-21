# PWD Seller – Inclusive Market · Development TODO (Blockout Plan)

> Source: client recommendations (review meetings) + manuscript §5.3 roadmap.
> Legend: `[ ]` pending · `[~]` in progress / partial · `[x]` done
> Priority: **P0** = next batch · P1 = following · P2 = later

---

## ▶ RESUME HERE TOMORROW

1. **Run migration `0003_client_features.sql`** in Supabase SQL Editor (manual step — file is ready in `supabase/migrations/`)
2. **Track D batch**: Accessibility Mode preset · Low-Data Mode · Multi-Language (EN/FIL/Chavacano) · Voice Feedback · Size/Color variants · finish Keyword Filter hooks on listing/review submit
3. **Buyer-side blocklist self-service view** (admin panel done; user-facing list pending)
4. **Hourly peak-time heatmap** — needs order timestamps to accumulate (`createdAt` now recorded)
5. **Track E**: Shipping types/manage/report + Returns Hub
6. Then Tracks F–G (vouchers, group buying, pickup points, QR, bitly)

---

## ⭐ Priority — Audit Log & Financial Records Dashboard (P0) ✅ COMPLETE

> Every money movement and approval action recorded with **Date/Time · Entry No# ·
> Actor · Action (approved/rejected/…) · Total Amount**, visualized over time.

### A. Audit Log upgrade (`/admin/activity-logs`)
- [x] Structured columns: Date & Time, Entry No# (AUD-1001…), Actor, Action, Entity badge, Amount, Details
- [x] Financial actions auto-log with Total Amount (order placed/approved/refunded/cancelled, payouts)
- [x] Filters: entity type + date range + free-text search
- [x] Export CSV
- [x] Data layer: `addActivityLog(action, actor, type, details, amount?)` stores amount + refNo + ISO ts

### B. Financial Records ledger (`/admin/financial-records`)
- [x] Ledger rows: Record No# (FIN-…), Date & Time, Type (Sale/Refund), Method, Amount, Status (pending/approved/completed/refunded/rejected)
- [x] Period selector (Today / Week / Month / Year / All)
- [x] Summary cards: Gross Sales (+MoM % delta) · Net Revenue · Refunds · COD Collected (+ pending value shown in table footer note)
- [x] Approve/reject workflow on pending entries → writes decision back to audit log

### C. Charts, Graphs & Time Analytics
- [x] Real-data Revenue Trend (was hardcoded) with Daily/Weekly/Monthly toggle + area fill
- [x] Orders-by-Day-of-Week bar chart
- [x] Donuts: order status + payment method share; Top sellers bars; category performance bars
- [~] Hourly peak-time heatmap — deferred until order timestamps accumulate (createdAt now saved)
- [x] Comparison mode: month-vs-month % delta badges on Gross Sales card
- [x] Charts have role="img" + aria-labels + text fallbacks

---

## Phase 0 — Foundations

- [x] Supabase schema 0001/0002 applied (tables, RLS, atomic checkout RPC)
- [x] SPA fallback rewrite on Vercel (`vercel.json`) — deep links no longer 404
- [x] Admin Dashboard → Reports link path fixed (`/admin/admin-reports`)
- [x] Admin sidebar grouped: ⚙️ System (top) / 🛒 Commerce / 👥 People & Catalog
- [~] DB migration `0003_client_features.sql` WRITTEN — **awaiting manual SQL Editor run**:
      im_support_tickets + im_ticket_messages · im_notifications · im_blocklist +
      ban/KYC columns on im_profiles · im_wallets + im_wallet_txns · im_vouchers ·
      im_returns · im_pickup_points · im_shipping_methods (seeded) · product options jsonb
      — includes RLS policies + indexes for every table
- [ ] After migration runs: switch ticket/notification/wallet reads to Supabase (optional parity pass)

## Track A — Trust & Safety (P0) ✅ COMPLETE

- [x] **Block System** — buyer blocks/unblocks seller from Messages; blocked sellers' products hidden from Catalog; sending disabled while blocked; audited
- [x] **Ban System** — suspend w/ required reason modal; login rejected showing reason; ban reason visible in User Details; audited
- [~] **Blocklist panel** — admin `/admin/blocklist` w/ names lookup + unblock DONE; buyer self-service list pending
- [x] **ID Verification** — KYC tab in Compliance (approve/reject/reset); seller dashboard verification banner; decisions notify seller + audit log
- [x] **COD Verification** — mandatory confirm checkbox before COD placement
- [ ] **Review Integrity** — no review-submit UI exists yet; when built: delivered-order-only, 1 review/item, moderation link
- [x] **Fraud Detection** — ≥3 orders in 1h by same buyer → audit entry + admin notification
- [x] **Report & Mediation** — "Report this product" → high-priority ticket w/ reason categories → admin Tickets queue

## Track B — Payments & Payouts (P0/P1)

- [x] **Cash on Delivery** — COD method live at checkout (default) + verification step
- [~] **E-wallet Integration** — Maya/GCash provider flows wired at checkout via paymentProviders registry; deep-link sandbox docs pending
- [x] **Seller Wallet** — real computed balance (delivered ×95% − paid − on-hold) in `/seller/payouts`
- [x] **Instant Payout** — ≤ ₱500 auto-approved instantly; larger amounts queued for admin; audited

## Track C — Support & Communication (P0) ✅ COMPLETE

- [x] **Support Ticket Resolution** — buyer create/thread page, admin queue w/ status flow open→in_progress→resolved, replies both ways, notifications on every event
- [x] **Notification Center** — navbar bell w/ unread badge + `/notifications` page; events: tickets, replies, status changes, orders (buyer+seller), fraud alerts, KYC decisions
- [x] **LiveChat Selling Support** — buyer↔seller conversations (pre-purchase) via Messages pages
- [x] **CS Real-Time Chatbot** — IncluBot floating widget: typing indicator, quick topics, human handoff → ticket w/ transcript
- [x] **Contact Support Chatbot** — "Chat with IncluBot" card on Contact page opens same widget
- [x] **SmartChat Concern Routing** — keyword-scored classifier (order/payment/refund/product/seller/account) w/ canned answers; low-confidence or human request → escalation

## Track D — Accessibility & Buyer Experience (P1)

- [ ] **Accessibility Mode** — one-tap profile preset (font+contrast+motion+TTS) saved to prefs
- [ ] **Low-Data Mode** — lazy images, thumbnail quality, disable autoplay sections
- [ ] **Multi-Language Support** — i18n dictionary (EN/FIL/Chavacano), footer switcher
- [ ] **Voice Feedback System** — speak confirmations for add-to-cart/checkout (SpeakButton component exists to build on)
- [~] **Keyword Filter System** — moderation util live on chat sends; listing/review submit hooks pending
- [ ] **Size / Color variants** — optional option sets on products; selected at detail→cart (options jsonb column ready in migration)
- [x] **Only-Available toggle** — "In-stock items only" checkbox in catalog filters

## Track E — Shipping & Fulfillment (P1)

- [ ] **Shipping Types** — pickup / local courier / LBC-J&T selection at checkout (methods seeded in migration)
- [ ] **Shipping Manage** — admin rates/zones screen
- [ ] **Shipping Report** — fulfillment export (lead time, failures) in Reports
- [ ] **Returns Hub** — return request per item → seller approve → admin arbitrate (im_returns table ready)

## Track F — Community Commerce & Seller Enablement (P2)

- [ ] **Group Buying** — join-until-deadline bulk deals
- [ ] **Rural Pickup Points** — barangay pickup at checkout (im_pickup_points ready)
- [ ] **Barangay Storefront** — geo-filtered catalog view (`?brgy=`)
- [ ] **Voucher System** — codes at checkout w/ rules/expiry/usage (im_vouchers ready)
- [ ] **Micro-Seller Onboarding** — 3-step guided wizard
- [ ] **Training Hub** — tutorials section curated by AVRC
- [ ] **Offline Upload Advance** — draft queue offline, sync on reconnect
- [ ] **Greetings Module** — time-aware greeting on dashboards ("Magandang umaga, John!")
- [ ] **Date/Time Standardization** — Asia/Manila helper + relative "2h ago" everywhere

## Track G — Extras (P2)

- [ ] **QR Code Support** — QR per product share + payment reference on receipts
- [ ] **bitly.com Links** — short-link generation via Bitly API

---

## Site & Docs (continuous)

- [x] `/docs` system documentation + deck
- [x] `/format` format guide + deck
- [x] `/manual` manuscript (new TRB format) + defense deck + §5.3 roadmap
- [x] Branding: "PWD Seller - Inclusive Market" + "Zamboanga · Asia's Latin City" (navbar, footer, SEO title)
- [ ] Add each shipped Track feature to: manuscript Ch.4 evidence, docs site features list
- [x] Keep both aliases synced after every deploy (`vercel alias set inclusive-market.vercel.app inklusivemarket.vercel.app`)

## Definition of Done (per feature)

1. Migration + RLS applied (if DB-backed)
2. UI complete for all affected roles (buyer/seller/admin)
3. ARIA labels + keyboard operable + reduced-motion respected
4. `npm run build` clean; lint clean
5. Deployed prod; aliases re-synced; verified by HTTP check
6. Manuscript/docs updated with the new capability
