# Changelog — Inclusive Market

All notable features built from scratch for the Inclusive Market platform.
An accessibility-first e-commerce marketplace empowering PWD entrepreneurs.

Legend:
  + Added a new feature
  x Fixed a bug or issue
  * Updated / Changed existing behavior
  - Removed a feature or deprecated code
  ~ Refactored (no functional change)
  ! Breaking change
  > Performance improvement

---

## [1.0.0] — 2025-07-15

### Platform Foundation
+ Vite + React 19 project scaffolding with Tailwind CSS v4
+ React Router v7 with nested route architecture (public, buyer, seller, admin)
+ Client-side localStorage persistence for all data (products, orders, users, etc.)
+ Deployed on Vercel with auto-build from GitHub

### Authentication & Authorization
+ Email/password registration and login with bcrypt-hashed passwords
+ Google OAuth login integration via Firebase
+ Role-based access control: buyer, seller, admin
+ AuthGuard and GuestGuard route protectors
+ Demo accounts for quick testing (admin, seller, buyer)
+ Forgot password and reset password flows

### User Roles & Profiles
+ Buyer profile page with editable name, email, phone, address
+ Seller registration application with business details
+ Seller verification workflow (admin approval required)
+ User status management (active / suspended by admin)
+ Admin user management panel with search and bulk controls

### Product Catalog
+ Full product catalog with grid and list view modes
+ Smart search with scoring algorithm (name, seller, description, category)
+ Category filtering with product counts
+ Price range filter with min/max inputs and slider
+ Minimum rating filter (All, 3+, 4+, 4.5+ stars)
+ Sort by: Featured, Popular, Newest, Price (low/high), Rating, Name A-Z
+ Active filter badges with individual clear buttons
+ Clear all filters button
+ Product cards with image, badges, seller, rating, price, add-to-cart
+ Featured product badges and low stock warnings on cards
+ Accessibility label badges on product cards

### Product Detail
+ Full product detail page with image, description, specs
+ Star rating display with review count
+ Add to cart with quantity selector
+ Smart recommendation engine (category, price range, seller, rating, reviews)
+ Review submission form with star rating and text comment
+ Review display with user names and dates

### Shopping Cart
+ Per-user cart with localStorage persistence
+ Add, remove, update quantity items in cart
+ Cart item count badge in navbar
+ Subtotal and total calculation
+ Free shipping indicator
+ Empty cart state with link to catalog

### Checkout & Payment
+ Multi-step checkout: Shipping Info > Payment > Confirmation
+ Step indicator with progress bar
+ Form validation for name, address, city, phone
+ Cash on Delivery payment method
+ Bank Transfer payment with instructions (BDO, BPI, UnionBank)
+ PayMongo GCash integration
+ PayMongo Card integration (card number, expiry, CVC)
+ Stripe checkout session integration
+ PayPal order integration
+ Maya payment integration
+ GCash direct payment integration
+ Payment provider enable/disable toggle in admin settings
+ Order confirmation page with email notification status
+ Order ID generation with timestamp-based IDs

### Order Management (Buyer)
+ Buyer orders list with status badges
+ Order detail page with itemized receipt
+ Order status tracker (pending > processing > shipped > delivered)
+ Visual progress bar with step icons
+ Status descriptions for each shipping stage
+ Shipping details display (address, payment method, tracking number)
+ Back to orders navigation

### Order Management (Seller)
+ Seller order management table with all incoming orders
+ Search orders by ID or buyer name
+ Filter orders by status (pending, processing, shipped, delivered)
+ Individual order status advancement buttons
+ + Bulk order status updates with checkbox selection
+ + Select-all / deselect-all checkbox in table header
+ + Bulk action toolbar with status dropdown (processing, shipped, delivered, cancelled)
+ + Visual selection state (highlighted rows)
+ Order table: ID, customer, items, total, payment, status, date, actions

### Messaging & Dispute System
+ Buyer-seller messaging within order detail page
+ Chat-style message thread with sender/receiver bubbles
+ Message/Dispute mode toggle
+ Dispute filing with red ring highlighting and badge
+ Timestamps on all messages
+ Auto-scroll to latest message
+ Read/unread message tracking
+ Toast notifications on message send

### Seller Dashboard
+ Welcome banner with seller name
+ Stats overview: Total Products, Revenue, Orders, Avg Rating
+ Low stock alert banner with product names
+ Monthly Sales Performance bar chart (SVG)
+ Product Listings Activity bar chart (SVG)
+ Recent orders list with status badges
+ My Products list with image, price, stock, reviews
+ Quick links: Products, Orders, Analytics, Payouts
+ + Download Sales Report button (generates .txt file)
+ + Sales report includes: summary, order status breakdown, product listings, order history

### Seller Analytics
+ Revenue Trend line chart (6-month SVG)
+ Revenue by Category donut chart (SVG)
+ Top Products by Reviews horizontal bar chart
+ Category Performance horizontal bar chart
+ Rating Distribution with star breakdown
+ Recent Reviews list
+ Time range filters (7d, 30d, 6m, 1y)

### Seller Products
+ Product listing management (add, edit, delete)
+ Add product form: name, price, category, stock, description, accessibility
+ Edit product modal with pre-filled form
+ Delete product with confirmation
+ Product search within seller's listings
+ Product status tracking (pending approval / approved)

### Seller Payouts
+ Payout request form (amount, method, account details)
+ Payout history table with status badges
+ Bank transfer and GCash payout methods
+ Available balance and pending clearance display
+ Payout receipt generation

### Admin Dashboard
+ Platform stats: Users, Products, Orders, Revenue
+ Revenue breakdown with fees calculation
+ Pending orders count
+ Seller applications pending
+ Suspended users count
+ Low stock alerts across all sellers
+ Smart alerts engine (warnings, info, success, danger)
+ Activity logs timeline

### Admin User Management
+ User list with role, status, join date
+ Search users by name or email
+ Activate / suspend user accounts
+ User role badges (buyer, seller, admin)

### Admin Product Approvals
+ Pending product review queue
+ Approve / reject product listings
+ Product details preview before approval

### Admin Order Management
+ All platform orders table
+ Order status filtering
+ Order details view

### Admin Category Management
+ Add, edit, delete product categories
+ Category icon and description
+ Product count per category

### Admin Transaction Management
+ Transaction history with fees breakdown
+ Revenue, fees, and payout totals

### Admin Reports
+ Platform-wide sales reports
+ Revenue and transaction summaries

### Admin Activity Logs
+ Timestamped activity feed
+ Filter by type: user, product, order, system
+ Activity icons and descriptions

### Admin Settings
+ Platform name and currency configuration
+ Email notification toggles (emailNotifications, orderNotifications)
+ Payment provider management panel:
  - PayMongo (public key, secret key)
  - Stripe (publishable key, secret key)
  - PayPal (client ID, client secret, sandbox/live mode)
  - Maya (public key, secret key)
  - GCash (API key)
+ Gmail configuration status display
+ Provider enable/disable toggles
+ API key input fields with show/hide
+ Save settings with confirmation

### Email Notifications (Gmail Integration)
+ Gmail OAuth2 integration with refresh token
+ Automatic order confirmation emails to buyers
+ Automatic new order notification emails to sellers
+ Branded HTML email templates (buyer and seller versions)
+ Email status tracking on order confirmation page
+ Configurable via environment variables (VITE_GMAIL_CLIENT_ID, etc.)
+ Admin settings page shows Gmail configuration status

### Accessibility System (Full WCAG Support)
+ Accessibility toolbar (floating button, bottom-left corner)
+ 4-tab interface: Display, Speech, Voice, Help

#### Display Settings
+ Adjustable font size (12px — 28px) with preset buttons and +/- controls
+ High contrast mode (increased contrast for low vision)
+ Large cursor mode (enlarged mouse cursor for tracking)
+ Visual alert flash mode (screen flash for deaf/hard-of-hearing users)
+ All settings persisted in localStorage

#### Text-to-Speech
+ Web Speech API text-to-speech integration
+ Adjustable speech rate (0.5x — 2x)
+ Reading mode: hover over elements to hear them read aloud
+ Highlight on read: visual outline on spoken text
+ Read page title button
+ Read page content button
+ Stop speaking button
+ Best voice selection per language (English, Filipino)

#### Voice Commands
+ SpeechRecognition API voice command system
+ Navigation commands: go home, catalog, cart, checkout, orders, profile
+ Page commands: read page, read title, stop speaking
+ Scroll commands: scroll up, scroll down, go to top, go to bottom
+ UI commands: search, open menu, close menu, go back, help
+ Continuous listening mode with auto-restart
+ Listening status indicator (green pulse)
+ Last command display
+ Command not recognized feedback with help suggestion

#### Keyboard Shortcuts
+ Alt+1: Read page title
+ Alt+2: Read page content
+ Alt+3: Read focused element
+ Alt+4: Stop speaking
+ Alt+5: Toggle text-to-speech
+ Alt+6: Toggle voice commands
+ Alt+7: Toggle reading mode
+ Alt+8: Focus search field
+ Alt+9: Toggle high contrast
+ Alt+0: Scroll to top
+ Alt+H: Voice command help
+ Escape: Stop all speech and clear highlights

#### Visual Alerts
+ Full-screen flash overlay for visual notifications
+ Color-coded: success (green), error (red), warning (yellow), info (blue)
+ Large icon + message display
+ Auto-dismiss after 2.5 seconds
+ Respects reduced motion preference

#### Screen Reader Support
+ ARIA labels on all interactive elements
+ aria-live regions for dynamic announcements
+ Skip to main content link
+ Role attributes on dialogs, tabs, switches
+ Screen-reader-only text (.sr-only class)
+ Focus-visible outlines for keyboard navigation

### Navbar
+ Responsive navigation with mobile hamburger menu
+ Cart badge with item count
+ User dropdown with profile, orders, logout
+ Role-based navigation links (buyer, seller, admin)
+ Logo and brand name
+ Search integration

### Footer
+ Site links: About, Contact, Accessibility, Privacy, Terms
+ Social media links
+ Copyright notice
+ PWD Entrepreneurs tagline

### Static Pages
+ About page with mission and team info
+ Contact page with form
+ Accessibility statement page
+ Privacy policy page
+ Terms of service page

### Toast Notifications
+ Success, error, warning, info toast types
+ Auto-dismiss after 3 seconds
+ Stacking support for multiple toasts
+ Close button on each toast
+ Voice announcement integration

### Smart Features
+ Smart search with relevance scoring
+ Smart product recommendations (collaborative filtering)
+ Smart alerts engine for admin dashboard
+ Low stock detection system
+ Trending products algorithm (rating + reviews + featured)
+ New arrivals sorting by date added

### UI/UX
+ Tailwind CSS utility-first styling
+ Custom CSS classes: btn-primary, btn-secondary, btn-outline, card, badge, input-field
+ Hover scale transitions on cards
+ Responsive grid layouts (mobile-first)
+ Loading states and empty states
+ Form validation with error messages
+ Consistent color scheme (blue primary, emerald success, amber warning, red danger)

---

## Tech Stack
+ React 19.2
+ React Router DOM 7.18
+ Tailwind CSS 4.3
+ Vite 6.4
+ Lucide React icons
+ Web Speech API (TTS + SpeechRecognition)
+ Gmail API (OAuth2)
+ PayMongo, Stripe, PayPal, Maya, GCash payment APIs
+ localStorage for client-side persistence
+ Vercel for hosting and deployment
