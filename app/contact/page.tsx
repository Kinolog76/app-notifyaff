import { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Mail, MessageSquare, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Contact Us | NotifyAff",
  description: "Get in touch with NotifyAff - We're here to help with questions, feedback, or support.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <div className="container mx-auto max-w-5xl px-4 py-16 pt-24">
        <div className="text-center mb-12">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Get in Touch
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 mb-12">
          {/* Contact Methods */}
          <div className="space-y-6">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Email</h3>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                Our support team is available to help
              </p>
              <a
                href="mailto:support@notifyaff.com"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                support@notifyaff.com
              </a>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                  <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Live Chat</h3>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                Chat with our team in real-time
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                Mon-Fri, 9am-5pm EST
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                  <HelpCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Help Center</h3>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                Find answers in our documentation
              </p>
              <a
                href="/#faq"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Visit FAQ
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>

                <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
                  We typically respond within 24 hours during business days
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
                How quickly will I receive a response?
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                We aim to respond to all inquiries within 24 hours during business days (Monday-Friday). For urgent matters, please indicate this in your subject line.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
                Do you offer phone support?
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Currently, we provide support via email and live chat. Phone support is available for Pro and Agency plan subscribers.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
                Can I schedule a demo?
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Yes! Agency plan users and teams can schedule personalized demos. Please mention this in your message and we'll arrange a convenient time.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
                Where can I find technical documentation?
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Our comprehensive documentation and API reference are available in the Help Center. You can also check our FAQ section for quick answers.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
