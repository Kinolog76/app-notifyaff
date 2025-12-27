export function SchemaOrg() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NotifyAff - Affiliate Link Monitoring Tool',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'NotifyAff is an automated affiliate link monitoring and tracking tool that detects broken links, monitors redirects, and sends instant alerts to protect your affiliate revenue. Trusted by 10,000+ affiliate marketers, bloggers, and content creators worldwide.',
    url: 'https://notifyaff.com',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1247',
    },
    featureList: [
      '24/7 affiliate link monitoring',
      'Broken link detection',
      'Redirect tracking',
      'Instant email and push alerts',
      'HTTP status code monitoring',
      'Uptime history and analytics',
      'Webhook integrations',
      'Bulk link import',
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does the free plan work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Start using NotifyAff immediately with our free plan (25 links, weekly checks, basic dashboard). No credit card required. Upgrade to a paid plan anytime to unlock more links, frequent checks, and advanced features.',
        },
      },
      {
        '@type': 'Question',
        name: 'How often are my affiliate links checked?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Check frequency depends on your plan: Free (weekly), Basic (daily), Pro (2x/day), Agency (4x/day). You can also trigger manual checks anytime from your dashboard.',
        },
      },
      {
        '@type': 'Question',
        name: 'What happens when a link breaks?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "You'll receive instant notifications via your preferred channel (email, push, webhook, or Slack). The alert includes the broken link URL, error type, timestamp, and suggested actions to fix it.",
        },
      },
      {
        '@type': 'Question',
        name: "Can I monitor links I don't own?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can monitor any publicly accessible URL, including affiliate links, referral links, and marketing URLs. However, you should only monitor links you have permission to track.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you support all affiliate networks?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! NotifyAff works with all affiliate networks including Amazon Associates, ShareASale, CJ Affiliate, Impact, ClickBank, Awin, and custom affiliate programs. We monitor the HTTP response, not the network itself.',
        },
      },
      {
        '@type': 'Question',
        name: 'What types of issues can NotifyAff detect?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "We detect 404 errors, 500 server errors, timeouts, SSL certificate issues, redirect loops, unexpected redirects, DNS failures, and slow response times. You'll see the exact error code and response time for each check.",
        },
      },
      {
        '@type': 'Question',
        name: 'Can I import my existing links in bulk?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Upload a CSV file with your affiliate links to import hundreds or thousands at once. We also support API integration for automated link management.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a limit to how many links I can monitor?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Limits depend on your plan: Free (25), Basic (250), Pro (1,000), Agency (10,000). Need more? Contact us for custom enterprise pricing.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I cancel anytime?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Absolutely. Cancel your subscription anytime from your account settings. You'll retain access until the end of your current billing period, and your data will be available for 30 days after cancellation.",
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer refunds?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Yes, we offer a 30-day money-back guarantee for first-time subscribers. If you're not satisfied, contact support within 30 days of your first payment for a full refund.",
        },
      },
      {
        '@type': 'Question',
        name: 'How do webhooks and integrations work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Connect NotifyAff to Slack, Discord, Telegram, or any custom webhook endpoint. When a link breaks, we'll send a JSON payload to your webhook URL with full details about the issue.",
        },
      },
      {
        '@type': 'Question',
        name: 'Is my data secure?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. All data is encrypted in transit (TLS/SSL) and at rest (AES-256). We use Supabase for database hosting with row-level security policies. We never share or sell your data.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareSchema),
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </>
  );
}
