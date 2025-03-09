'use client';

import { Button } from '@/components/ui/button';
import { Link, Locale, usePathname } from '@/i18n/routing';
import useAuthStore from '@/store/auth-store';
import { useLocale, useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import Image from 'next/image';

export default function MainNav() {
  const t = useTranslations('navigation');
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  // Get auth state from zustand store
  const { user, clearUser } = useAuthStore();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const response = await fetch(`/api/auth/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        clearUser();
        window.location.href = `/${locale}`;
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="border-b sticky top-0 z-40 bg-white">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo-only.png" 
              alt="BillEasy Logo" 
              width={32} 
              height={32} 
              className="h-8 w-8"
            />
            <span className="text-xl font-bold">Bill Easy</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {user && (
              <Link
                href={{ pathname: '/invoices' }}
                className={`text-sm ${pathname.includes('/invoices') ? 'font-medium' : ''}`}
              >
                {t('invoices')}
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm hidden md:inline-block">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                {t('signOut')}
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/signin">{t('signIn')}</Link>
            </Button>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations('common');

  const languages: Record<Locale, { name: string; flag: string }> = {
    en: { name: 'English', flag: '🇺🇸' },
    es: { name: 'Español', flag: '🇪🇸' },
    fr: { name: 'Français', flag: '🇫🇷' },
    de: { name: 'Deutsch', flag: '🇩🇪' },
    pl: { name: 'Polski', flag: '🇵🇱' },
    pt: { name: 'Português', flag: '🇵🇹' },
    zh: { name: '中文', flag: '🇨🇳' },
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t('language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([lang, { name, flag }]) => (
          <DropdownMenuItem key={lang} asChild>
            <Link
              href={pathname}
              locale={lang as Locale}
              className={`flex items-center gap-2 w-full ${
                locale === lang ? 'font-medium bg-accent' : ''
              }`}
            >
              <span className="mr-1">{flag}</span>
              <span>{name}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
