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
    "/invoices": {
      en: "/invoices",
      es: "/facturas",
      fr: "/factures",
      de: "/rechnungen",
    },
    "/invoice/create": {
      en: "/invoice/create",
      es: "/factura/crear",
      fr: "/facture/creer",
      de: "/rechnung/erstellen",
    },
    "/drafts": {
      en: "/drafts",
      es: "/borradores",
      fr: "/brouillons",
      de: "/entwurfe",
    },
    "/privacy-policy": {
      en: "/privacy-policy",
      es: "/politica-de-privacidad",
      fr: "/politique-de-confidentialite",
      de: "/datenschutzrichtlinie",
    },
    "/terms-of-service": {
      en: "/terms-of-service",
      es: "/terminos-de-servicio",
      fr: "/conditions-d-utilisation",
      de: "/nutzungsbedingungen",
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
