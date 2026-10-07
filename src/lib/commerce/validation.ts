import { z } from "zod";

const customerSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(8).max(30).optional().or(z.literal("")),
});

export const addressSchema = customerSchema.extend({
  address1: z.string().trim().min(1).max(200),
  address2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(1).max(20),
  country: z.string().trim().length(2).toUpperCase(),
});

const physicalQuoteSchema = addressSchema.extend({
  format: z.enum(["PAPERBACK", "HARDCOVER"]),
  quantity: z.number().int().min(1).max(10),
});

const ebookQuoteSchema = customerSchema.extend({
  format: z.literal("EBOOK"),
  quantity: z.literal(1),
}).strict();

export const quoteSchema = z.discriminatedUnion("format", [physicalQuoteSchema, ebookQuoteSchema]);

const paymentSchema = z.object({
  paymentToken: z.string().trim().min(1).max(1000),
  idempotencyKey: z.string().uuid(),
  retryOrderNumber: z.string().trim().min(1).max(80).optional(),
  orderAccessToken: z.string().trim().min(40).max(200).optional(),
});

export const chargeSchema = z.discriminatedUnion("format", [
  physicalQuoteSchema.extend({ shippingMethod: z.string().trim().min(1).max(50), reviewedQuote: z.string().trim().min(1).max(4_000) }).merge(paymentSchema),
  ebookQuoteSchema.extend({ shippingMethod: z.literal("DIGITAL_DELIVERY") }).merge(paymentSchema).strict(),
]);

export type QuoteInput = z.infer<typeof quoteSchema>;
export type PhysicalQuoteInput = z.infer<typeof physicalQuoteSchema>;
export type ChargeInput = z.infer<typeof chargeSchema>;
