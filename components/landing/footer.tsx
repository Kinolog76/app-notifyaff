import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ],
  company: [
    { name: 'About', href: '/#' },
    { name: 'Blog', href: '/#' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
  resources: [
    { name: 'Documentation', href: '/#' },
    { name: 'API Reference', href: '/#' },
    { name: 'Support', href: '/#' },
    { name: 'Status', href: '/#' },
  ],
};

const socialLinks = [
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'GitHub', href: '#', icon: Github },
  { name: 'LinkedIn', href: '#', icon: Linkedin },
];

export const Footer = () => {
  return (
    <footer className='border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950'>
      <div className='container mx-auto px-4 py-12 md:py-16'>
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-5'>
          {/* Brand */}
          <div className='lg:col-span-1'>
            <Link href='/' className='text-xl font-bold text-zinc-900 dark:text-zinc-50'>
              NotifyAff
            </Link>
            <p className='mt-4 text-sm text-zinc-600 dark:text-zinc-400'>
              Monitor affiliate links and get instant alerts before you lose revenue.
            </p>
            <div className='mt-6 flex gap-4'>
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className='text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
                  aria-label={social.name}>
                  <social.icon className='h-5 w-5' />
                </Link>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className='font-semibold text-zinc-900 dark:text-zinc-50'>Product</h3>
            <ul className='mt-4 space-y-3'>
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className='font-semibold text-zinc-900 dark:text-zinc-50'>Company</h3>
            <ul className='mt-4 space-y-3'>
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className='font-semibold text-zinc-900 dark:text-zinc-50'>Resources</h3>
            <ul className='mt-4 space-y-3'>
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className='font-semibold text-zinc-900 dark:text-zinc-50'>Legal</h3>
            <ul className='mt-4 space-y-3'>
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800'>
          <p className='text-center text-sm text-zinc-600 dark:text-zinc-400'>
            © {new Date().getFullYear()} NotifyAff. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
