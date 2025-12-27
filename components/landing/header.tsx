'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const navigation = [
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'About', href: '/about' },
  { name: 'FAQ', href: '#faq' },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-white/95 shadow-sm backdrop-blur-sm dark:bg-zinc-950/95' : 'bg-transparent'
        }`}>
        <nav className='container mx-auto flex items-center justify-between px-4 py-4 lg:px-8'>
          {/* Logo */}
          <div className='flex lg:flex-1'>
            <Link href='/' className='-m-1.5 p-1.5'>
              <span className='text-xl font-bold text-zinc-900 dark:text-zinc-50'>NotifyAff</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className='flex lg:hidden'>
            <button
              type='button'
              className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-zinc-700 dark:text-zinc-300'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span className='sr-only'>Toggle menu</span>
              {mobileMenuOpen ? (
                <X className='h-6 w-6' aria-hidden='true' />
              ) : (
                <Menu className='h-6 w-6' aria-hidden='true' />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className='hidden lg:flex lg:gap-x-8'>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className='text-sm font-semibold leading-6 text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300'>
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className='hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4'>
            <Button asChild variant='ghost' size='sm'>
              <Link href='/auth/login'>Sign In</Link>
            </Button>
            <Button asChild size='sm'>
              <Link href='/auth/login'>Start Free Trial</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className='fixed inset-0 z-50 bg-black/50 lg:hidden'
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden='true'
        />
      )}

      {/* Mobile menu panel */}
      <div
        className={`fixed inset-y-0 right-0 z-[60] w-full max-w-[320px] sm:max-w-sm overflow-y-auto bg-white dark:bg-zinc-950 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className='flex h-full flex-col px-6 py-6'>
          <div className='flex items-center justify-between'>
            <Link href='/' className='-m-1.5 p-1.5' onClick={() => setMobileMenuOpen(false)}>
              <span className='text-xl font-bold text-zinc-900 dark:text-zinc-50'>NotifyAff</span>
            </Link>
            <button
              type='button'
              className='-m-2.5 rounded-md p-2.5 text-zinc-700 dark:text-zinc-300'
              onClick={() => setMobileMenuOpen(false)}>
              <span className='sr-only'>Close menu</span>
              <X className='h-6 w-6' aria-hidden='true' />
            </button>
          </div>

          <div className='mt-6 flex-1'>
            <nav className='space-y-1'>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className='block rounded-lg px-3 py-3 text-base font-semibold text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900'
                  onClick={() => setMobileMenuOpen(false)}>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className='border-t border-zinc-200 dark:border-zinc-800 pt-6 space-y-3'>
            <Button asChild variant='ghost' size='lg' className='w-full'>
              <Link href='/auth/login' onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
            </Button>
            <Button asChild size='lg' className='w-full'>
              <Link href='/auth/login' onClick={() => setMobileMenuOpen(false)}>
                Start Free Trial
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
