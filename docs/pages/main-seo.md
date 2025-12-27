## app/page.tsx

```js
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NotifyAff — Affiliate Link Monitoring & Instant Alerts',
  description:
    'Monitor affiliate links, detect broken redirects, and get instant alerts. Never lose commissions again with NotifyAff.',

  keywords: [
    'affiliate link monitoring',
    'affiliate link tracker',
    'broken affiliate links',
    'affiliate alerts',
    'affiliate notifications',
  ],

  openGraph: {
    title: 'NotifyAff — Affiliate Link Monitoring & Instant Alerts',
    description: 'Track affiliate links, detect failures, and receive instant notifications.',
    url: 'https://notifyaff.com',
    siteName: 'NotifyAff',
    images: [
      {
        url: 'https://notifyaff.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NotifyAff dashboard preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'NotifyAff — Affiliate Link Monitoring',
    description: 'Never lose affiliate commissions due to broken links.',
    images: ['https://notifyaff.com/og-image.png'],
  },

  metadataBase: new URL('https://notifyaff.com'),
};
```

## app/components/SchemaOrg.tsx

```js
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
```

## layout.tsx

```js
import { SchemaOrg } from '@/components/SchemaOrg';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <SchemaOrg />
        {children}
      </body>
    </html>
  );
}
```

## robots.ts

```js
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://notifyaff.com/sitemap.xml',
  };
}
```
