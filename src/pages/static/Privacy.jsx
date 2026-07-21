import { Shield, Lock, Eye, Database, UserCheck } from 'lucide-react'

export default function Privacy() {
  return (
    <div>
      <section className="bg-gradient-to-br from-amber-600 to-green-600 text-white py-20">
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
                <Icon className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
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

        <section className="bg-amber-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <p className="text-gray-600">
            If you have questions about this Privacy Policy, please contact us at{' '}
            <strong>privacy@inclusivemarket.com</strong> or{' '}
            <strong>+63 62 991 2345</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Compliance with Philippine Data Privacy Act (RA 10173)</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Inclusive Market operates in full compliance with <strong>Republic Act No. 10173</strong>, also known as the <strong>Data Privacy Act of 2012</strong> of the Philippines, and its Implementing Rules and Regulations.
          </p>
          <div className="space-y-3 text-gray-600 text-sm">
            <p><strong>Data Controller:</strong> Inclusive Market is the data controller responsible for your personal data collected through this platform.</p>
            <p><strong>Lawful Basis:</strong> We process your data based on (a) your consent when you create an account or make a purchase, (b) performance of a contract when fulfilling orders, and (c) legitimate interest in improving our services.</p>
            <p><strong>Data Subject Rights:</strong> Under RA 10173, you have the right to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Be informed about how your personal data is collected and processed</li>
              <li>Access your personal data held by us</li>
              <li>Object to the processing of your personal data</li>
              <li>Request erasure or blocking of your personal data</li>
              <li>Rectify inaccurate or incomplete personal data</li>
              <li>Data portability — request your data in a structured, commonly used format</li>
              <li>File a complaint with the National Privacy Commission (NPC) if you believe your rights have been violated</li>
            </ul>
            <p><strong>Data Retention:</strong> Personal data is retained only for as long as necessary to fulfill the purposes for which it was collected, or as required by applicable law.</p>
            <p><strong>Data Breach Notification:</strong> In the event of a data breach that may affect your personal data, we will notify you and the National Privacy Commission within 72 hours as required by RA 10173.</p>
            <p><strong>Cross-Border Transfer:</strong> We do not transfer personal data outside the Philippines without adequate protection and your explicit consent.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
