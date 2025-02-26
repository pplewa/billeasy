import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

// Define all available locales
export const locales = ["en", "es", "fr", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// Define routing configuration
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/dashboard": {
      en: "/dashboard",
      es: "/panel",
      fr: "/tableau-de-bord",
      de: "/dashboard",
    },
    "/signin": {
      en: "/signin",
      es: "/iniciar-sesion",
      fr: "/connexion",
      de: "/anmelden",
    },
    "/verify": {
      en: "/verify",
      es: "/verificar",
      fr: "/verifier",
      de: "/verifizieren",
    },
  },
});

// Create navigation utilities
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
