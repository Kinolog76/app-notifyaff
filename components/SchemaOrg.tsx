export function SchemaOrg() {
  const schemaData = {
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

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData),
      }}
    />
  );
}
