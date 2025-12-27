'use client';

import { useState } from 'react';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Mail, MessageSquare, HelpCircle, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      setSubmitStatus('success');
      // Reset form
      (e.target as HTMLFormElement).reset();

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Header />
      <div className='container mx-auto max-w-5xl px-4 py-16 pt-24'>
        <div className='text-center mb-12'>
          <h1 className='mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50'>
            Get in Touch
          </h1>
          <p className='text-lg text-zinc-600 dark:text-zinc-400'>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon
            as possible.
          </p>
        </div>

        <div className='grid gap-8 lg:grid-cols-3 mb-12'>
          {/* Contact Methods */}
          <div className='space-y-6'>
            <div className='rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='rounded-full bg-blue-100 p-2 dark:bg-blue-900'>
                  <Mail className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                </div>
                <h3 className='font-semibold text-zinc-900 dark:text-zinc-50'>Email</h3>
              </div>
              <p className='text-sm text-zinc-600 dark:text-zinc-400 mb-2'>
                Our support team is available to help
              </p>
              <a
                href='mailto:support@notifyaff.com'
                className='text-sm text-blue-600 hover:underline dark:text-blue-400'>
                support@notifyaff.com
              </a>
            </div>

            <div className='rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='rounded-full bg-purple-100 p-2 dark:bg-purple-900'>
                  <MessageSquare className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                </div>
                <h3 className='font-semibold text-zinc-900 dark:text-zinc-50'>Live Chat</h3>
              </div>
              <p className='text-sm text-zinc-600 dark:text-zinc-400 mb-2'>
                Chat with our team in real-time
              </p>
              <p className='text-sm text-zinc-500 dark:text-zinc-500'>Mon-Fri, 9am-5pm EST</p>
            </div>

            <div className='rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='rounded-full bg-green-100 p-2 dark:bg-green-900'>
                  <HelpCircle className='h-5 w-5 text-green-600 dark:text-green-400' />
                </div>
                <h3 className='font-semibold text-zinc-900 dark:text-zinc-50'>Help Center</h3>
              </div>
              <p className='text-sm text-zinc-600 dark:text-zinc-400 mb-3'>
                Find answers in our documentation
              </p>
              <a href='/#faq' className='text-sm text-blue-600 hover:underline dark:text-blue-400'>
                Visit FAQ
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className='lg:col-span-2'>
            <form
              onSubmit={handleSubmit}
              className='rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900'>
              <div className='space-y-6'>
                <div className='grid gap-6 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='firstName'>First Name</Label>
                    <Input
                      id='firstName'
                      name='firstName'
                      placeholder='John'
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='lastName'>Last Name</Label>
                    <Input
                      id='lastName'
                      name='lastName'
                      placeholder='Doe'
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    placeholder='john@example.com'
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='subject'>Subject</Label>
                  <Input
                    id='subject'
                    name='subject'
                    placeholder='How can we help?'
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='message'>Message</Label>
                  <Textarea
                    id='message'
                    name='message'
                    placeholder='Tell us more about your inquiry...'
                    rows={6}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {submitStatus === 'success' && (
                  <div className='flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400'>
                    <CheckCircle className='h-5 w-5' />
                    <p className='text-sm font-medium'>
                      Message sent successfully! We'll get back to you soon.
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className='rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400'>
                    <p className='text-sm font-medium'>{errorMessage}</p>
                  </div>
                )}

                <Button type='submit' className='w-full' disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </Button>

                <p className='text-center text-xs text-zinc-500 dark:text-zinc-500'>
                  We typically respond within 24 hours during business days
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className='rounded-lg border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900'>
          <h2 className='mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50'>
            Frequently Asked Questions
          </h2>
          <div className='space-y-6'>
            <div>
              <h3 className='mb-2 font-semibold text-zinc-900 dark:text-zinc-50'>
                How quickly will I receive a response?
              </h3>
              <p className='text-sm text-zinc-600 dark:text-zinc-400'>
                We aim to respond to all inquiries within 24 hours during business days
                (Monday-Friday). For urgent matters, please indicate this in your subject line.
              </p>
            </div>
            <div>
              <h3 className='mb-2 font-semibold text-zinc-900 dark:text-zinc-50'>
                Do you offer phone support?
              </h3>
              <p className='text-sm text-zinc-600 dark:text-zinc-400'>
                Currently, we provide support via email. Phone support is available for Pro and
                Agency plan subscribers.
              </p>
            </div>
            <div>
              <h3 className='mb-2 font-semibold text-zinc-900 dark:text-zinc-50'>
                Can I schedule a demo?
              </h3>
              <p className='text-sm text-zinc-600 dark:text-zinc-400'>
                Yes! Agency plan users and teams can schedule personalized demos. Please mention
                this in your message and we'll arrange a convenient time.
              </p>
            </div>
            <div>
              <h3 className='mb-2 font-semibold text-zinc-900 dark:text-zinc-50'>
                Where can I find technical documentation?
              </h3>
              <p className='text-sm text-zinc-600 dark:text-zinc-400'>
                Our comprehensive documentation and API reference are available in the Help Center.
                You can also check our FAQ section for quick answers.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
