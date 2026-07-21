import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">♿</span>
              <span className="text-xl font-bold text-white">Inclusive Market — AVRC Region IX</span>
            </div>
            <p className="text-sm leading-relaxed">
              An accessible, community-driven marketplace empowering PWD-led enterprises of AVRC Region IX by connecting Zamboanga Peninsula's local, high-quality products with conscious consumers.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/catalog" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/catalog?featured=true" className="hover:text-white transition-colors">Featured</Link></li>
              <li><Link to="/catalog?category=1" className="hover:text-white transition-colors">Food & Beverages</Link></li>
              <li><Link to="/catalog?category=2" className="hover:text-white transition-colors">Handicrafts</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/buyer/cart" className="hover:text-white transition-colors">Cart</Link></li>
              <li><Link to="/buyer/orders" className="hover:text-white transition-colors">My Orders</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/static/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/static/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/static/accessibility" className="hover:text-white transition-colors">Accessibility</Link></li>
              <li><Link to="/static/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/static/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Inclusive Market. All rights reserved. Built with accessibility at its core.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-gray-500">
            <span>Compliant with RA 10173 (Data Privacy Act)</span>
            <span>·</span>
            <span>WCAG 2.1 Level AA</span>
            <span>·</span>
            <span>DSWD Accredited</span>
            <span>·</span>
            <span>AVRC Region IX</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
