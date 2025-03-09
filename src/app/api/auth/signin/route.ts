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

    // Improved locale detection with logging
    const localeFromHeader =
      request.headers.get('x-next-locale') ||
      request.headers.get('accept-language')?.split(',')[0].split('-')[0] ||
      'en';

    // Validate locale is one of the supported locales
    const supportedLocales: Locale[] = ['en', 'es', 'fr', 'de', 'pl', 'pt', 'zh'];
    const locale = supportedLocales.includes(localeFromHeader as Locale)
      ? (localeFromHeader as Locale)
      : 'en';

    console.log(`Sending auth email for ${email} with locale: ${locale}`);

    // Send the authentication email
    await sendAuthEmail(email, locale);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in signin API:', error);
    return NextResponse.json({ message: 'Failed to send login link' }, { status: 500 });
  }
}
