'use client';

import { motion } from 'framer-motion';

export const StorySection = () => {
  return (
    <section className="bg-white dark:bg-zinc-950 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 md:text-4xl">
            Why NotifyAff exists
          </h2>
          <div className="mt-8 space-y-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            <p>
              Affiliate links break silently. One day they're generating revenue, the next they return 404 errors—and you don't find out until you check your dashboard weeks later.
            </p>
            <p>
              Most existing tools focus on tracking clicks and conversions, but they don't tell you when your links stop working. They assume everything is fine until your revenue suddenly drops.
            </p>
            <p>
              NotifyAff was built to solve this exact problem. We monitor the health of your affiliate links in real-time and alert you the moment something goes wrong—before you lose commissions.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
