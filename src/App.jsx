import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SettingsProvider } from './context/SettingsContext'
import { DataStoreProvider } from './context/DataStore'
import { ToastProvider } from './context/ToastContext'
import { VoiceProvider } from './context/VoiceContext'
import { VisualAlertProvider } from './components/VisualAlert'
import { CookieConsentBanner } from './components/CookieConsent'
import { AuthGuard, GuestGuard, AdminGuard } from './components/AuthGuard'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import SellerLayout from './components/SellerLayout'
import AccessibilityToolbar from './components/AccessibilityToolbar'

import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

import Cart from './pages/buyer/Cart'
import Profile from './pages/buyer/Profile'
import Checkout from './pages/buyer/Checkout'
import Orders from './pages/buyer/Orders'
import OrderDetail from './pages/buyer/OrderDetail'

import SellerDashboard from './pages/seller/Dashboard'
import SellerProducts from './pages/seller/Products'
import SellerOrders from './pages/seller/SellerOrders'
import SellerAnalytics from './pages/seller/Analytics'
import SellerPayouts from './pages/seller/Payouts'
import RegisterSeller from './pages/seller/RegisterSeller'

import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminCategories from './pages/admin/Categories'
import ProductApprovals from './pages/admin/ProductApprovals'
import AdminOrders from './pages/admin/AdminOrders'
import AdminTransactions from './pages/admin/AdminTransactions'
import AdminReports from './pages/admin/Reports'
import ReviewModeration from './pages/admin/ReviewModeration'
import ActivityLogs from './pages/admin/ActivityLogs'
import AdminSettings from './pages/admin/AdminSettings'

import About from './pages/static/About'
import Contact from './pages/static/Contact'
import AccessibilityPage from './pages/static/Accessibility'
import Privacy from './pages/static/Privacy'
import Terms from './pages/static/Terms'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <DataStoreProvider>
        <CartProvider>
          <SettingsProvider>
            <VoiceProvider>
              <ToastProvider>
                <VisualAlertProvider>
                  <a href="#main-content" className="skip-link">
                    Skip to main content
                  </a>
                  <Routes>
                    {/* Public routes */}
                    <Route element={<Layout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
                      <Route path="/register" element={<GuestGuard><Register /></GuestGuard>} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/buyer/cart" element={<AuthGuard><Cart /></AuthGuard>} />
                      <Route path="/buyer/profile" element={<AuthGuard><Profile /></AuthGuard>} />
                      <Route path="/buyer/checkout" element={<AuthGuard><Checkout /></AuthGuard>} />
                      <Route path="/buyer/orders" element={<AuthGuard><Orders /></AuthGuard>} />
                      <Route path="/buyer/order-detail/:id" element={<AuthGuard><OrderDetail /></AuthGuard>} />
                      <Route path="/seller/register-seller" element={<RegisterSeller />} />
                      <Route path="/static/about" element={<About />} />
                      <Route path="/static/contact" element={<Contact />} />
                      <Route path="/static/accessibility" element={<AccessibilityPage />} />
                      <Route path="/static/privacy" element={<Privacy />} />
                      <Route path="/static/terms" element={<Terms />} />
                    </Route>

                    {/* Admin routes — only admin can access */}
                    <Route element={<Layout />}>
                      <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="product-approvals" element={<ProductApprovals />} />
                        <Route path="admin-orders" element={<AdminOrders />} />
                        <Route path="admin-transactions" element={<AdminTransactions />} />
                        <Route path="admin-reports" element={<AdminReports />} />
                        <Route path="review-moderation" element={<ReviewModeration />} />
                        <Route path="activity-logs" element={<ActivityLogs />} />
                        <Route path="admin-settings" element={<AdminSettings />} />
                      </Route>
                    </Route>

                    {/* Seller routes — only sellers can access */}
                    <Route element={<Layout />}>
                      <Route path="/seller" element={<AuthGuard allowedRoles={['seller']}><SellerLayout /></AuthGuard>}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<SellerDashboard />} />
                        <Route path="products" element={<SellerProducts />} />
                        <Route path="seller-orders" element={<SellerOrders />} />
                        <Route path="analytics" element={<SellerAnalytics />} />
                        <Route path="payouts" element={<SellerPayouts />} />
                      </Route>
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <AccessibilityToolbar />
                  <CookieConsentBanner />
                </VisualAlertProvider>
              </ToastProvider>
            </VoiceProvider>
          </SettingsProvider>
        </CartProvider>
      </DataStoreProvider>
    </AuthProvider>
  )
}
