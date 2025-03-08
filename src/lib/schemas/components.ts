/**
 * Component schemas for reuse across the application
 * These schemas represent smaller parts of the invoice structure
 */
import { z } from "zod";
import { fieldValidators, createAmountTypeSchema } from "./base";

/**
 * Schema for custom input fields
 */
export const CustomInputSchema = z.object({
  key: fieldValidators.stringOptional,
  value: fieldValidators.stringOptional,
});

/**
 * Schema for amount-type values (tax, discount, etc.)
 */
export const AmountTypeSchema = createAmountTypeSchema();

/**
 * Schema for signature data
 */
export const SignatureSchema = z.object({
  data: fieldValidators.stringOptional,
  fontFamily: fieldValidators.stringOptional,
}).passthrough().optional().nullable();

/**
 * Schema for payment information
 */
export const PaymentInformationSchema = z.object({
  bankName: fieldValidators.stringOptional,
  accountName: fieldValidators.stringOptional, 
  accountNumber: fieldValidators.stringOptional,
  routingNumber: fieldValidators.stringOptional,
  iban: fieldValidators.stringOptional,
  swift: fieldValidators.stringOptional,
}).passthrough().optional().nullable();

/**
 * Schema for shipping information
 */
export const ShippingSchema = z.object({
  cost: fieldValidators.numberOptional,
  costType: fieldValidators.stringOptional,
}).passthrough().optional().nullable();

/**
 * Schema for invoice sender information
 */
export const SenderSchema = z.object({
  name: fieldValidators.stringOptional,
  address: fieldValidators.stringOptional,
  zipCode: fieldValidators.stringOptional,
  city: fieldValidators.stringOptional,
  country: fieldValidators.stringOptional,
  email: fieldValidators.stringOptional,
  phone: fieldValidators.stringOptional,
  customInputs: fieldValidators.arrayOptional(CustomInputSchema),
});

/**
 * Schema for invoice receiver information
 */
export const ReceiverSchema = z.object({
  name: fieldValidators.stringOptional,
  address: fieldValidators.stringOptional,
  zipCode: fieldValidators.stringOptional,
  city: fieldValidators.stringOptional,
  country: fieldValidators.stringOptional,
  email: fieldValidators.stringOptional,
  phone: fieldValidators.stringOptional,
  customInputs: fieldValidators.arrayOptional(CustomInputSchema),
}); 