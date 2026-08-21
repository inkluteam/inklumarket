import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE = 'Inclusive Market'

const ROUTE_TITLES = [
  [/^\/product\/.+/, 'Product'],
  [/^\/buyer\/order-detail\/.+/, 'Order Details'],
  [/^\/catalog/, 'Catalog'],
  ['/buyer/cart', 'Shopping Cart'],
  ['/buyer/profile', 'My Profile'],
  ['/buyer/checkout', 'Checkout'],
  ['/buyer/orders', 'My Orders'],
  ['/buyer/messages', 'Messages'],
  ['/buyer/support', 'Support Tickets'],
['/notifications', 'Notifications'],
['/admin/support-tickets', 'Support Tickets · Admin'],
['/admin/financial-records', 'Financial Records · Admin'],
  ['/buyer/wishlist', 'My Wishlist'],
  ['/seller/dashboard', 'Seller Dashboard'],
  ['/seller/products', 'My Products'],
  ['/seller/seller-orders', 'Seller Orders'],
  ['/seller/analytics', 'Sales Analytics'],
  ['/seller/payouts', 'Payouts'],
  ['/seller/messages', 'Messages'],
  ['/seller/reviews', 'Reviews'],
  ['/seller/register-seller', 'Become a Seller'],
  ['/admin/dashboard', 'Admin Dashboard'],
  ['/admin/users', 'User Management'],
  ['/admin/categories', 'Categories'],
  ['/admin/product-approvals', 'Product Approvals'],
  ['/admin/admin-orders', 'All Orders'],
  ['/admin/admin-transactions', 'Transactions'],
  ['/admin/admin-reports', 'Reports'],
  ['/admin/review-moderation', 'Review Moderation'],
  ['/admin/activity-logs', 'Activity Logs'],
  ['/admin/admin-settings', 'Settings'],
  ['/admin/payments', 'Payment Providers'],
  ['/admin/theme', 'Theme Customizer'],
  ['/admin/compliance', 'Compliance & Audit'],
  ['/login', 'Login'],
  ['/register', 'Create Account'],
  ['/forgot-password', 'Forgot Password'],
  ['/reset-password', 'Reset Password'],
  ['/static/about', 'About Us'],
  ['/static/contact', 'Contact Us'],
  ['/static/faq', 'FAQ'],
  ['/static/accessibility', 'Accessibility'],
  ['/static/privacy', 'Privacy Policy'],
  ['/static/terms', 'Terms of Service'],
]

export default function SeoTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    const match = ROUTE_TITLES.find(([k]) => (typeof k === 'string' ? k === pathname : k.test(pathname)))
    document.title = match
      ? `${match[1]} · ${SITE}`
      : `${SITE} — PWD Marketplace of Zamboanga`
  }, [pathname])

  return null
}
