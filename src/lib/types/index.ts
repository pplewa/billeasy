/**
 * Type definition for translation function
 * This helps avoid using 'any' in component props
 */
export interface TranslationFunction {
  (key: string, params?: Record<string, string | number | boolean>): string;
}
