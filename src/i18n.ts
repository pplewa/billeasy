export const locales = ["en", "es", "fr", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// Define messages for each locale
export async function getMessages(locale: string) {
  // Validate locale to make sure it's one of our supported locales
  if (!locales.includes(locale as Locale)) {
    throw new Error(`Locale ${locale} is not supported`);
  }

  // Now TypeScript knows locale can only be one of our supported locales
  const validLocale = locale as Locale;

  const loaders = {
    en: () => import("./messages/en.json").then((module) => module.default),
    es: () => import("./messages/es.json").then((module) => module.default),
    fr: () => import("./messages/fr.json").then((module) => module.default),
    de: () => import("./messages/de.json").then((module) => module.default),
  };

  return loaders[validLocale]();
}
