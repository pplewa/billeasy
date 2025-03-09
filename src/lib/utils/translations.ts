import { getTranslations as getServerTranslations } from 'next-intl/server';

/**
 * Type definition for a translation function
 */
export type TranslationFunction = (
  key: string,
  params?: Record<string, string | number | boolean>
) => string;

/**
 * Determines whether the code is running in a server context
 * This is needed to know whether we should use server or client translation methods
 */
export const isServer = () => typeof window === 'undefined';

/**
 * Server-side translation function
 * This should only be called in server components or during server-side rendering
 */
export const getServerTranslation = async (namespace: string): Promise<TranslationFunction> => {
  return await getServerTranslations(namespace);
};

/**
 * Unified translation function that works in both client and server contexts
 * In client templates, pass the client translation function
 * In server rendering (PDF export), the translation function will be obtained using getTranslations()
 */
export const getTranslationFunction = async (
  namespace: string,
  clientTranslation?: TranslationFunction
): Promise<TranslationFunction> => {
  // If running on the server and no client translation is provided, get server translations
  if (isServer() && !clientTranslation) {
    return await getServerTranslation(namespace);
  }

  // If client translation is provided, use it
  if (clientTranslation) {
    return clientTranslation;
  }

  // Fallback case (should not happen in practice)
  throw new Error(
    'No translation function available. Make sure to provide clientTranslation in client components.'
  );
};
