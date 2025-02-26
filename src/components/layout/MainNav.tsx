"use client";

import { Button } from "@/components/ui/button";
import { Locale } from "@/i18n";
import useAuthStore from "@/store/auth-store";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MainNav() {
  const t = useTranslations("navigation");
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  // Get auth state from zustand store
  const { user, clearUser } = useAuthStore();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const response = await fetch(`/api/auth/signout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        clearUser();
        window.location.href = `/${locale}`;
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="border-b sticky top-0 z-40 bg-white">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={`/${locale}`} className="text-xl font-bold">
            Scaffold
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href={`/${locale}`}
              className={`text-sm ${
                pathname === `/${locale}` ? "font-medium" : ""
              }`}
            >
              {t("home")}
            </Link>
            {user && (
              <Link
                href={`/${locale}/dashboard`}
                className={`text-sm ${
                  pathname.includes("/dashboard") ? "font-medium" : ""
                }`}
              >
                {t("dashboard")}
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm hidden md:inline-block">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                {t("signOut")}
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${locale}/signin`}>{t("signIn")}</Link>
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

  // Get path without the locale prefix
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  const languages: Record<Locale, { name: string; flag: string }> = {
    en: { name: "English", flag: "🇺🇸" },
    es: { name: "Español", flag: "🇪🇸" },
    fr: { name: "Français", flag: "🇫🇷" },
    de: { name: "Deutsch", flag: "🇩🇪" },
  };

  return (
    <div className="flex items-center gap-2">
      {Object.entries(languages).map(([lang, { name, flag }]) => (
        <Link
          key={lang}
          href={`/${lang}${pathnameWithoutLocale}`}
          className={`text-xs px-2 py-1 rounded-md ${
            locale === lang ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
          }`}
          title={name}
        >
          {flag}
        </Link>
      ))}
    </div>
  );
}
