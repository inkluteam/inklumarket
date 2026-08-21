import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

const FAQ_DATA = [
  {
    category: 'General',
    items: [
      { q: 'What is Inclusive Market?', a: 'Inclusive Market (IncluMarket) is an accessible e-commerce platform by DSWD Region IX, designed to empower Persons with Disabilities (PWDs) in the Zamboanga Peninsula to sell their products and services online.' },
      { q: 'Who can sell on Inclusive Market?', a: 'PWD-led enterprises, cooperatives, and individuals registered under DSWD AVRC Region IX. Sellers must apply and receive admin approval before listing products.' },
      { q: 'Is it free to use?', a: 'Browsing and buying are free. Sellers are charged a small platform fee (5%) on each completed transaction to sustain platform operations.' },
      { q: 'What regions are served?', a: 'Primarily Region IX — Zamboanga Peninsula, including Zamboanga City, Zamboanga del Norte, Zamboanga del Sur, and Zamboanga Sibugay. Delivery coverage depends on the seller.' },
    ],
  },
  {
    category: 'Buyers',
    items: [
      { q: 'How do I create a buyer account?', a: 'Click "Sign Up" on the homepage, choose Buyer, fill in your details, and verify your email. You can start shopping immediately after verification.' },
      { q: 'What payment methods are accepted?', a: 'We support Cash on Delivery (COD), GCash, Maya (PayMaya), and Bank Transfer. Available methods may vary per seller.' },
      { q: 'How do I track my order?', a: 'Go to Buyer → My Orders. Each order shows its current status and a tracking number once shipped. You will also receive an in-app notification when your order ships.' },
      { q: 'Can I return or get a refund?', a: 'Yes. Contact the seller via Messages within 7 days of delivery for returns. If unresolved, open a Support Ticket and our admin team will assist you.' },
      { q: 'How does the Wishlist work?', a: 'Click the heart icon on any product to save it to your wishlist. Access it anytime under Buyer → Wishlist to review or add items to your cart.' },
    ],
  },
  {
    category: 'Sellers',
    items: [
      { q: 'How do I register as a seller?', a: 'Go to Seller → Register and complete the seller application. Include your PWD ID or cooperative registration details. An admin will review and approve your account within 1–3 business days.' },
      { q: 'How do product approvals work?', a: 'After listing a product, it enters "Pending" status. An admin reviews and approves or flags it. Approved products are immediately visible in the catalog.' },
      { q: 'When and how do I get paid?', a: 'Request a payout from Seller → Payouts once your orders are delivered. We support Bank Transfer, GCash, Maya, and PayPal. Payouts are processed within 3–5 business days after admin approval.' },
      { q: 'Can I offer discounts?', a: 'Flash sale discounts can be configured by platform admins on your products. Contact support to schedule a flash sale event.' },
      { q: 'How do I handle orders?', a: 'Go to Seller → Orders. Accept pending orders, then mark them as Shipped (with a tracking number) and finally Delivered once confirmed.' },
    ],
  },
  {
    category: 'Accessibility',
    items: [
      { q: 'What accessibility features are available?', a: 'IncluMarket includes a full accessibility toolbar: adjustable font size, high-contrast mode, text-to-speech (TTS), voice commands, reading mode, reduced motion, and visual alerts. All features are saved to your profile.' },
      { q: 'Does the site support screen readers?', a: 'Yes. The platform is built to WCAG 2.1 AA standards with proper ARIA labels, skip links, semantic HTML, and keyboard-navigable components.' },
      { q: 'Is there a chatbot?', a: 'Yes. The floating chatbot is available to guests and logged-in users. It answers common questions and can escalate to a human support ticket if needed.' },
      { q: 'Can I use voice commands?', a: 'Yes. Enable Voice Commands in the accessibility toolbar. You can say commands like "go to cart," "search products," or "open orders."' },
    ],
  },
  {
    category: 'Privacy & Security',
    items: [
      { q: 'How is my data protected?', a: 'All data is stored securely. Emails are masked in cross-role views. We log your consent choices and provide full transparency. See our Privacy Policy for details.' },
      { q: 'Who can see my personal information?', a: 'Only you and authorized DSWD admins can view sensitive profile data. Sellers see only the shipping name and address for order fulfillment.' },
      { q: 'How do I delete my account?', a: 'Contact support via a Support Ticket or email support@inclusivemarket.com to request account deletion in compliance with data privacy regulations.' },
    ],
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid #f3f4f6' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', textAlign: 'left', padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', gap: '1rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827', lineHeight: 1.4 }}>{q}</span>
        {open ? <ChevronUp size={18} color="#6b7280" style={{ flexShrink: 0 }} /> : <ChevronDown size={18} color="#6b7280" style={{ flexShrink: 0 }} />}
      </button>
      {open && (
        <div style={{ paddingBottom: '1rem', paddingRight: '2rem' }}>
          <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.7, margin: 0 }}>{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = ['All', ...FAQ_DATA.map(d => d.category)]

  const filtered = activeCategory === 'All' ? FAQ_DATA : FAQ_DATA.filter(d => d.category === activeCategory)

  return (
    <main id="main-content">
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0047AB 0%, #003380 100%)', color: '#fff', padding: '3.5rem 1.5rem', textAlign: 'center' }}>
        <HelpCircle size={48} style={{ opacity: 0.8, marginBottom: '1rem' }} />
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '0.75rem' }}>Frequently Asked Questions</h1>
        <p style={{ fontSize: '1.05rem', opacity: 0.85, maxWidth: 560, margin: '0 auto' }}>
          Everything you need to know about IncluMarket — buying, selling, accessibility, and more.
        </p>
      </section>

      <section className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', justifyContent: 'center' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ padding: '0.45rem 1.1rem', border: `2px solid ${activeCategory === cat ? 'var(--color-primary,#0047AB)' : '#e5e7eb'}`, borderRadius: 100, background: activeCategory === cat ? 'var(--color-primary,#0047AB)' : '#fff', color: activeCategory === cat ? '#fff' : '#6b7280', cursor: 'pointer', fontWeight: activeCategory === cat ? 700 : 400, fontSize: '0.875rem', transition: 'all 0.15s' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ sections */}
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {filtered.map(section => (
            <div key={section.category} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-primary,#0047AB)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: '#eff6ff', borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.85rem' }}>{section.category}</span>
              </h2>
              {section.items.map(item => <FAQItem key={item.q} {...item} />)}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem', background: '#f9fafb', borderRadius: 12, padding: '2rem', maxWidth: 560, margin: '2.5rem auto 0' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Still have questions?</h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>Our support team is here to help.</p>
          <a href="/static/contact" style={{ display: 'inline-block', background: 'var(--color-primary,#0047AB)', color: '#fff', padding: '0.65rem 1.75rem', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>Contact Us</a>
        </div>
      </section>
    </main>
  )
}
