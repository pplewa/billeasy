// Third-party imports
import numberToWords from 'number-to-words';

// App imports
import currenciesDetails from '@/public/assets/data/currencies.json';
import { CurrencyDetails } from '@/types';

/**
 * Formats a date value to a consistent, locale-appropriate string representation
 * Handles various input types (Date object, string, etc.) with proper error handling
 *
 * @param value Any date-like value to format
 * @param options Optional Intl.DateTimeFormatOptions
 * @returns Formatted date string, or empty string for invalid inputs
 */
export const formatDate = (
  value: unknown,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string => {
  if (!value) return '';

  // If it's already a Date object
  if (value instanceof Date) {
    return value.toLocaleDateString('en-US', options);
  }

  // If it's a string that looks like a date
  if (typeof value === 'string') {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', options);
      }
    } catch {
      // If date parsing fails, return the original string
    }
  }

  // Fallback to returning the value as string
  return String(value);
};

/**
 * Format a number as currency with the specified currency code
 *
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
 * Formats a number with commas and decimal places
 *
 * @param number - Number to format
 * @returns A styled number to be displayed on the invoice
 */
export const formatNumberWithCommas = (number: number): string => {
  return number.toLocaleString('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Safely parses a numeric value from various input types
 *
 * @param value Any value that might represent a number
 * @returns Parsed number, or 0 for invalid inputs
 */
export const parseNumber = (value: unknown): number => {
  if (value === undefined || value === null) return 0;

  return typeof value === 'string' ? parseFloat(value) || 0 : typeof value === 'number' ? value : 0;
};

/**
 * Fetch currency details for a given currency code
 *
 * @param currency - The currency that is currently selected
 * @returns Currency details object or null if not found
 */
export const fetchCurrencyDetails = (currency: string): CurrencyDetails | null => {
  const data = currenciesDetails as Record<string, CurrencyDetails>;
  const currencyDetails = data[currency];
  return currencyDetails || null;
};

/**
 * Turns a number into words for invoices
 *
 * @param price - Number to format
 * @param currency - The currency to format the price in
 * @returns Number in words
 */
export const formatPriceToString = (price: number, currency: string): string => {
  // Initialize variables
  let decimals: number;
  let beforeDecimal: string | null = null;
  let afterDecimal: string | null = null;

  const currencyDetails = fetchCurrencyDetails(currency);

  // If currencyDetails is available, use its values, else dynamically set decimals
  if (currencyDetails) {
    decimals = currencyDetails.decimals;
    beforeDecimal = currencyDetails.beforeDecimal;
    afterDecimal = currencyDetails.afterDecimal;
  } else {
    // Dynamically get decimals from the price if currencyDetails is null
    const priceString = price.toString();
    const decimalIndex = priceString.indexOf('.');
    decimals = decimalIndex !== -1 ? priceString.split('.')[1].length : 0;
  }

  // Ensure the price is rounded to the appropriate decimal places
  const roundedPrice = parseFloat(price.toFixed(decimals));

  // Split the price into integer and fractional parts
  const integerPart = Math.floor(roundedPrice);

  const fractionalMultiplier = Math.pow(10, decimals);
  const fractionalPart = Math.round((roundedPrice - integerPart) * fractionalMultiplier);

  // Convert the integer part to words with a capitalized first letter
  const integerPartInWords = numberToWords
    .toWords(integerPart)
    .replace(/^\w/, (c: string) => c.toUpperCase());

  // Convert fractional part to words
  const fractionalPartInWords = fractionalPart > 0 ? numberToWords.toWords(fractionalPart) : null;

  // Handle zero values for both parts
  if (integerPart === 0 && fractionalPart === 0) {
    return 'Zero';
  }

  // Combine the parts into the final string
  let result = integerPartInWords;

  // Check if beforeDecimal is not null
  if (beforeDecimal !== null) {
    result += ` ${beforeDecimal}`;
  }

  if (fractionalPartInWords) {
    // Check if afterDecimal is not null
    if (afterDecimal !== null) {
      // Concatenate the after decimal and fractional part
      result += ` and ${fractionalPartInWords} ${afterDecimal}`;
    } else {
      // If afterDecimal is null, concatenate the fractional part
      result += ` point ${fractionalPartInWords}`;
    }
  }

  return result;
};
