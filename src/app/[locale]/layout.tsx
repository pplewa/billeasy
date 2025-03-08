import AuthProvider from '@/components/auth/AuthProvider';
import MainNav from '@/components/layout/MainNav';
import { Locale, locales } from '@/i18n/routing';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { dancingScript, greatVibes, pacifico, outfit } from '@/lib/fonts';
import Footer from '@/components/layout/Footer';

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
              <Footer />
            </div>
          </AuthProvider>
        </NextIntlClientProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
