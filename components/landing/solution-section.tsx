"use client";

import { motion } from "framer-motion";
import { Clock, Search, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";

const benefits = [
  {
    icon: Clock,
    title: "Real-time monitoring",
    description: "Continuous health checks of all your affiliate links, running 24/7 in the background.",
  },
  {
    icon: Search,
    title: "Redirect & status code detection",
    description: "Track redirect chains, detect 404s, 500s, and other issues before they cost you money.",
  },
  {
    icon: Bell,
    title: "Instant notifications",
    description: "Get alerts via email, push, or webhook the moment a link breaks—no manual checking needed.",
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

export const SolutionSection = () => {
  return (
    <section className="bg-zinc-50 py-20 dark:bg-zinc-900 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
            Automated Affiliate Link Checker That Never Sleeps
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            NotifyAff monitors every affiliate link 24/7, detects issues in real-time, and alerts you instantly—so you can fix problems before losing a single commission
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {benefits.map((benefit) => (
            <motion.div key={benefit.title} variants={cardVariants}>
              <Card className="group h-full p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="flex flex-col items-start gap-4">
                  <div className="rounded-full bg-emerald-100 p-3 transition-colors group-hover:bg-emerald-200 dark:bg-emerald-950 dark:group-hover:bg-emerald-900">
                    <benefit.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    {benefit.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {benefit.description}
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
