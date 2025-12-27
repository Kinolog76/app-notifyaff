import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ThemeScript } from '@/components/theme/theme-script';
import { SchemaOrg } from '@/components/SchemaOrg';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <ThemeScript />
        <SchemaOrg />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider defaultTheme='system' storageKey='linkguardian-theme'>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
