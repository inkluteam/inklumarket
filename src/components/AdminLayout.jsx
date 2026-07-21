import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Package, ShoppingCart, DollarSign, BarChart3, Settings, Tags, Activity, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/product-approvals', label: 'Approvals', icon: Package },
  { to: '/admin/admin-orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/admin-transactions', label: 'Transactions', icon: DollarSign },
  { to: '/admin/admin-reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/review-moderation', label: 'Reviews', icon: MessageSquare },
  { to: '/admin/activity-logs', label: 'Activity', icon: Activity },
  { to: '/admin/admin-settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r transition-all duration-300 shrink-0 hidden md:block`}>
        <div className="p-4 border-b flex items-center justify-between">
          {!collapsed && <h2 className="font-bold text-amber-600">Admin Panel</h2>}
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
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-amber-50 text-amber-600 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} ${collapsed ? 'justify-center' : ''}`
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
