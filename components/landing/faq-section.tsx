"use client";

import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How does the 14-day free trial work?",
    answer:
      "Start using NotifyAff immediately with full access to all features. No credit card required. After 14 days, choose a paid plan or continue with our free tier (25 links, weekly checks).",
  },
  {
    question: "How often are my affiliate links checked?",
    answer:
      "Check frequency depends on your plan: Free (weekly), Basic (daily), Pro (2x/day), Agency (4x/day). You can also trigger manual checks anytime from your dashboard.",
  },
  {
    question: "What happens when a link breaks?",
    answer:
      "You'll receive instant notifications via your preferred channel (email, push, webhook, or Slack). The alert includes the broken link URL, error type, timestamp, and suggested actions to fix it.",
  },
  {
    question: "Can I monitor links I don't own?",
    answer:
      "You can monitor any publicly accessible URL, including affiliate links, referral links, and marketing URLs. However, you should only monitor links you have permission to track.",
  },
  {
    question: "Do you support all affiliate networks?",
    answer:
      "Yes! NotifyAff works with all affiliate networks including Amazon Associates, ShareASale, CJ Affiliate, Impact, ClickBank, Awin, and custom affiliate programs. We monitor the HTTP response, not the network itself.",
  },
  {
    question: "What types of issues can NotifyAff detect?",
    answer:
      "We detect 404 errors, 500 server errors, timeouts, SSL certificate issues, redirect loops, unexpected redirects, DNS failures, and slow response times. You'll see the exact error code and response time for each check.",
  },
  {
    question: "Can I import my existing links in bulk?",
    answer:
      "Yes! Upload a CSV file with your affiliate links to import hundreds or thousands at once. We also support API integration for automated link management.",
  },
  {
    question: "Is there a limit to how many links I can monitor?",
    answer:
      "Limits depend on your plan: Free (25), Basic (250), Pro (1,000), Agency (10,000). Need more? Contact us for custom enterprise pricing.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. Cancel your subscription anytime from your account settings. You'll retain access until the end of your current billing period, and your data will be available for 30 days after cancellation.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 14-day money-back guarantee for first-time subscribers. If you're not satisfied, contact support within 14 days for a full refund.",
  },
  {
    question: "How do webhooks and integrations work?",
    answer:
      "Connect NotifyAff to Slack, Discord, Telegram, or any custom webhook endpoint. When a link breaks, we'll send a JSON payload to your webhook URL with full details about the issue.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. All data is encrypted in transit (TLS/SSL) and at rest (AES-256). We use Supabase for database hosting with row-level security policies. We never share or sell your data.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

const FAQItem = ({ faq }: { faq: { question: string; answer: string } }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        <span className="font-semibold text-zinc-900 dark:text-zinc-50 pr-8">
          {faq.question}
        </span>
        <span className="flex-shrink-0 text-zinc-500 dark:text-zinc-400">
          {isOpen ? (
            <Minus className="h-5 w-5" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <p className="text-zinc-600 dark:text-zinc-400">{faq.answer}</p>
        </div>
      )}
    </motion.div>
  );
};

export const FAQSection = () => {
  return (
    <section id="faq" className="border-t border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-950 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Everything you need to know about NotifyAff
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto mt-16 max-w-3xl space-y-4"
        >
          {faqs.map((faq) => (
            <FAQItem key={faq.question} faq={faq} />
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            Still have questions?{" "}
            <a
              href="mailto:support@notifyaff.com"
              className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
