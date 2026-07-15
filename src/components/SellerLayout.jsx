import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, BarChart3, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const links = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/seller/products', label: 'Products', icon: Package },
  { to: '/seller/seller-orders', label: 'Orders', icon: ShoppingCart },
  { to: '/seller/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/seller/payouts', label: 'Payouts', icon: DollarSign },
]

export default function SellerLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r transition-all duration-300 shrink-0 hidden md:block`}>
        <div className="p-4 border-b flex items-center justify-between">
          {!collapsed && <h2 className="font-bold text-emerald-600">Seller Hub</h2>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 hover:bg-gray-100 rounded" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        <nav className="p-2 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
