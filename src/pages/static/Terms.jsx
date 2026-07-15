import { FileText, AlertTriangle, CheckCircle } from 'lucide-react'

export default function Terms() {
  return (
    <div>
      <section className="bg-gradient-to-br from-blue-600 to-emerald-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-lg text-blue-100">Last updated: January 1, 2026</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-10">
        <section>
          <h2 className="text-2xl font-bold mb-4">Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing or using Inclusive Market, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">User Accounts</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <p className="text-gray-600">You must provide accurate and complete information when creating an account.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <p className="text-gray-600">You are responsible for maintaining the security of your account credentials.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <p className="text-gray-600">Sellers must complete PWD verification to list products on the platform.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Seller Obligations</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Provide accurate product descriptions and pricing</li>
            <li>Fulfill orders in a timely manner</li>
            <li>Maintain adequate product stock</li>
            <li>Respond to customer inquiries within 24 hours</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Maintain accurate PWD verification documentation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Buyer Obligations</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Provide accurate shipping information</li>
            <li>Make timely payments for orders placed</li>
            <li>Review products fairly and honestly</li>
            <li>Treat all community members with respect</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Platform Fees</h2>
          <p className="text-gray-600 leading-relaxed">
            Inclusive Market charges a 5% platform fee on all completed transactions. This fee covers payment processing, platform maintenance, and customer support. Payouts to sellers are processed within 5-7 business days.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Prohibited Activities</h2>
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div className="text-gray-600 text-sm">
              <p className="mb-2">The following are strictly prohibited on Inclusive Market:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Selling counterfeit or illegal products</li>
                <li>Fraudulent transactions or identity misrepresentation</li>
                <li>Harassment or discrimination of any kind</li>
                <li>Circumventing platform fees</li>
                <li>Unauthorized data collection or scraping</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Contact</h2>
          <p className="text-gray-600">
            For questions about these Terms, contact <strong>legal@inclusivemarket.com</strong>
          </p>
        </section>
      </div>
    </div>
  )
}
