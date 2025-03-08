/**
 * Deep merge two objects
 * 
 * @param target Target object
 * @param source Source object
 * @returns Merged object
 */
export function deepMerge<T extends Record<string, unknown>>(
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
      output[key as keyof T] = sourceValue as unknown as T[keyof T];
    }
    // Handle arrays specially - prefer source arrays over target arrays
    else if (Array.isArray(sourceValue)) {
      // If source has a non-empty array, use it
      if (sourceValue.length > 0) {
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
      output[key as keyof T] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as unknown as T[keyof T];
    } else if (sourceValue !== undefined) {
      // For all other types, prefer source value if it exists
      output[key as keyof T] = sourceValue as unknown as T[keyof T];
    }
  });

  return output;
}

/**
 * This module contains utility functions for object manipulation.
 */

/**
 * Flattens a nested object. Used for xlsx export and other cases where 
 * a flat structure is required.
 *
 * @param {Record<string, T>} obj - A nested object to flatten
 * @param {string} parentKey - The parent key prefix for nested properties
 * @returns {Record<string, T>} A flattened object with concatenated key paths
 */
export const flattenObject = <T>(
  obj: Record<string, T>,
  parentKey = ""
): Record<string, T> => {
  const result: Record<string, T> = {};

  for (const key in obj) {
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      const flattened = flattenObject(
        obj[key] as Record<string, T>,
        parentKey + key + "_"
      );
      for (const subKey in flattened) {
        result[parentKey + subKey] = flattened[subKey];
      }
    } else {
      result[parentKey + key] = obj[key];
    }
  }

  return result;
}; 