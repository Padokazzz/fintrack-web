import { z } from "zod";
import type { TranslationDictionary } from "../../lib/i18n/translations";

export function createTransactionSchema(t: TranslationDictionary) {
  return z.object({
    description: z
      .string()
      .min(1, t.validation.descriptionRequired)
      .max(150, t.validation.descriptionMax),

    amount: z.number().positive(t.validation.amountPositive),

    date: z.string().min(1, t.validation.dateRequired),

    type: z.union([z.literal(1), z.literal(2)]),

    accountId: z.string().uuid(t.validation.validAccount),

    categoryId: z.string().uuid(t.validation.validCategory),
  });
}

export const transactionSchema = createTransactionSchema({
  validation: {
    descriptionRequired: "Description is required",
    descriptionMax: "Description must not exceed 150 characters",
    amountPositive: "Amount must be greater than zero",
    dateRequired: "Date is required",
    validAccount: "Select a valid account",
    validCategory: "Select a valid category",
  },
} as TranslationDictionary);

export type TransactionFormData = z.infer<typeof transactionSchema>;
