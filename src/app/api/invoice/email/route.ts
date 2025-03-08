import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';

export async function POST(request: Request) {
  try {
    // Check if user is authenticated using our custom auth system
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { invoice, recipient, subject, message } = body;

    // Validate required fields
    if (!invoice || !recipient || !subject || !message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    // In a real implementation, this would connect to an email service
    // For example, using Nodemailer, SendGrid, or another email provider

    // For now, simulate email sending
    console.log('Sending email to:', recipient);
    console.log('Subject:', subject);
    console.log('Message:', message);
    console.log('Invoice:', invoice);

    // Return success response
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Failed to send email' }, { status: 500 });
  }
}
