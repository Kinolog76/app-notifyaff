import { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Cookie Policy | NotifyAff",
  description: "Cookie Policy for NotifyAff - Learn about the cookies and tracking technologies we use.",
};

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-16 pt-24">
      <h1 className="mb-8 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Cookie Policy
      </h1>

      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          <strong>Last Updated:</strong> December 27, 2025
        </p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">1. What Are Cookies?</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Cookies are small text files stored on your device (computer, smartphone, tablet) when you visit a website. They help websites remember your preferences, improve performance, and provide personalized experiences.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            This Cookie Policy explains how NotifyAff ("we," "our," or "us") uses cookies and similar tracking technologies on our website and service (collectively, the "Service").
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">2. Types of Cookies We Use</h2>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">2.1 Essential Cookies (Always Active)</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            These cookies are necessary for the Service to function properly. You cannot opt out of essential cookies without affecting functionality.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border border-zinc-200 dark:border-zinc-800">
              <thead className="bg-zinc-100 dark:bg-zinc-900">
                <tr>
                  <th className="border border-zinc-200 px-4 py-2 text-left dark:border-zinc-800">Cookie Name</th>
                  <th className="border border-zinc-200 px-4 py-2 text-left dark:border-zinc-800">Purpose</th>
                  <th className="border border-zinc-200 px-4 py-2 text-left dark:border-zinc-800">Duration</th>
                </tr>
              </thead>
              <tbody className="text-zinc-600 dark:text-zinc-400">
                <tr>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    <code className="text-sm">sb-access-token</code>
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    Authenticates your login session (Supabase Auth)
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">1 hour</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    <code className="text-sm">sb-refresh-token</code>
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    Refreshes your authentication token
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">30 days</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    <code className="text-sm">__Secure-next-auth.session-token</code>
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    Manages session state (Next.js)
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">Session</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    <code className="text-sm">csrf_token</code>
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    Protects against cross-site request forgery attacks
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">Session</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    <code className="text-sm">cookie_consent</code>
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    Remembers your cookie preferences
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">2.2 Functional Cookies (Optional)</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            These cookies enhance your experience by remembering your preferences and settings.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border border-zinc-200 dark:border-zinc-800">
              <thead className="bg-zinc-100 dark:bg-zinc-900">
                <tr>
                  <th className="border border-zinc-200 px-4 py-2 text-left dark:border-zinc-800">Cookie Name</th>
                  <th className="border border-zinc-200 px-4 py-2 text-left dark:border-zinc-800">Purpose</th>
                  <th className="border border-zinc-200 px-4 py-2 text-left dark:border-zinc-800">Duration</th>
                </tr>
              </thead>
              <tbody className="text-zinc-600 dark:text-zinc-400">
                <tr>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    <code className="text-sm">theme</code>
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    Remembers your dark/light mode preference
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">1 year</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    <code className="text-sm">language</code>
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    Stores your language preference
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">1 year</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    <code className="text-sm">timezone</code>
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    Displays times in your local timezone
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">1 year</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    <code className="text-sm">dashboard_layout</code>
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    Remembers your dashboard view preferences
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">6 months</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">2.3 Analytics Cookies (Optional)</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            These cookies help us understand how users interact with the Service so we can improve it.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border border-zinc-200 dark:border-zinc-800">
              <thead className="bg-zinc-100 dark:bg-zinc-900">
                <tr>
                  <th className="border border-zinc-200 px-4 py-2 text-left dark:border-zinc-800">Cookie Name</th>
                  <th className="border border-zinc-200 px-4 py-2 text-left dark:border-zinc-800">Provider</th>
                  <th className="border border-zinc-200 px-4 py-2 text-left dark:border-zinc-800">Purpose</th>
                  <th className="border border-zinc-200 px-4 py-2 text-left dark:border-zinc-800">Duration</th>
                </tr>
              </thead>
              <tbody className="text-zinc-600 dark:text-zinc-400">
                <tr>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    <code className="text-sm">_ga</code>
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">Google Analytics</td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    Distinguishes unique users
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">2 years</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    <code className="text-sm">_ga_*</code>
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">Google Analytics</td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    Persists session state
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">2 years</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    <code className="text-sm">mp_*</code>
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">Mixpanel</td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    Tracks user behavior and feature usage
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">1 year</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    <code className="text-sm">amp_*</code>
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">Amplitude</td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    Analyzes user engagement and retention
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">2.4 Advertising Cookies (Not Currently Used)</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            We do not currently use advertising or marketing cookies. If this changes, we will update this policy and request your consent.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">3. Other Tracking Technologies</h2>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">3.1 Local Storage</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            We use browser local storage to cache data locally for faster performance (e.g., dashboard settings, recent link checks). This data is stored only on your device and is not transmitted to our servers unless explicitly needed.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">3.2 Session Storage</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Temporary data stored during your browsing session (e.g., form inputs, temporary notifications). This data is deleted when you close your browser.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">3.3 Pixels and Beacons</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            We may use tracking pixels in emails to measure open rates and engagement (e.g., whether you opened a link status alert). You can disable email tracking in your email client settings.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">3.4 Server Logs</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Our servers automatically log requests including IP addresses, user agents, timestamps, and requested URLs for security, debugging, and analytics purposes.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">4. Third-Party Cookies</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Some third-party services we use may set their own cookies:
          </p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li><strong>Stripe:</strong> Payment processing (required for checkout)</li>
            <li><strong>Google Fonts:</strong> Font delivery (no personal data collected)</li>
            <li><strong>Vercel Analytics:</strong> Performance monitoring</li>
            <li><strong>Sentry:</strong> Error tracking and debugging</li>
          </ul>
          <p className="text-zinc-600 dark:text-zinc-400">
            These third parties have their own privacy policies. We recommend reviewing them:
          </p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li><a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stripe Privacy Policy</a></li>
            <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Privacy Policy</a></li>
            <li><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Vercel Privacy Policy</a></li>
            <li><a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Sentry Privacy Policy</a></li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">5. How to Manage Cookies</h2>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">5.1 Cookie Consent Banner</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            When you first visit NotifyAff, you'll see a cookie consent banner. You can:
          </p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li><strong>Accept All:</strong> Allow all cookies (essential, functional, and analytics)</li>
            <li><strong>Reject Optional:</strong> Only allow essential cookies</li>
            <li><strong>Customize:</strong> Choose which categories to enable</li>
          </ul>
          <p className="text-zinc-600 dark:text-zinc-400">
            You can change your preferences anytime from your account settings under "Privacy & Cookies."
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">5.2 Browser Settings</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            You can also manage cookies through your browser settings:
          </p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Edge</a></li>
          </ul>
          <p className="text-zinc-600 dark:text-zinc-400">
            <strong>Note:</strong> Blocking essential cookies may prevent you from logging in or using certain features.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6">5.3 Opt-Out of Analytics</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            You can opt out of analytics tracking:
          </p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Analytics Opt-Out Browser Add-on</a></li>
            <li><a href="https://mixpanel.com/optout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mixpanel Opt-Out</a></li>
            <li>Enable "Do Not Track" in your browser (not universally supported)</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">6. Cookie Lifespan</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border border-zinc-200 dark:border-zinc-800">
              <thead className="bg-zinc-100 dark:bg-zinc-900">
                <tr>
                  <th className="border border-zinc-200 px-4 py-2 text-left dark:border-zinc-800">Type</th>
                  <th className="border border-zinc-200 px-4 py-2 text-left dark:border-zinc-800">Description</th>
                </tr>
              </thead>
              <tbody className="text-zinc-600 dark:text-zinc-400">
                <tr>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    <strong>Session Cookies</strong>
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    Deleted when you close your browser
                  </td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    <strong>Persistent Cookies</strong>
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    Remain on your device until expiration (ranging from hours to 2 years)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">7. Your Rights Under GDPR and CCPA</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            If you are in the EEA or California, you have additional rights:
          </p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400">
            <li><strong>GDPR (EEA):</strong> Withdraw consent for non-essential cookies anytime. See our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> for details.</li>
            <li><strong>CCPA (California):</strong> We do not sell personal information collected via cookies. You can request deletion of cookie data by contacting us.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">8. Changes to This Cookie Policy</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            We may update this Cookie Policy from time to time. Changes will be posted on this page with a new "Last Updated" date. Material changes will be communicated via email or a notice on the Service.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">9. Contact Us</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            If you have questions about cookies or this policy, please contact us:
          </p>
          <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-900 dark:text-zinc-50"><strong>NotifyAff</strong></p>
            <p className="text-zinc-600 dark:text-zinc-400">Email: <a href="mailto:privacy@notifyaff.com" className="text-blue-600 hover:underline">privacy@notifyaff.com</a></p>
            <p className="text-zinc-600 dark:text-zinc-400">Support: <a href="mailto:support@notifyaff.com" className="text-blue-600 hover:underline">support@notifyaff.com</a></p>
          </div>
        </section>

        <div className="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/20">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Quick Summary</h3>
          <ul className="mt-2 list-disc pl-6 text-sm text-blue-900 dark:text-blue-100">
            <li>We use cookies to provide, improve, and secure the Service</li>
            <li>Essential cookies are required for core functionality</li>
            <li>You can opt out of optional cookies (analytics, functional) anytime</li>
            <li>Manage your preferences in account settings or browser settings</li>
            <li>We do not sell cookie data or use advertising cookies</li>
          </ul>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}
