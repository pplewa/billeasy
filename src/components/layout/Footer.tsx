'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const appT = useTranslations('app');
  const appName = appT('name');

  return (
    <footer className="border-t py-4 text-center text-sm text-gray-500">
      <div className="container mx-auto px-4">
        &copy; {new Date().getFullYear()} {appName} {' · '} {t('allRightsReserved')} {' · '}
        <Link href={{ pathname: '/privacy-policy' }}>{t('privacyPolicy')}</Link>
        {' · '}
        <Link href={{ pathname: '/terms-of-service' }}>{t('termsOfService')}</Link>
      </div>
    </footer>
  );
} 