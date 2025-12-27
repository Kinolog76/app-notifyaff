'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const principles = [
  {
    title: 'Reliability first',
    description: 'Our monitoring infrastructure is built for 99.9% uptime. We check your links so you don\'t have to.',
  },
  {
    title: 'Speed over complexity',
    description: 'Fast setup, instant alerts, simple interface. No overwhelming dashboards or confusing metrics.',
  },
  {
    title: 'Transparency in monitoring',
    description: 'See exactly what we check, when we check it, and what we found. No black boxes.',
  },
  {
    title: 'Privacy & data protection',
    description: 'We only access the links you give us. No tracking of your users, no data sharing with third parties.',
  },
];

export const PrinciplesSection = () => {
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
          <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-zinc-50 md:text-4xl">
            Product Principles
          </h2>
          <p className="mt-4 text-center text-lg text-zinc-600 dark:text-zinc-400">
            The values and quality standards that guide how we build NotifyAff
          </p>

          <div className="mt-12 space-y-6">
            {principles.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-zinc-900 dark:text-zinc-50" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-8"
          >
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Trust & Transparency
            </h3>
            <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-zinc-900 dark:text-zinc-50 flex-shrink-0 mt-0.5" />
                <span>Read-only link monitoring—we never modify your links or access your affiliate accounts</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-zinc-900 dark:text-zinc-50 flex-shrink-0 mt-0.5" />
                <span>Infrastructure built for reliability with redundant monitoring systems</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-zinc-900 dark:text-zinc-50 flex-shrink-0 mt-0.5" />
                <span>Clear data handling principles—your links and check results stay private</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-zinc-900 dark:text-zinc-50 flex-shrink-0 mt-0.5" />
                <span>No hidden fees, no vendor lock-in—export your data anytime</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
