'use client';

import { motion } from 'framer-motion';
import { Users, PenTool, BarChart3, Building2 } from 'lucide-react';

const audiences = [
  {
    icon: Users,
    title: 'Affiliate marketers',
    description: 'Monitor hundreds of affiliate links across multiple programs and campaigns.',
  },
  {
    icon: PenTool,
    title: 'Bloggers & publishers',
    description: 'Protect monetization links in your content without constant manual checking.',
  },
  {
    icon: BarChart3,
    title: 'Media buying teams',
    description: 'Ensure landing page links stay active across all your traffic sources.',
  },
  {
    icon: Building2,
    title: 'SaaS and content platforms',
    description: 'Monitor partner and referral links at scale with automated health checks.',
  },
];

export const AudienceSection = () => {
  return (
    <section className="bg-zinc-50 dark:bg-zinc-900 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-zinc-50 md:text-4xl">
            Who We Build For
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {audiences.map((audience, index) => (
              <motion.div
                key={audience.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50">
                    <audience.icon className="h-6 w-6 text-zinc-50 dark:text-zinc-900" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    {audience.title}
                  </h3>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {audience.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
