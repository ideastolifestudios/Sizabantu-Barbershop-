import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Sizabantu Barbershop',
  description: 'Terms and conditions for using Sizabantu Barbershop booking services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <a href="/" className="text-xs text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
          ← Back to site
        </a>

        <h1 className="text-3xl font-bold text-slate-900 mt-8 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-400 mb-10">Effective date: 1 January 2026</p>

        <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing sizabantubarbershop.co.za or using our booking system, you agree to these Terms of Service. If you disagree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">2. Booking Policy</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Bookings are confirmed immediately upon submission.</li>
              <li>Please arrive 5 minutes before your scheduled time.</li>
              <li>Cancellations must be made at least 2 hours before the appointment.</li>
              <li>No-shows may result in restrictions on future bookings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">3. Loyalty Programme</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Stamps are earned one per completed paid session.</li>
              <li>Rewards are non-transferable and have no cash value.</li>
              <li>Sizabantu reserves the right to modify or discontinue the loyalty programme with reasonable notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">4. Conduct</h2>
            <p>Clients are expected to treat staff with respect. We reserve the right to refuse service to anyone acting in a disruptive or abusive manner.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">5. Limitation of Liability</h2>
            <p>Sizabantu Barbershop is not liable for any indirect or consequential losses arising from the use of our services or booking platform.</p>
          </section>

          <section>
            <h2 className="text-base font-semibent text-slate-900 mb-2">6. Governing Law</h2>
            <p>These terms are governed by the laws of the Republic of South Africa.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">7. Contact</h2>
            <p>Sizabantu Barbershop<br />
            Klipfontein View 644, Nancy Ndamase Street, Midrand<br />
            Email: <a href="mailto:info@sizabantubarbershop.co.za" className="underline">info@sizabantubarbershop.co.za</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
