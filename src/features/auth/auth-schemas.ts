import { z } from "zod";
import type { TranslationDictionary } from "../../lib/i18n/translations";

export function createRegisterSchema(t: TranslationDictionary) {
  return z.object({
    name: z.string().min(2, t.validation.nameMin),
    email: z.email(t.validation.validEmail),
    password: z.string().min(6, t.validation.passwordMin),
  });
}

export function createLoginSchema(t: TranslationDictionary) {
  return z.object({
    email: z.email(t.validation.validEmail),
    password: z.string().min(1, t.validation.passwordRequired),
  });
}

export const registerSchema = createRegisterSchema({
  validation: {
    nameMin: "Name must have at least 2 characters",
    validEmail: "Enter a valid email",
    passwordMin: "Password must have at least 6 characters",
  },
} as TranslationDictionary);

export const loginSchema = createLoginSchema({
  validation: {
    validEmail: "Enter a valid email",
    passwordRequired: "Password is required",
  },
} as TranslationDictionary);

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
