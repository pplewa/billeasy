/**
 * Validates an email address
 *
 * @param email - Email to validate
 * @returns A boolean indicating if the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  // Regular expression for a simple email pattern
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

/**
 * Checks if a string is a data URL
 *
 * @param str - String to check
 * @returns Boolean indicating if the string is a data URL
 */
export const isDataUrl = (str: string): boolean => str.startsWith('data:');
