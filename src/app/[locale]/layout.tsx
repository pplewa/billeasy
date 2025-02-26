import MainNav from "@/components/layout/MainNav";
import { getMessages, locales } from "@/i18n";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: ReactNode;
  params: {
    locale: string;
  };
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  // Validate that the locale is supported
  if (!locales.includes(locale)) {
    notFound();
  }

  let messages;
  try {
    messages = await getMessages(locale);
  } catch {
    // If there's an error loading messages, show 404
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
        <footer className="border-t py-4 text-center text-sm text-gray-500">
          <div className="container mx-auto px-4">
            &copy; {new Date().getFullYear()} Scaffold. All rights reserved.
          </div>
        </footer>
      </div>
    </NextIntlClientProvider>
  );
}
