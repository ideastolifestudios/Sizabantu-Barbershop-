import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Sizabantu Barbershop',
  description: 'Privacy Policy for Sizabantu Barbershop online booking system.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <a href="/" className="text-xs text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
          ← Back to site
        </a>

        <h1 className="text-3xl font-bold text-slate-900 mt-8 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-10">Effective date: 1 January 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">1. Who We Are</h2>
            <p>Sizabantu Barbershop ("we", "us", "our") operates the online booking platform at sizabantubarbershop.co.za.
            We are based at Klipfontein View 644, Nancy Ndamase Street, Midrand, Gauteng, South Africa.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account data:</strong> Name, email address, and phone number collected during sign-up or booking.</li>
              <li><strong>Booking data:</strong> Service selected, date, time, and appointment history.</li>
              <li><strong>Usage data:</strong> Pages visited, browser type, and IP address (collected automatically).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To confirm and manage your bookings.</li>
              <li>To send appointment reminders via WhatsApp or email.</li>
              <li>To track your loyalty stamp balance and rewards.</li>
              <li>To improve our services and website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">4. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Firebase (Google):</strong> Authentication and database hosting.</li>
              <li><strong>Wassenger:</strong> WhatsApp notification delivery.</li>
              <li><strong>Resend:</strong> Email delivery.</li>
              <li><strong>Vercel:</strong> Website hosting and analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">5. Data Retention</h2>
            <p>We retain your booking and account data for 24 months from your last interaction. You may request deletion at any time.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">6. Your Rights (POPIA)</h2>
            <p>Under the Protection of Personal Information Act (POPIA), you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access your personal information.</li>
              <li>Correct inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Withdraw consent at any time.</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact us at: <a href="mailto:info@sizabantubarbershop.co.za" className="underline">info@sizabantubarbershop.co.za</a></p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">7. Cookies</h2>
            <p>We use essential cookies to keep you signed in. We do not use advertising or tracking cookies. By using our site you consent to essential cookies.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">8. Contact</h2>
            <p>Sizabantu Barbershop<br />
            Klipfontein View 644, Nancy Ndamase Street, Midrand<br />
            Email: <a href="mailto:info@sizabantubarbershop.co.za" className="underline">info@sizabantubarbershop.co.za</a><br />
            Phone: +27 60 724 6829</p>
          </section>
        </div>
      </div>
    </div>
  );
}
