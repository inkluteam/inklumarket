# Inclusive Market

A smart e-commerce web application for products of Persons with Disabilities (PWDs) at Area Vocational Rehabilitation Center (AVRC) Region IX. Capstone project for PWD-led enterprises marketplace.

## Tech Stack

```
Frontend:       React 19, Vite 8
Styling:        Tailwind CSS 4
Routing:        React Router DOM 7
Icons:          Lucide React
Linting:        OxLint
State:          React Context + localStorage
Payments:       PayMongo, Stripe, PayPal, Maya, GCash (multi-provider)
```

## Smart Features

```
Smart Search              Real-time autocomplete with product name, seller, and description matching.
                          Shows suggestions as you type.

Smart Recommendations     "You Might Also Like" section on product pages using category and
                          rating-based matching algorithms.

Smart Analytics           Dynamic dashboard statistics computed from actual transaction data,
                          not hardcoded values.

Smart Alerts              Low stock warnings for sellers, pending order notifications, and
                          suspended user alerts for admins.

Dynamic Notifications     Toast notification system for all user actions (CRUD operations,
                          order status changes, etc.).

Accessibility Toolbar     Floating accessibility panel with font size adjustment (12-24px),
                          high contrast mode, TTS, voice commands, and reading mode.

Voice Commands            Hands-free navigation using speech recognition — "search", "go to cart",
                          "go home", and more.

Role-Based Access Control AuthGuard route protection ensuring only authorized users access
                          admin/seller/buyer panels.

Multi-Provider Payments   Configurable payment gateway supporting PayMongo, Stripe, PayPal,
                          Maya, and GCash — each togglable from admin settings.

Per-User Cart             Shopping cart scoped to each logged-in user. Anonymous users share
                          a temporary cart. Carts persist via localStorage.

Wishlist                  Heart toggle on product pages to save favorites, stored per-user
                          in localStorage.
```

## Project Structure

```
inclusive-market/
├── public/                          # Static assets (images, icons)
├── src/
│   ├── assets/                      # CSS, images
│   ├── components/                  # Shared UI components
│   │   ├── Layout.jsx               # Public page layout (navbar + footer)
│   │   ├── AdminLayout.jsx          # Admin sidebar layout
│   │   ├── SellerLayout.jsx         # Seller sidebar layout
│   │   ├── Navbar.jsx               # Nav with smart search autocomplete
│   │   ├── Footer.jsx               # Site footer
│   │   ├── AuthGuard.jsx            # Route protection (RBAC)
│   │   ├── AccessibilityToolbar.jsx # Font size, contrast, TTS, voice commands
│   │   └── VisualAlert.jsx          # Flash alerts for accessibility
│   ├── context/                     # React Context providers
│   │   ├── AuthContext.jsx           # Authentication, registration, session persistence
│   │   ├── CartContext.jsx           # Per-user shopping cart (localStorage)
│   │   ├── DataStore.jsx            # Central data store with CRUD operations
│   │   ├── SettingsContext.jsx       # Platform settings, currency formatting
│   │   ├── VoiceContext.jsx          # TTS, speech recognition, reading mode
│   │   └── ToastContext.jsx          # Toast notification system
│   ├── services/                    # External service integrations
│   │   ├── paymentProviders.js      # Unified config for 5 payment providers
│   │   ├── paymongoService.js       # PayMongo API integration
│   │   ├── stripeService.js         # Stripe API integration
│   │   ├── paypalService.js         # PayPal API integration
│   │   ├── mayaService.js           # Maya/PayMaya API integration
│   │   ├── gcashService.js          # GCash API integration
│   │   ├── gmailService.js          # Gmail email service
│   │   └── googleAuth.js            # Google OAuth integration
│   ├── data/
│   │   └── mockData.js              # Initial demo data (users, products, sellers, etc.)
│   ├── pages/
│   │   ├── Home.jsx                 # Landing page with featured products
│   │   ├── Catalog.jsx              # Product browsing with filters/search
│   │   ├── ProductDetail.jsx        # Product detail + reviews + wishlist + recommendations
│   │   ├── NotFound.jsx             # 404 page
│   │   ├── auth/                    # Login, Register, ForgotPassword, RegisterSeller
│   │   ├── buyer/                   # Cart, Checkout, Orders, OrderDetail, Profile
│   │   ├── seller/                  # Dashboard, Products (CRUD), Orders, Analytics, Payouts
│   │   ├── admin/                   # Dashboard, Users, Categories, Approvals, Orders,
│   │   │                            # Transactions, Reports, Activity Logs, Settings
│   │   └── static/                  # About, Contact, Accessibility, Privacy, Terms
│   ├── App.jsx                      # Route definitions with AuthGuard
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles + accessibility styles
├── index.html
├── package.json
└── vite.config.js
```

## User Roles

```
Admin   Full platform management: users, categories, product approvals, orders,
        transactions, reports, activity logs, payment provider settings.

Seller  Product CRUD management, order fulfillment with status updates,
        analytics, payouts (request + export CSV), PWD ID verification.

Buyer   Browse catalog, shopping cart (per-user), multi-step checkout with
        dynamic payment methods, order history, wishlist, profile management.
```

## Key Features

### Buyer Features
```
- Product catalog with category filter, text search, and sort options
- Per-user shopping cart with quantity management (persisted in localStorage)
- Wishlist heart toggle on product pages (persisted per-user)
- Multi-step checkout with form validation (Shipping → Payment → Confirm)
- Dynamic payment method selection from configured providers (PayMongo, Stripe, PayPal, Maya, GCash)
- Order history with status timeline tracking
- Product reviews and ratings display
- Smart product recommendations ("You Might Also Like")
- Profile management with save (syncs to auth context)
```

### Seller Features
```
- Seller dashboard with computed stats and low stock alerts
- Full product CRUD (Add, Edit, Delete with confirmation)
- Order management with status updates (Pending → Processing → Shipped → Delivered)
- Analytics with dynamic charts computed from actual data
- Payout history with Request Payout modal (amount, method, account number)
- Export payout history as CSV
- PWD ID file upload during seller registration
```

### Admin Features
```
- Dashboard with computed statistics and smart alerts
- User management with activate/suspend functionality
- Category management (Add, Edit, Delete)
- Seller approval workflow (Approve/Reject)
- Order management with search and status filtering
- Transaction records
- Reports with dynamic analytics
- Activity logs
- Payment provider settings:
  - Tabbed switcher for 5 providers (PayMongo, Stripe, PayPal, Maya, GCash)
  - Enable/disable toggle per provider
  - API key configuration with validation
  - Status indicator (configured/not configured)
  - "Get API Keys" links to each provider's dashboard
```

### Accessibility Features
```
- Floating accessibility toolbar (bottom-left)
- Font size adjustment (12px to 24px)
- High contrast mode toggle
- Text-to-Speech (TTS) with adjustable speech rate and voice selection
- Voice commands ("search", "go to cart", "go home", "scroll down", etc.)
- Reading mode with word highlighting
- Visual flash alerts for key events
- ARIA labels on interactive elements
- Skip navigation link
- prefers-reduced-motion support
- Semantic HTML structure
```

## Context Providers

Hierarchy (outermost → innermost):

```
AuthProvider
  └── DataStoreProvider
        └── CartProvider              ← scoped to logged-in user
              └── SettingsProvider
                    └── VoiceProvider
                          └── ToastProvider
                                └── VisualAlertProvider
```

| Context              | Purpose                                                        |
|----------------------|----------------------------------------------------------------|
| `AuthContext`        | User authentication, registration, session persistence        |
| `DataStoreContext`   | Products, orders, users, sellers, categories, reviews, logs, payouts, transactions |
| `CartContext`        | Per-user cart items, quantities, totals (localStorage)         |
| `SettingsContext`    | Platform-wide settings (site name, currency, fees, notifications) |
| `VoiceContext`       | TTS, speech recognition, reading mode, voice commands          |
| `ToastContext`       | In-app toast notifications for user feedback                   |
| `VisualAlertContext` | Flash alerts for accessibility                                 |

## Data Storage

All data persists in **browser localStorage** with `im_` prefix keys.

```
im_products         Product catalog
im_orders           All orders
im_users            Registered users
im_custom_users     Custom registered users
im_sellers          Seller accounts
im_categories       Product categories
im_reviews          Product reviews
im_activity_logs    Admin activity logs
im_payouts          Payout history
im_transactions     Transaction records
im_admin_settings   Platform admin settings
im_current_user     Currently logged-in user session
im_cart             Anonymous cart (no user logged in)
im_cart_{userId}    Per-user cart (logged-in user)
im_wishlist         Per-user wishlist (JSON object keyed by userId)
im_contact_messages Contact form submissions
im_payment_providers Payment provider configs (PayMongo, Stripe, PayPal, Maya, GCash)
im_tts_enabled      TTS toggle state
im_voice_commands   Voice commands toggle state
im_reading_mode     Reading mode toggle state
im_highlight_read   Highlight-on-read toggle state
im_speech_rate      TTS speech rate
im_voice_name       Selected TTS voice
im_high_contrast    High contrast mode toggle
```

## Payment Providers

Five payment providers are configured through admin settings:

```
Provider    Dashboard URL                                      API Key Location
----------  ------------------------------------------------  ---------------------------
PayMongo    https://dashboard.paymongo.com/developers/api-keys  Secret Key
Stripe      https://dashboard.stripe.com/apikeys                Secret Key
PayPal      https://developer.paypal.com/dashboard/applications Client ID + Secret
Maya        https://developer.maya.ph/                          Public Key + Secret Key
GCash       https://gcash.com/business                          API credentials (partner only)
```

Admin can enable/disable each provider and configure API keys. Enabled providers appear dynamically in buyer checkout.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Demo Accounts

```
Role     Email                        Password     Seller ID
------   -------------------------   ----------   ---------
Admin    admin@inclusivemarket.com    admin123     —
Seller   hope@bakery.com              seller123    s1
Buyer    maria@example.com            buyer123     —
```

## Implemented Functional Requirements

```
ID      Feature                                        Status
------  ---------------------------------------------  ------
FR-01   User registration with role-based access        Done
FR-02   User authentication with login                  Done
FR-03   Product CRUD (create, edit, delete)             Done
FR-04   Admin product/seller approval workflow          Done
FR-05   Product browsing with category filter/search    Done
FR-06   Shopping cart with quantity management          Done
FR-07   Order placement with status tracking            Done
FR-08   Multi-provider payment method selection         Done
FR-09   Inventory stock tracking with low-stock alerts  Done
FR-10   Admin dashboard with computed statistics        Done
FR-11   Transaction records and reporting               Done
FR-12   Accessibility toolbar (font, contrast, TTS)     Done
FR-13   User profile management with save               Done
FR-14   Category management (admin CRUD)                Done
FR-15   Toast notification system                       Done
FR-16   Featured product highlighting                   Done
FR-17   Order history with status timeline              Done
FR-18   Product reviews display                         Done
FR-19   Seller analytics with dynamic charts            Done
FR-20   Per-user shopping cart                          Done
FR-21   Wishlist functionality                          Done
FR-22   Multi-provider payment configuration            Done
FR-23   Seller payout requests                          Done
FR-24   Payout CSV export                               Done
FR-25   PWD ID file upload (seller registration)        Done
FR-26   Auth-guarded cart and checkout                  Done
FR-27   Contact form with validation                    Done
FR-28   Voice commands                                  Done
FR-29   Text-to-Speech (TTS)                            Done
FR-30   Reading mode with word highlighting             Done
FR-31   Visual flash alerts                             Done
FR-32   Remember me (login)                             Done
```

## Current State & Limitations

This is a **frontend prototype** built for academic capstone evaluation. The following features use mock/local implementations:

```
Authentication      localStorage-based, not connected to any backend or OAuth provider.
                    Google OAuth integration is scaffolded but uses mock implementation.

Payments            Multi-provider config UI is functional (admin settings). Actual payment
                    processing requires valid API keys from each provider. Checkout flow
                    dynamically shows enabled providers.

Data                All products, users, orders, and transactions use seed data persisted
                    to localStorage.

No backend API      No server, no database, no REST endpoints.

No real-time        No WebSocket, no push notifications.

No image upload     Product images reference static files in /public/images/.
                    Seller PWD ID upload validates file but stores reference only.
```

### Planned for Production

```
- Backend API (Laravel or Node.js/Express)
- MySQL/PostgreSQL database
- Google OAuth authentication (real)
- PayMongo / Stripe / PayPal / Maya / GCash live integration
- WCAG 2.1 AA compliance with TalkBack screen reader support
- Real image upload and cloud storage
- Email notifications (transactional)
- Push notifications
- Real-time order tracking
```
