import { Shield, Lock, Eye, Database, UserCheck } from 'lucide-react'

export default function Privacy() {
  return (
    <div>
      <section className="bg-gradient-to-br from-blue-600 to-emerald-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-blue-100">Last updated: January 1, 2026</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-10">
        <section>
          <h2 className="text-2xl font-bold mb-4">Introduction</h2>
          <p className="text-gray-600 leading-relaxed">
            Inclusive Market ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
          <div className="space-y-4">
            {[
              { icon: UserCheck, title: 'Account Information', desc: 'Name, email address, phone number, and profile details when you create an account.' },
              { icon: Database, title: 'Transaction Data', desc: 'Purchase history, payment information (processed securely), and shipping addresses.' },
              { icon: Eye, title: 'Usage Data', desc: 'Pages visited, search queries, and interaction patterns to improve our service.' },
              { icon: Lock, title: 'PWD Verification', desc: 'PWD ID information for seller verification, stored securely and used only for verification purposes.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Icon className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>To provide and maintain our marketplace services</li>
            <li>To process transactions and send related information</li>
            <li>To verify seller identities and PWD status</li>
            <li>To send administrative notifications and updates</li>
            <li>To improve our platform and user experience</li>
            <li>To ensure compliance with our terms of service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Data Sharing</h2>
          <p className="text-gray-600 leading-relaxed">
            We do not sell your personal information. We may share your data with service providers who assist in operating our platform, such as payment processors and shipping partners, under strict confidentiality agreements.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Data Security</h2>
          <p className="text-gray-600 leading-relaxed">
            We implement industry-standard security measures including encryption, access controls, and regular security audits. However, no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section className="bg-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <p className="text-gray-600">
            If you have questions about this Privacy Policy, please contact us at{' '}
            <strong>privacy@inclusivemarket.com</strong> or{' '}
            <strong>+63 912 345 6789</strong>.
          </p>
        </section>
      </div>
    </div>
  )
}
