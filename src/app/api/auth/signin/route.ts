import { Locale } from '@/i18n/routing';
import { sendAuthEmail } from '@/lib/auth/auth';
import connectToDatabase from '@/lib/db/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const result = SignInSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 });
    }

    const { email } = result.data;

    // Connect to the database
    await connectToDatabase();

    // Get the preferred locale from the request headers or use default
    const localeFromHeader = request.headers.get('x-next-locale') || 'en';
    const locale = localeFromHeader as Locale;

    // Send the authentication email
    await sendAuthEmail(email, locale);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in signin API:', error);
    return NextResponse.json({ message: 'Failed to send login link' }, { status: 500 });
  }
}
