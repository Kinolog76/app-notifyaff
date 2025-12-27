'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export const AboutCTASection = () => {
  return (
    <section className="bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-950 dark:to-zinc-900 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Protect your affiliate revenue today
          </h2>
          <p className="mt-4 text-lg text-zinc-300">
            Start monitoring your affiliate links in minutes. No credit card required.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100 text-base">
              <Link href="/auth/login">Start Free Trial</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
