import { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Terms of Service | NotifyAff",
  description: "Terms of Service for NotifyAff - Read our terms and conditions for using the affiliate link monitoring service.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-16 pt-24">
      <h1 className="mb-8 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Terms of Service
      </h1>

      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          <strong>Last Updated:</strong> December 27, 2025
        </p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">1. Agreement to Terms</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and NotifyAff ("Company," "we," "our," or "us") governing your access to and use of the NotifyAff website, software, and affiliate link monitoring service (collectively, the "Service").
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            <strong>By creating an account or using the Service, you agree to be bound by these Terms.</strong> If you do not agree, you may not access or use the Service.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">2. Eligibility</h2>
          <p className="text-zinc-600 dark:text-zinc-400">You must meet the following requirements to use the Service:</p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li>Be at least 18 years old (or the age of majority in your jurisdiction)</li>
            <li>Have the legal capacity to enter into binding contracts</li>
            <li>Not be prohibited from using the Service under applicable law</li>
            <li>Provide accurate and complete registration information</li>
            <li>Maintain the security and confidentiality of your account credentials</li>
          </ul>
          <p className="text-zinc-600 dark:text-zinc-400">
            If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">3. Account Registration and Security</h2>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">3.1 Account Creation</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            To use certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and keep your account information up to date.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">3.2 Account Security</h3>
          <p className="text-zinc-600 dark:text-zinc-400">You are responsible for:</p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li>Maintaining the confidentiality of your password and account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized access or security breach</li>
            <li>Enabling two-factor authentication (2FA) for enhanced security (recommended)</li>
          </ul>
          <p className="text-zinc-600 dark:text-zinc-400">
            We are not liable for any loss or damage arising from your failure to secure your account.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">3.3 Account Restrictions</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Each account is for individual use only. You may not share, sell, or transfer your account to another person without our prior written consent. Organizations may create team accounts under the AGENCY plan.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">4. Subscription Plans and Pricing</h2>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">4.1 Available Plans</h3>
          <div className="text-zinc-600 dark:text-zinc-400">
            <p>NotifyAff offers the following subscription plans:</p>
            <ul className="list-disc pl-6">
              <li><strong>FREE:</strong> 25 links, weekly checks, basic dashboard</li>
              <li><strong>BASIC ($12/month):</strong> 250 links, daily checks, email alerts</li>
              <li><strong>PRO ($24/month):</strong> 1,000 links, 2x/day checks, full analytics, webhooks</li>
              <li><strong>AGENCY ($79/month):</strong> 10,000 links, 4x/day checks, API access, team features</li>
            </ul>
            <p className="mt-4">Pricing is subject to change with 30 days' notice to existing subscribers.</p>
          </div>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">4.2 Billing and Payment</h3>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li>Subscriptions are billed in advance on a monthly or annual basis (if applicable)</li>
            <li>Payment is processed securely through Stripe</li>
            <li>You authorize us to charge your payment method on each billing cycle</li>
            <li>All fees are non-refundable except as required by law or stated in Section 4.5</li>
            <li>Prices are in USD unless otherwise specified</li>
            <li>You are responsible for all taxes, if applicable</li>
          </ul>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">4.3 Free Plan</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            All users start with our FREE plan (25 links, weekly checks, basic dashboard). No credit card is required. You can upgrade to a paid plan anytime to access additional features and higher limits.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">4.4 Automatic Renewal</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Your subscription will automatically renew at the end of each billing period unless you cancel before the renewal date. You can cancel anytime from your account settings.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">4.5 Refund Policy</h3>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li>We offer a 30-day money-back guarantee for first-time subscribers</li>
            <li>Refunds are issued to the original payment method within 5-10 business days</li>
            <li>Recurring monthly payments are non-refundable after the first 30 days</li>
            <li>If you cancel mid-billing cycle, you retain access until the end of the paid period</li>
          </ul>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">4.6 Failed Payments</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            If a payment fails, we will attempt to charge your payment method up to 3 times. If payment cannot be collected, your account will be downgraded to the FREE plan, and link monitoring will be limited accordingly.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">5. Acceptable Use Policy</h2>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">5.1 Permitted Use</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            You may use the Service to monitor the health and status of your legitimate affiliate links, referral links, and marketing URLs.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">5.2 Prohibited Activities</h3>
          <p className="text-zinc-600 dark:text-zinc-400">You may NOT use the Service to:</p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li>Monitor URLs you do not own or have permission to monitor</li>
            <li>Engage in or facilitate illegal activities, fraud, or spam</li>
            <li>Monitor malicious links, phishing sites, or malware distribution URLs</li>
            <li>Reverse engineer, decompile, or attempt to extract source code from the Service</li>
            <li>Overwhelm or disable our infrastructure (DoS/DDoS attacks)</li>
            <li>Scrape, harvest, or collect data about other users without consent</li>
            <li>Circumvent usage limits, rate limits, or access controls</li>
            <li>Use the Service to compete with NotifyAff or build a similar product</li>
            <li>Share API keys or account credentials with unauthorized parties</li>
            <li>Violate any applicable laws, regulations, or third-party rights</li>
          </ul>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">5.3 Enforcement</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            We reserve the right to investigate and suspend or terminate accounts that violate this Acceptable Use Policy, with or without notice.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">6. Intellectual Property Rights</h2>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">6.1 Our Rights</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            The Service, including its design, code, features, trademarks, logos, and content, is owned by NotifyAff and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our written permission.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">6.2 Your Content</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            You retain ownership of the affiliate links and data you submit to the Service ("Your Content"). By using the Service, you grant us a limited, worldwide, non-exclusive license to:
          </p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li>Store, process, and monitor Your Content to provide the Service</li>
            <li>Use aggregated, anonymized data for analytics and service improvement</li>
          </ul>
          <p className="text-zinc-600 dark:text-zinc-400">
            We do not claim ownership of Your Content. This license terminates when you delete Your Content or close your account.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">6.3 Feedback</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            If you provide feedback, suggestions, or ideas about the Service, you grant us the right to use them without compensation or attribution.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">7. Data and Privacy</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Your use of the Service is also governed by our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>. By using the Service, you consent to our collection and use of data as described in the Privacy Policy.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">8. Service Availability and Modifications</h2>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">8.1 Uptime and Reliability</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            We strive to provide reliable service with minimal downtime. However, we do not guarantee uninterrupted access and are not liable for:
          </p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li>Scheduled maintenance (announced in advance when possible)</li>
            <li>Unexpected technical issues or third-party service failures</li>
            <li>Internet outages, network problems, or force majeure events</li>
          </ul>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">8.2 Service Modifications</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            We may modify, suspend, or discontinue any part of the Service at any time with reasonable notice. We are not liable for any modifications or interruptions.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">8.3 Third-Party Services</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            The Service may integrate with third-party services (Stripe, Supabase, etc.). We are not responsible for the availability, accuracy, or performance of third-party services.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">9. Disclaimers and Limitations of Liability</h2>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">9.1 "AS IS" Disclaimer</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR ACCURACY.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            We do not guarantee that:
          </p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li>The Service will be error-free, secure, or uninterrupted</li>
            <li>Link monitoring results will be 100% accurate or timely</li>
            <li>Alerts will always be delivered without delay</li>
            <li>The Service will meet your specific requirements</li>
          </ul>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">9.2 Limitation of Liability</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, NOTIFYAFF AND ITS AFFILIATES, EMPLOYEES, AND SERVICE PROVIDERS SHALL NOT BE LIABLE FOR:
          </p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li>Lost profits, revenue, or business opportunities</li>
            <li>Loss of data or commissions from broken affiliate links</li>
            <li>Indirect, incidental, consequential, or punitive damages</li>
            <li>Damages exceeding the amount you paid us in the last 12 months (or $100, whichever is greater)</li>
          </ul>
          <p className="text-zinc-600 dark:text-zinc-400">
            Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so the above may not apply to you.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">10. Indemnification</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            You agree to indemnify, defend, and hold harmless NotifyAff, its affiliates, and their respective officers, employees, and agents from any claims, liabilities, damages, losses, or expenses (including legal fees) arising from:
          </p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li>Your violation of these Terms</li>
            <li>Your violation of any law or third-party rights</li>
            <li>Your Content or use of the Service</li>
            <li>Unauthorized use of your account due to your negligence</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">11. Termination</h2>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">11.1 Termination by You</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            You may cancel your subscription or delete your account at any time from your account settings. Cancellation takes effect at the end of your current billing period.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">11.2 Termination by Us</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            We may suspend or terminate your account immediately if:
          </p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li>You violate these Terms or our Acceptable Use Policy</li>
            <li>Your payment fails and cannot be collected</li>
            <li>Your use of the Service poses a security or legal risk</li>
            <li>Required by law or court order</li>
          </ul>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">11.3 Effect of Termination</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Upon termination:
          </p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li>Your access to the Service will be revoked</li>
            <li>We will delete Your Content within 30 days (unless retention is required by law)</li>
            <li>No refunds will be issued for partial billing periods (except as stated in Section 4.5)</li>
            <li>Sections that by their nature should survive (e.g., intellectual property, indemnification, limitations of liability) will continue to apply</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">12. Dispute Resolution</h2>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">12.1 Informal Resolution</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            If you have a dispute, please contact us at <a href="mailto:support@notifyaff.com" className="text-blue-600 hover:underline">support@notifyaff.com</a> to resolve it informally before pursuing legal action.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">12.2 Arbitration (U.S. Users)</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Any disputes not resolved informally will be settled by binding arbitration in accordance with the rules of the American Arbitration Association (AAA). Arbitration will take place in [Your State/City]. You waive your right to a jury trial or to participate in a class action lawsuit.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">12.3 Governing Law</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            These Terms are governed by the laws of [Your State/Country], without regard to conflict of law principles. For non-U.S. users, you may have additional rights under local law.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">13. General Provisions</h2>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">13.1 Entire Agreement</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            These Terms, along with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and NotifyAff regarding the Service.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">13.2 Amendments</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            We may update these Terms from time to time. Material changes will be communicated via email or a notice on the Service. Continued use after changes constitutes acceptance.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">13.3 Severability</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            If any provision of these Terms is found unenforceable, the remaining provisions will remain in full effect.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">13.4 No Waiver</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Our failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">13.5 Assignment</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            You may not assign or transfer these Terms without our prior written consent. We may assign these Terms to any affiliate or successor.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">13.6 Force Majeure</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            We are not liable for delays or failures caused by events beyond our reasonable control (natural disasters, pandemics, wars, government actions, etc.).
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">14. Contact Information</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            For questions about these Terms, please contact us:
          </p>
          <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-900 dark:text-zinc-50"><strong>NotifyAff</strong></p>
            <p className="text-zinc-600 dark:text-zinc-400">Email: <a href="mailto:legal@notifyaff.com" className="text-blue-600 hover:underline">legal@notifyaff.com</a></p>
            <p className="text-zinc-600 dark:text-zinc-400">Support: <a href="mailto:support@notifyaff.com" className="text-blue-600 hover:underline">support@notifyaff.com</a></p>
            <p className="text-zinc-600 dark:text-zinc-400">Address: [Your Business Address]</p>
          </div>
        </section>

        <div className="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/20">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>By using NotifyAff, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
          </p>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}
