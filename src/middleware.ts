import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, routing } from './i18n/routing';

// Define the paths that don't require authentication
const publicPaths = [
  '/',
  '/signin',
  '/verify',
  '/invoice/create',
  '/api/invoice/parse/text',
  '/api/invoice/parse/file',
];

// Check if the given path is a public path
const isPublicPath = (path: string): boolean => {
  return publicPaths.some((publicPath) => path === publicPath || path.startsWith(`${publicPath}/`));
};

// Create the next-intl middleware
const i18nMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Normalize the pathname to remove locale
  const pathnameWithoutLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
    ? pathname.replace(/^\/[^\/]+/, '') || '/'
    : pathname;

  // Handle authentication
  const authToken = request.cookies.get('authToken')?.value;
  const isAuthenticated = !!authToken; // Simple check for auth token presence
  const currentLocale = routing.locales.find(locale => pathname.startsWith(`/${locale}/`)) || defaultLocale;
  const signInPath = routing.pathnames['/signin'][currentLocale];

  // If the path requires authentication and the user is not authenticated, redirect to sign in
  if (pathnameWithoutLocale !== signInPath && !isPublicPath(pathnameWithoutLocale) && !isAuthenticated) {
    // Determine the current locale, defaulting to the default locale if not found
    
    const signInUrl = new URL(`/${currentLocale}${signInPath}`, request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If the path is sign-in related and the user is authenticated, redirect to dashboard
  if (pathnameWithoutLocale === signInPath && isAuthenticated) {
    return NextResponse.redirect(new URL(`/${defaultLocale}/invoices`, request.url));
  }

  // Otherwise, apply the intl middleware
  return i18nMiddleware(request);
}

export const config = {
  // Match all paths except for
  // - API routes
  // - Static files
  // - _next
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
