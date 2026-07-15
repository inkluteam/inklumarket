import { Shield, Eye, Keyboard, Monitor, Volume2, Accessibility } from 'lucide-react'

export default function AccessibilityPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-blue-600 to-emerald-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Accessibility className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Accessibility Statement</h1>
          <p className="text-lg text-blue-100">
            Inclusive Market is committed to ensuring digital accessibility for all users.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-10">
        <section>
          <h2 className="text-2xl font-bold mb-4">Our Commitment</h2>
          <p className="text-gray-600 leading-relaxed">
            We strive to ensure that Inclusive Market is accessible to everyone, including people with disabilities. We are continually working to improve the accessibility of our platform and conform to WCAG 2.1 Level AA guidelines.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Accessibility Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Keyboard, title: 'Keyboard Navigation', desc: 'Full keyboard navigation support across all pages and interactive elements.' },
              { icon: Monitor, title: 'Screen Reader Support', desc: 'Semantic HTML, ARIA labels, and meaningful alt text for all content.' },
              { icon: Eye, title: 'Visual Accessibility', desc: 'High contrast colors, scalable text, and clear visual hierarchy.' },
              { icon: Volume2, title: 'Audio & Video', desc: 'Captions and transcripts provided for all multimedia content.' },
              { icon: Shield, title: 'Consistent Design', desc: 'Predictable navigation patterns and consistent interface behavior.' },
              { icon: Accessibility, title: 'WCAG 2.1 AA', desc: 'Target compliance with Web Content Accessibility Guidelines.' },
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
          <h2 className="text-2xl font-bold mb-4">Assistive Technology Compatibility</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Inclusive Market is designed to be compatible with the following assistive technologies:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>JAWS (Job Access With Speech) screen reader</li>
            <li>NVDA (NonVisual Desktop Access) screen reader</li>
            <li>VoiceOver (macOS and iOS built-in)</li>
            <li>TalkBack (Android built-in)</li>
            <li>Dragon NaturallySpeaking voice recognition</li>
            <li>ZoomText magnification software</li>
          </ul>
        </section>

        <section className="bg-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Feedback</h2>
          <p className="text-gray-600 mb-4">
            We welcome your feedback on the accessibility of Inclusive Market. Please let us know if you encounter accessibility barriers or have suggestions for improvement.
          </p>
          <p className="text-gray-600">
            <strong>Email:</strong> accessibility@inclusivemarket.com<br />
            <strong>Phone:</strong> +63 912 345 6789
          </p>
        </section>
      </div>
    </div>
  )
}
