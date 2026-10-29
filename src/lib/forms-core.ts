import { z } from "zod";

export const contactSchema = z.object({
  idempotencyKey: z.string().uuid(),
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("A valid email is required").max(320),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  reason: z.string().trim().max(100).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(5000),
  company: z.string().optional().or(z.literal("")),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(320),
  website: z.string().optional().or(z.literal("")),
});

export function sanitizeFormText(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s{3,}/g, "  ")
    .trim();
}

export function normalizeEmail(value: string) {
  return sanitizeFormText(value).toLowerCase();
}
