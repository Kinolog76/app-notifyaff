import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { contactFormLimiter, getClientIp, checkRateLimit } from '@/lib/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

// HTML escape function to prevent XSS in emails
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const ip = getClientIp(request);
    const { success, limit, remaining, reset } = await checkRateLimit(contactFormLimiter, ip);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'You have exceeded the rate limit. Please try again later.',
          limit,
          remaining,
          reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit?.toString() || '0',
            'X-RateLimit-Remaining': remaining?.toString() || '0',
            'X-RateLimit-Reset': reset?.toString() || '0',
          },
        }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, subject, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Sanitize all user inputs to prevent XSS in emails
    const sanitizedFirstName = escapeHtml(firstName);
    const sanitizedLastName = escapeHtml(lastName);
    const sanitizedEmail = escapeHtml(email);
    const sanitizedSubject = escapeHtml(subject);
    const sanitizedMessage = escapeHtml(message);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'NotifyAff Contact <onboarding@resend.dev>', // Replace with your verified domain
      to: [process.env.CONTACT_EMAIL || 'your-email@example.com'],
      replyTo: email,
      subject: `Contact Form: ${sanitizedSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #18181b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>

          <div style="margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>From:</strong> ${sanitizedFirstName} ${sanitizedLastName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${sanitizedSubject}</p>
          </div>

          <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #18181b; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; color: #3f3f46;">${sanitizedMessage}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 20px 0;" />

          <p style="color: #71717a; font-size: 12px;">
            This email was sent from the NotifyAff contact form.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Email sent successfully', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
