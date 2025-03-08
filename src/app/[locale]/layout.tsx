import AuthProvider from '@/components/auth/AuthProvider';
import MainNav from '@/components/layout/MainNav';
import { Locale, locales } from '@/i18n/routing';
import { NextIntlClientProvider } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { dancingScript, greatVibes, pacifico, outfit } from '@/lib/fonts';

const inter = Inter({ subsets: ['latin'] });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  // Validate the locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale as Locale);

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${dancingScript.variable} ${greatVibes.variable} ${pacifico.variable} ${outfit.variable}`}
    >
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <MainNav />
              <main className="flex-1 container mx-auto">{children}</main>
              <footer className="border-t py-4 text-center text-sm text-gray-500">
                <div className="container mx-auto px-4">
                  &copy; {new Date().getFullYear()} Bill Easy {' · '} All rights reserved {' · '}
                  <Link href={{ pathname: '/privacy-policy' }}>Privacy Policy</Link>
                  {' · '}
                  <Link href={{ pathname: '/terms-of-service' }}>Terms of Service</Link>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </NextIntlClientProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
