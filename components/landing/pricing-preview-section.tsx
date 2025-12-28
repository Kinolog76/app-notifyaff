'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: ['25 links', 'Weekly checks', 'Email alerts', 'Basic dashboard'],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Basic',
    price: '$12',
    period: 'per month',
    description: 'For serious affiliate marketers',
    features: ['250 links', 'Daily checks', 'Email alerts', 'Full analytics', 'Priority support'],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$24',
    period: 'per month',
    description: 'For power users',
    features: [
      '1,000 links',
      '2x daily checks',
      'All alert types',
      'Advanced analytics',
      'API access',
      'Team features',
    ],
    cta: 'Get Started',
    popular: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const PricingPreviewSection = () => {
  return (
    <section id='pricing' className='bg-zinc-50 py-20 dark:bg-zinc-900 md:py-24'>
      <div className='container mx-auto px-4'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl'>
            Simple, transparent pricing
          </h2>
          <p className='mt-4 text-lg text-zinc-600 dark:text-zinc-400'>
            Start free, upgrade as you grow
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
          className='mt-16 grid gap-8 lg:grid-cols-3 justify-items-center'>
          {plans.map((plan) => (
            <motion.div key={plan.name} variants={cardVariants} className='max-w-lg w-full'>
              <Card
                className={`relative h-full p-8 ${
                  plan.popular ? 'border-2 border-blue-500 shadow-lg dark:border-blue-400' : ''
                }`}>
                {plan.popular && (
                  <div className='absolute -top-4 left-1/2 -translate-x-1/2'>
                    <span className='rounded-full bg-blue-500 px-4 py-1 text-sm font-medium text-white'>
                      Most Popular
                    </span>
                  </div>
                )}

                <div className='flex flex-col gap-6 h-full'>
                  <div>
                    <h3 className='text-xl font-semibold text-zinc-900 dark:text-zinc-50'>
                      {plan.name}
                    </h3>
                    <p className='mt-2 text-sm text-zinc-600 dark:text-zinc-400'>
                      {plan.description}
                    </p>
                  </div>

                  <div>
                    <div className='flex items-baseline gap-1'>
                      <span className='text-4xl font-bold text-zinc-900 dark:text-zinc-50'>
                        {plan.price}
                      </span>
                      <span className='text-zinc-600 dark:text-zinc-400'>/{plan.period}</span>
                    </div>
                  </div>

                  <ul className='flex-1 space-y-3'>
                    {plan.features.map((feature) => (
                      <li key={feature} className='flex items-start gap-3'>
                        <Check className='mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400' />
                        <span className='text-sm text-zinc-600 dark:text-zinc-400'>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button asChild variant={plan.popular ? 'default' : 'outline'} className='w-full'>
                    <Link href='/login'>{plan.cta}</Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className='mt-8 text-center'>
          <p className='text-sm text-zinc-600 dark:text-zinc-400'>
            Start with our free plan. Upgrade anytime as you grow.
          </p>
        </div>
      </div>
    </section>
  );
};
