import { z } from "zod";
import type { TranslationDictionary } from "../../lib/i18n/translations";

export function createCategorySchema(t: TranslationDictionary) {
  return z.object({
    name: z
      .string()
      .min(1, t.validation.nameRequired)
      .max(80, t.validation.nameMax),
    type: z.union([z.literal(1), z.literal(2)]),
  });
}

export const categorySchema = createCategorySchema({
  validation: {
    nameRequired: "Name is required",
    nameMax: "Name must not exceed 80 characters",
  },
} as TranslationDictionary);

export type CategoryFormData = z.infer<typeof categorySchema>;
