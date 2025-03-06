import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a readable string
 * @param date The date to format
 * @returns A formatted date string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a number as currency with the specified currency code
 * @param amount The amount to format
 * @param currencyCode The ISO currency code (e.g., 'USD', 'EUR')
 * @returns A formatted currency string
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Deep merge two objects
 * @param target Target object
 * @param source Source object
 * @returns Merged object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const output = { ...target };

  if (!source) return output;

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key as keyof typeof source];
    const targetValue = target[key as keyof T];

    // Special case for invoice items - ensure they're properly handled
    if (key === 'items' && Array.isArray(sourceValue) && sourceValue.length > 0) {
      // For invoice items, always prefer the source array if it has items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      output[key as keyof T] = sourceValue as unknown as T[keyof T];
    }
    // Handle arrays specially - prefer source arrays over target arrays
    else if (Array.isArray(sourceValue)) {
      // If source has a non-empty array, use it
      if (sourceValue.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        output[key as keyof T] = sourceValue as unknown as T[keyof T];
      }
    } else if (
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      // If both values are objects, recursively merge them
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      output[key as keyof T] = deepMerge(
        targetValue,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sourceValue as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as unknown as T[keyof T];
    } else if (sourceValue !== undefined) {
      // For all other types, prefer source value if it exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      output[key as keyof T] = sourceValue as unknown as T[keyof T];
    }
  });

  return output;
}
