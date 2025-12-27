import { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Privacy Policy | NotifyAff",
  description: "Privacy Policy for NotifyAff - Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-16 pt-24">
      <h1 className="mb-8 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Privacy Policy
      </h1>

      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          <strong>Last Updated:</strong> December 27, 2025
        </p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">1. Introduction</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            NotifyAff ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our affiliate link monitoring service (the "Service").
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            By accessing or using NotifyAff, you agree to this Privacy Policy. If you do not agree, please discontinue use of our Service immediately.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">2.1 Information You Provide</h3>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li><strong>Account Information:</strong> Name, email address, password, company name (optional)</li>
            <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely by Stripe)</li>
            <li><strong>Affiliate Links:</strong> URLs you add to monitor, categories, tags, and custom labels</li>
            <li><strong>Communication Data:</strong> Messages you send to our support team, feedback, and survey responses</li>
          </ul>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">2.2 Automatically Collected Information</h3>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Service, click patterns</li>
            <li><strong>Device Information:</strong> IP address, browser type and version, device type, operating system</li>
            <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies (see Section 8)</li>
            <li><strong>Link Check Data:</strong> HTTP status codes, response times, redirect chains, error logs</li>
          </ul>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">2.3 Information from Third Parties</h3>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li><strong>OAuth Providers:</strong> If you sign in with Google or other OAuth providers, we receive your name, email, and profile picture</li>
            <li><strong>Analytics Services:</strong> Aggregate data from Mixpanel, Amplitude, or similar services</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">3. How We Use Your Information</h2>
          <p className="text-zinc-600 dark:text-zinc-400">We use your information to:</p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li>Provide, operate, and maintain the Service</li>
            <li>Monitor your affiliate links and send you alerts about link status changes</li>
            <li>Process payments and manage subscriptions</li>
            <li>Communicate with you about updates, security alerts, and support requests</li>
            <li>Improve and optimize the Service through analytics and usage patterns</li>
            <li>Detect, prevent, and address technical issues, fraud, or security threats</li>
            <li>Comply with legal obligations and enforce our Terms of Service</li>
            <li>Send marketing communications (only with your consent, and you may opt-out anytime)</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">4. Legal Basis for Processing (GDPR)</h2>
          <p className="text-zinc-600 dark:text-zinc-400">If you are in the European Economic Area (EEA), we process your data based on:</p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li><strong>Contract Performance:</strong> To provide the Service you signed up for</li>
            <li><strong>Legitimate Interests:</strong> To improve our Service, prevent fraud, and ensure security</li>
            <li><strong>Consent:</strong> For marketing communications and non-essential cookies (you can withdraw consent anytime)</li>
            <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">5. How We Share Your Information</h2>
          <p className="text-zinc-600 dark:text-zinc-400">We do not sell your personal information. We may share your data with:</p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">5.1 Service Providers</h3>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li><strong>Supabase:</strong> Database hosting and authentication</li>
            <li><strong>Vercel:</strong> Web hosting and infrastructure</li>
            <li><strong>Stripe:</strong> Payment processing</li>
            <li><strong>Resend/SendGrid:</strong> Email delivery</li>
            <li><strong>Sentry:</strong> Error monitoring and debugging</li>
            <li><strong>Mixpanel/Amplitude:</strong> Analytics (anonymized where possible)</li>
          </ul>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">5.2 Business Transfers</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            If NotifyAff is acquired, merged, or sold, your information may be transferred to the new owner. We will notify you via email and/or a prominent notice on our Service.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">5.3 Legal Requirements</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            We may disclose your information if required by law, court order, or government request, or to protect our rights, safety, or property.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">6. Data Retention</h2>
          <p className="text-zinc-600 dark:text-zinc-400">We retain your information for as long as:</p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li>Your account is active</li>
            <li>Needed to provide the Service</li>
            <li>Required to comply with legal obligations (e.g., tax records for 7 years)</li>
            <li>Necessary to resolve disputes or enforce our agreements</li>
          </ul>
          <p className="text-zinc-600 dark:text-zinc-400">
            When you delete your account, we delete your personal information within 30 days, except where retention is required by law. Link check history may be anonymized and retained for analytics.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">7. Your Privacy Rights</h2>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">7.1 GDPR Rights (EEA Users)</h3>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
            <li><strong>Restriction:</strong> Limit how we process your data</li>
            <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
            <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Withdraw Consent:</strong> Opt-out of marketing or non-essential cookies anytime</li>
          </ul>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">7.2 CCPA Rights (California Users)</h3>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li><strong>Know:</strong> Request disclosure of data collected, used, and shared</li>
            <li><strong>Delete:</strong> Request deletion of your personal information</li>
            <li><strong>Opt-Out:</strong> We do not sell personal information (no opt-out needed)</li>
            <li><strong>Non-Discrimination:</strong> We will not discriminate against you for exercising these rights</li>
          </ul>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">7.3 How to Exercise Your Rights</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Email us at <a href="mailto:privacy@notifyaff.com" className="text-blue-600 hover:underline">privacy@notifyaff.com</a> or use the settings in your account dashboard. We will respond within 30 days.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">8. Cookies and Tracking Technologies</h2>
          <p className="text-zinc-600 dark:text-zinc-400">We use cookies and similar technologies to:</p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li><strong>Essential Cookies:</strong> Required for authentication, security, and core functionality</li>
            <li><strong>Analytics Cookies:</strong> Understand usage patterns and improve the Service</li>
            <li><strong>Preference Cookies:</strong> Remember your settings (theme, language, etc.)</li>
          </ul>
          <p className="text-zinc-600 dark:text-zinc-400">
            You can manage cookies in your browser settings. Disabling essential cookies may affect Service functionality. See our <a href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</a> for details.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">9. Data Security</h2>
          <p className="text-zinc-600 dark:text-zinc-400">We implement industry-standard security measures:</p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li>Encryption in transit (TLS/SSL) and at rest (AES-256)</li>
            <li>Secure authentication with bcrypt password hashing</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Row-level security (RLS) policies in our database</li>
            <li>Limited employee access to personal data (need-to-know basis)</li>
            <li>Two-factor authentication (2FA) available for all users</li>
          </ul>
          <p className="text-zinc-600 dark:text-zinc-400">
            However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security, but we continuously work to protect your data.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">10. International Data Transfers</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            NotifyAff is based in the United States. If you access the Service from outside the U.S., your data may be transferred to, stored, and processed in the U.S. or other countries.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            For EEA users, we rely on Standard Contractual Clauses (SCCs) approved by the European Commission to ensure adequate protection for your data.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">11. Children's Privacy</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            NotifyAff is not intended for users under 18 years old. We do not knowingly collect personal information from children. If we learn that we have collected data from a child under 18, we will delete it immediately. Please contact us at <a href="mailto:privacy@notifyaff.com" className="text-blue-600 hover:underline">privacy@notifyaff.com</a> if you believe we have collected such data.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">12. Third-Party Links</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            The Service may contain links to third-party websites or services (including the affiliate links you monitor). We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">13. Do Not Track Signals</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Some browsers include a "Do Not Track" (DNT) feature. Currently, there is no industry standard for how to respond to DNT signals. We do not respond to DNT signals at this time, but you can manage cookies through your browser settings.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">14. Changes to This Privacy Policy</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            We may update this Privacy Policy from time to time. We will notify you of material changes by:
          </p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li>Posting the updated policy on this page with a new "Last Updated" date</li>
            <li>Sending an email to your registered email address (for significant changes)</li>
            <li>Displaying a prominent notice on the Service</li>
          </ul>
          <p className="text-zinc-600 dark:text-zinc-400">
            Your continued use of the Service after changes become effective constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">15. Contact Us</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
          </p>
          <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-900 dark:text-zinc-50"><strong>NotifyAff</strong></p>
            <p className="text-zinc-600 dark:text-zinc-400">Email: <a href="mailto:privacy@notifyaff.com" className="text-blue-600 hover:underline">privacy@notifyaff.com</a></p>
            <p className="text-zinc-600 dark:text-zinc-400">Support: <a href="mailto:support@notifyaff.com" className="text-blue-600 hover:underline">support@notifyaff.com</a></p>
            <p className="text-zinc-600 dark:text-zinc-400">Address: [Your Business Address]</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">16. Data Protection Officer</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            For GDPR-related inquiries, you may contact our Data Protection Officer at <a href="mailto:dpo@notifyaff.com" className="text-blue-600 hover:underline">dpo@notifyaff.com</a>. You also have the right to lodge a complaint with your local data protection authority.
          </p>
        </section>
      </div>
      </div>
      <Footer />
    </>
  );
}
