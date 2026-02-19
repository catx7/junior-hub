import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { serverErrorResponse, validationErrorResponse } from '@/lib/auth-middleware';

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = contactSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const { name, email, subject, message } = validationResult.data;

    // TODO: Send email via SendGrid, AWS SES, or other email service
    // For now, just log the contact request
    console.log('📧 Contact Form Submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    // In production, you would send an email:
    // await sendEmail({
    //   to: 'support@localservices.com',
    //   from: email,
    //   subject: `Contact Form: ${subject}`,
    //   html: `
    //     <h2>New Contact Form Submission</h2>
    //     <p><strong>From:</strong> ${name} (${email})</p>
    //     <p><strong>Subject:</strong> ${subject}</p>
    //     <p><strong>Message:</strong></p>
    //     <p>${message}</p>
    //   `,
    // });

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us. We will respond within 24 hours.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return serverErrorResponse();
  }
}
