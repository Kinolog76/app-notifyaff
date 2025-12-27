'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Settings, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';

const differentiators = [
  {
    icon: Target,
    title: 'Link reliability, not just analytics',
    description: 'We focus on making sure your links work, not just tracking how many clicks they get.',
  },
  {
    icon: Zap,
    title: 'Real-time alerts instead of delayed reports',
    description: 'Get notified the moment a link breaks, not days or weeks later when you check a dashboard.',
  },
  {
    icon: Settings,
    title: 'Simple setup, no technical overhead',
    description: 'Add your links and start monitoring in minutes. No complex integrations or code required.',
  },
  {
    icon: Shield,
    title: 'Built specifically for affiliate use cases',
    description: 'Designed from the ground up for affiliate marketers, not adapted from generic monitoring tools.',
  },
];

export const DifferentiationSection = () => {
  return (
    <section className="bg-white dark:bg-zinc-950 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-zinc-50 md:text-4xl">
            What Makes NotifyAff Different
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {differentiators.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full border-zinc-200 dark:border-zinc-800">
                  <item.icon className="h-10 w-10 text-zinc-900 dark:text-zinc-50 mb-4" />
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
