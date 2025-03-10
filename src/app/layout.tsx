import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'BillEasy - Simplified Billing and Invoice Management',
    template: '%s | BillEasy',
  },
  description:
    'Streamline your business finances with BillEasy - A comprehensive billing and invoicing solution for modern businesses. Manage invoices, track expenses, and simplify financial workflows effortlessly.',
  applicationName: 'BillEasy',
  keywords: [
    'billing',
    'invoicing',
    'finance management',
    'business tools',
    'expense tracking',
    'invoice generator',
    'small business software',
  ],
  authors: [{ name: 'BillEasy Team' }],
  creator: 'BillEasy Development Team',
  publisher: 'BillEasy',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://billeasy.online',
    siteName: 'BillEasy',
    title: 'BillEasy - Simplified Billing and Invoice Management',
    description:
      'Streamline your business finances with BillEasy - A comprehensive billing and invoicing solution for modern businesses.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'BillEasy Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BillEasy - Simplified Billing and Invoice Management',
    description:
      'Streamline your business finances with BillEasy - A comprehensive billing and invoicing solution for modern businesses.',
    images: ['/logo.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
