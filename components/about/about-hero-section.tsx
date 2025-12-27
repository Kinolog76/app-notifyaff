'use client';

import { motion } from 'framer-motion';

export const AboutHeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 md:text-5xl lg:text-6xl"
          >
            About NotifyAff
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 max-w-2xl text-balance text-lg leading-8 text-zinc-600 dark:text-zinc-400 md:text-xl"
          >
            Built to protect affiliate revenue through reliable link monitoring
          </motion.p>
        </div>
      </div>
    </section>
  );
};
