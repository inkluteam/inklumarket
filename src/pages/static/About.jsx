import { Heart, Users, Target, Award, Handshake, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div>
      <section className="bg-gradient-to-br from-amber-600 to-green-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Inclusive Market</h1>
          <p className="text-lg text-blue-100 leading-relaxed">
            Building a marketplace where everyone belongs, and every purchase makes a difference.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Inclusive Market is an accessible, community-driven marketplace empowering persons with disabilities (PWDs) who lead enterprises. We connect local, high-quality products directly with conscious consumers who believe in building a more inclusive economy.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Heart, title: 'Empowerment', desc: 'Providing PWD entrepreneurs with the platform and tools they need to succeed in the digital marketplace.' },
            { icon: Users, title: 'Community', desc: 'Fostering a supportive community of sellers, buyers, and advocates who champion inclusive commerce.' },
            { icon: Target, title: 'Accessibility', desc: 'Ensuring every feature meets WCAG 2.1 AA standards so everyone can participate fully.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 text-center">
              <Icon className="w-10 h-10 text-amber-600 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">{desc}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Handshake, title: 'Fair Trade', desc: 'We ensure fair pricing and transparent business practices for all our sellers.' },
              { icon: Globe, title: 'Sustainability', desc: 'Promoting eco-friendly products and sustainable business practices.' },
              { icon: Award, title: 'Quality', desc: 'Every product is reviewed to ensure it meets our quality standards.' },
              { icon: Heart, title: 'Inclusion', desc: 'Accessibility is not an afterthought—it is the foundation of everything we build.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Icon className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-amber-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Movement</h2>
          <p className="text-gray-600 mb-6">
            Whether you are a PWD entrepreneur, a conscious consumer, or an advocate for inclusion—there is a place for you at Inclusive Market.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-primary">Create Account</Link>
            <Link to="/seller/register-seller" className="btn-outline">Become a Seller</Link>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Legal Compliance & Accreditation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Philippine Data Privacy Act (RA 10173)', desc: 'We comply with Republic Act No. 10173, the Data Privacy Act of the Philippines. All personal data collected from users is processed lawfully, fairly, and透明ly. We implement appropriate organizational and technical security measures to protect personal data against unauthorized access, alteration, or destruction.' },
              { title: 'WCAG 2.1 Level AA', desc: 'Inclusive Market is designed and developed to conform with the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. Our platform includes keyboard navigation, screen reader support, high contrast modes, text-to-speech, voice commands, and visual alerts to ensure equal access for all users.' },
              { title: 'PWD-Accredited Products', desc: 'All products listed on Inclusive Market are crafted by registered Persons with Disabilities (PWDs) under the Area Vocational Rehabilitation Center (AVRC) Region IX, Zamboanga Peninsula. Each seller is verified to hold a valid PWD ID issued by the Department of Social Welfare and Development (DSWD).' },
              { title: 'DSWD Accreditation', desc: 'Inclusive Market is accredited under the Department of Social Welfare and Development (DSWD). We operate in partnership with AVRC Region IX to provide sustainable livelihood opportunities for PWD entrepreneurs across the Zamboanga Peninsula region.' },
            ].map(({ title, desc }) => (
              <div key={title} className="card p-6">
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
