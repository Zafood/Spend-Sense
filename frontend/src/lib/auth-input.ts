import { z } from "zod";

// Normalize once for registration and credential lookup.
export const emailSchema = z.email().max(320).transform((value) => value.trim().toLowerCase());
export const passwordSchema = z.string().min(12, "Password must contain at least 12 characters.").max(128);
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(1).max(120).optional(),
}).strict();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});
