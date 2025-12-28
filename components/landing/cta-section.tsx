'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className='border-t border-zinc-200 bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 dark:border-zinc-800 dark:from-blue-950/20 dark:via-zinc-950 dark:to-blue-950/20 md:py-24'>
      <div className='container mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='mx-auto max-w-3xl text-center'>
          <h2 className='text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl lg:text-5xl'>
            Start Protecting Your Affiliate Revenue Today
          </h2>
          <p className='mt-6 text-lg text-zinc-600 dark:text-zinc-400 md:text-xl'>
            Join 10,000+ affiliate marketers who use NotifyAff to monitor their links 24/7. Get
            instant alerts when links break and never lose commissions again.
          </p>

          <div className='mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center'>
            <Button asChild size='lg' className='text-base group'>
              <Link href='/login'>
                Start Free Trial
                <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
              </Link>
            </Button>
            <Button asChild variant='outline' size='lg' className='text-base'>
              <Link href='#how-it-works'>Learn More</Link>
            </Button>
          </div>

          <p className='mt-6 text-sm text-zinc-500 dark:text-zinc-500'>
            Free 14-day trial • No credit card required • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};
