"use client";

import { motion } from "framer-motion";
import { Users, Newspaper, Target, Building2 } from "lucide-react";

const audiences = [
  {
    icon: Users,
    title: "Affiliate marketers",
    description: "Manage hundreds of affiliate links across multiple networks without manual checking.",
  },
  {
    icon: Newspaper,
    title: "Bloggers & content creators",
    description: "Protect revenue from old posts and ensure evergreen content keeps earning.",
  },
  {
    icon: Target,
    title: "Media buyers",
    description: "Monitor campaign links in real-time and catch issues before they impact ROI.",
  },
  {
    icon: Building2,
    title: "SaaS companies",
    description: "Track partner and referral links at scale with API access and team features.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

export const TargetAudienceSection = () => {
  return (
    <section className="border-t border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-950 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
            Trusted by Affiliate Marketers, Bloggers & Content Creators Worldwide
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            From solo creators to marketing teams—protect your affiliate income at any scale
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {audiences.map((audience) => (
            <motion.div
              key={audience.title}
              variants={itemVariants}
              className="flex flex-col items-center text-center"
            >
              <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-950">
                <audience.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {audience.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {audience.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
