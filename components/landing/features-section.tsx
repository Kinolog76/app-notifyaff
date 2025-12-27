"use client";

import { motion } from "framer-motion";
import { Activity, GitBranch, Clock3, Mail, BarChart3, Webhook } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Activity,
    title: "HTTP status monitoring",
    description: "Track 200s, 404s, 500s, and all HTTP status codes to catch issues instantly.",
  },
  {
    icon: GitBranch,
    title: "Redirect chain detection",
    description: "Follow and validate entire redirect chains to ensure they end at the right destination.",
  },
  {
    icon: Clock3,
    title: "Uptime history",
    description: "View complete historical data and trends for each link's performance over time.",
  },
  {
    icon: Mail,
    title: "Email alerts",
    description: "Get instant email notifications when links break or status changes occur.",
  },
  {
    icon: BarChart3,
    title: "Dashboard & reports",
    description: "Visualize your link health with intuitive charts and exportable reports.",
  },
  {
    icon: Webhook,
    title: "Webhook integrations",
    description: "Connect to Slack, Discord, Telegram, or custom webhooks for team notifications.",
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

export const FeaturesSection = () => {
  return (
    <section id="features" className="bg-zinc-50 py-20 dark:bg-zinc-900 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
            Complete Affiliate Link Management Platform
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            All the tools you need to monitor, track, and protect your affiliate revenue in one dashboard
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants}>
              <Card className="h-full p-6 transition-all duration-300 hover:shadow-md">
                <div className="flex flex-col gap-4">
                  <div className="rounded-lg bg-zinc-100 p-3 w-fit dark:bg-zinc-800">
                    <feature.icon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
