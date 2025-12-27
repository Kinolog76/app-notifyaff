'use client';

import { motion } from 'framer-motion';

export const MissionSection = () => {
  return (
    <section className="bg-zinc-50 dark:bg-zinc-900 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 md:text-4xl">
            Our mission
          </h2>
          <blockquote className="mt-8 border-l-4 border-zinc-900 dark:border-zinc-50 pl-6 text-xl leading-relaxed text-zinc-700 dark:text-zinc-300 italic">
            Help marketers and businesses never lose revenue due to broken affiliate links
          </blockquote>

          <div className="mt-12">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Our vision
            </h3>
            <blockquote className="mt-4 border-l-4 border-zinc-400 dark:border-zinc-600 pl-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 italic">
              A web where monetization links are always monitored and transparent
            </blockquote>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
