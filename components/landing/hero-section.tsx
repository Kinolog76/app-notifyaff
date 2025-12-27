"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
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
            Affiliate Link Monitoring Tool That Protects Your Revenue 24/7
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 max-w-2xl text-balance text-lg leading-8 text-zinc-600 dark:text-zinc-400 md:text-xl"
          >
            Automatically detect broken affiliate links, track redirects, and get instant alerts before you lose commissions. Trusted by 10,000+ affiliate marketers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Button asChild size="lg" className="text-base">
              <Link href="/auth/login">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link href="#how-it-works">View Demo</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 w-full max-w-5xl"
          >
            <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                Dashboard Preview
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
