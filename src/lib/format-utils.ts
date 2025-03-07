/**
 * Formats a date value to a consistent, locale-appropriate string representation
 * Handles various input types (Date object, string, etc.) with proper error handling
 * 
 * @param value Any date-like value to format
 * @returns Formatted date string, or empty string for invalid inputs
 */
export const formatDate = (value: unknown): string => {
  if (!value) return "";
  
  // If it's already a Date object
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  
  // If it's a string that looks like a date
  if (typeof value === "string") {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    } catch {
      // If date parsing fails, return the original string
    }
  }
  
  // Fallback to returning the value as string
  return String(value);
};

/**
 * Safely parses a numeric value from various input types
 * 
 * @param value Any value that might represent a number
 * @returns Parsed number, or 0 for invalid inputs
 */
export const parseNumber = (value: unknown): number => {
  if (value === undefined || value === null) return 0;
  
  return typeof value === "string"
    ? parseFloat(value) || 0
    : typeof value === "number"
      ? value
      : 0;
}; 