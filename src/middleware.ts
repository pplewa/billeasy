import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./i18n";

// Define the paths that don't require authentication
const publicPaths = ["/", "/signin", "/verify"];

// Check if the given path is a public path
const isPublicPath = (path: string): boolean => {
  return publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
  );
};

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Normalize the pathname to remove locale
  const pathnameWithoutLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
    ? pathname.replace(/^\/[^\/]+/, "") || "/"
    : pathname;

  // Handle authentication
  const authToken = request.cookies.get("authToken")?.value;
  const isAuthenticated = !!authToken; // Simple check for auth token presence

  // If the path requires authentication and the user is not authenticated, redirect to sign in
  if (!isPublicPath(pathnameWithoutLocale) && !isAuthenticated) {
    const signInUrl = new URL(`/${defaultLocale}/signin`, request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If the path is sign-in related and the user is authenticated, redirect to dashboard
  if (pathnameWithoutLocale === "/signin" && isAuthenticated) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}/dashboard`, request.url)
    );
  }

  // Otherwise, apply the intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all paths except for
  // - API routes
  // - Static files
  // - _next
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
