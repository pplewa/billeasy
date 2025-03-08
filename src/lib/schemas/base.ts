/**
 * Base schema utilities for Zod validations
 * This file defines common transformation and validation utilities
 */
import { z } from 'zod';

/**
 * Common field validators with consistent transformation logic
 */
export const fieldValidators = {
  /**
   * Optional string field that accepts string, null, or empty string
   */
  stringOptional: z.string().optional().or(z.null()).or(z.literal('')),

  /**
   * Optional MongoDB ObjectId field that handles various formats
   * This handles both string representations and object instances of MongoDB ObjectIds
   */
  objectIdOptional: z
    .union([
      z.string(),
      z.instanceof(Object), // Handles MongoDB ObjectId instances
      z.undefined(),
      z.null(),
      z.literal(''),
    ])
    .optional(),

  /**
   * Optional number field with transformation from string
   * Handles empty strings, nulls, and undefined values
   */
  numberOptional: z
    .union([
      z.number(),
      z.string().transform((val) => (val === '' ? undefined : Number(val))),
      z.undefined(),
      z.null(),
      z.literal(''),
    ])
    .optional(),

  /**
   * Optional date field with transformation from string
   * Handles date objects, date strings, and undefined/null values
   */
  dateOptional: z
    .union([
      z.date(),
      z.string().transform((val) => (val ? new Date(val) : undefined)),
      z.undefined(),
      z.null(),
      z.literal(''),
    ])
    .optional(),

  /**
   * Optional array field that can be an array, null, or empty string
   * @param schema The Zod schema for array elements
   */
  arrayOptional: (schema: z.ZodType) => z.array(schema).optional().or(z.null()).or(z.literal('')),
};

/**
 * Creates an amount-type schema (for tax, discount, etc.) with proper transformation
 * @param defaultAmount Default amount value if null or undefined
 * @param defaultType Default amount type if null or undefined
 * @returns A Zod schema for amount-type objects
 */
export function createAmountTypeSchema(
  defaultAmount: number = 0,
  defaultType: string = 'percentage'
) {
  return z.preprocess(
    (val) => {
      if (val === null || val === undefined) {
        return { amount: defaultAmount, amountType: defaultType };
      }

      // Handle legacy format where amount was just a number (percentage)
      if (typeof val === 'number') {
        return { amount: val, amountType: defaultType };
      }

      return val;
    },
    z
      .object({
        amount: fieldValidators.numberOptional,
        amountType: fieldValidators.stringOptional,
      })
      .passthrough()
      .optional()
      .nullable()
  );
}

/**
 * Helper to safely transform any unknown value to a strongly typed value
 * @param schema Zod schema to use for transformation
 * @param value Value to transform
 * @returns Transformed value with proper type
 */
export function safeTransform<T, S extends z.ZodType<T>>(schema: S, value: unknown): T {
  const result = schema.safeParse(value);
  if (result.success) {
    return result.data;
  }

  // Log validation errors in development
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Schema validation failed:', result.error);
  }

  // Return default value based on schema type
  return {} as T;
}
