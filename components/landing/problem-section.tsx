"use client";

import { motion } from "framer-motion";
import { AlertCircle, Link2Off, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: Link2Off,
    title: "Partner programs change URLs",
    description: "Affiliate networks update their tracking systems without notice, breaking your links overnight.",
  },
  {
    icon: AlertCircle,
    title: "Links get blocked or redirected",
    description: "Security filters, ad blockers, and regional restrictions can prevent your links from working properly.",
  },
  {
    icon: TrendingDown,
    title: "Traffic and commissions are lost silently",
    description: "You don't know there's a problem until you check your analytics—and by then, revenue is already gone.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const ProblemSection = () => {
  return (
    <section className="border-t border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-950 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
            Are Broken Affiliate Links Costing You Thousands in Lost Revenue?
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Most affiliate marketers discover broken links weeks too late—after losing significant commissions
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-8 md:grid-cols-3"
        >
          {problems.map((problem) => (
            <motion.div
              key={problem.title}
              variants={itemVariants}
              className="flex flex-col items-start gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-950">
                <problem.icon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {problem.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
