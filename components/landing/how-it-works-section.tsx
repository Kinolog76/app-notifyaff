"use client";

import { motion } from "framer-motion";
import { LinkIcon, Settings, BellRing } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: LinkIcon,
    title: "Add affiliate links",
    description: "Import your links manually, via CSV, or paste them directly into your dashboard.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Configure alerts",
    description: "Choose how and when you want to be notified—email, push notifications, or webhooks.",
  },
  {
    number: "03",
    icon: BellRing,
    title: "Receive instant notifications",
    description: "Get alerted immediately when a link breaks, so you can fix it before losing commissions.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="border-t border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-950 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Get started in minutes, not hours
          </p>
        </div>

        <div className="mt-16 space-y-12 md:space-y-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`flex flex-col items-center gap-8 md:flex-row ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <span className="text-5xl font-bold text-zinc-200 dark:text-zinc-800">
                    {step.number}
                  </span>
                  <div>
                    <div className="mb-4 inline-flex rounded-full bg-blue-100 p-3 dark:bg-blue-950">
                      <step.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="aspect-video w-full rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex h-full items-center justify-center text-zinc-400">
                    Step {index + 1} Illustration
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
