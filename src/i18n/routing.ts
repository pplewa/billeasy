import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

// Define all available locales
export const locales = ['en', 'es', 'fr', 'de', 'pl', 'pt', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Define routing configuration
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/invoices': {
      en: '/invoices',
      es: '/facturas',
      fr: '/factures',
      de: '/rechnungen',
      pl: '/faktury',
      pt: '/faturas',
      zh: '/发票',
    },
    '/invoice/create': {
      en: '/invoice/create',
      es: '/factura/crear',
      fr: '/facture/creer',
      de: '/rechnung/erstellen',
      pl: '/faktura/utworz',
      pt: '/fatura/criar',
      zh: '/发票/创建',
    },
    '/privacy-policy': {
      en: '/privacy-policy',
      es: '/politica-de-privacidad',
      fr: '/politique-de-confidentialite',
      de: '/datenschutzrichtlinie',
      pl: '/polityka-prywatnosci',
      pt: '/politica-de-privacidade',
      zh: '/隐私政策',
    },
    '/terms-of-service': {
      en: '/terms-of-service',
      es: '/terminos-de-servicio',
      fr: '/conditions-d-utilisation',
      de: '/nutzungsbedingungen',
      pl: '/warunki-korzystania-z-uslugi',
      pt: '/termos-de-servico',
      zh: '/服务条款',
    },
    '/signin': {
      en: '/signin',
      es: '/iniciar-sesion',
      fr: '/connexion',
      de: '/anmelden',
      pl: '/zaloguj-sie',
      pt: '/entrar',
      zh: '/登录',
    },
    '/verify': {
      en: '/verify',
      es: '/verificar',
      fr: '/verifier',
      de: '/verifizieren',
      pl: '/weryfikacja',
      pt: '/verificar',
      zh: '/验证',
    },
  },
});

// Create navigation utilities
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
