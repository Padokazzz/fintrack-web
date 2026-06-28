import { z } from "zod";
import type { TranslationDictionary } from "../../lib/i18n/translations";

export function createAccountSchema(t: TranslationDictionary) {
  return z.object({
    name: z.string().min(2, t.validation.nameMin),
    type: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ]),
    initialBalance: z
      .number()
      .min(0, t.validation.initialBalancePositive)
      .optional(),
  });
}

export const accountSchema = createAccountSchema({
  validation: {
    nameMin: "Name must have at least 2 characters",
    initialBalancePositive: "Initial balance cannot be negative",
  },
} as TranslationDictionary);

export type AccountFormData = z.infer<typeof accountSchema>;
