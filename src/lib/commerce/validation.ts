import { z } from "zod";

export const addressSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(8).max(30).optional().or(z.literal("")),
  address1: z.string().trim().min(1).max(200),
  address2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(1).max(20),
  country: z.string().trim().length(2).toUpperCase(),
});

export const quoteSchema = addressSchema.extend({
  format: z.enum(["PAPERBACK", "HARDCOVER"]),
  quantity: z.number().int().min(1).max(10),
});

export const chargeSchema = quoteSchema.extend({
  shippingMethod: z.string().trim().min(1).max(50),
  paymentToken: z.string().trim().min(1).max(1000),
  idempotencyKey: z.string().uuid(),
  retryOrderNumber: z.string().trim().min(1).max(80).optional(),
  orderAccessToken: z.string().trim().min(40).max(200).optional(),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
