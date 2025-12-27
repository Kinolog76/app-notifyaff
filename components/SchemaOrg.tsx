export function SchemaOrg() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NotifyAff',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'NotifyAff is a SaaS tool for monitoring affiliate links and sending instant alerts when links break or redirect.',
    url: 'https://notifyaff.com',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
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
