import { z } from "zod";
import type { TranslationDictionary } from "../../lib/i18n/translations";

export function createTransferSchema(t: TranslationDictionary) {
  return z
    .object({
      description: z
        .string()
        .min(1, t.validation.descriptionRequired)
        .max(150, t.validation.descriptionMax),
      amount: z.number().positive(t.validation.amountPositive),
      date: z.string().min(1, t.validation.dateRequired),
      fromAccountId: z.string().uuid(t.validation.validAccount),
      toAccountId: z.string().uuid(t.validation.validAccount),
    })
    .refine((data) => data.fromAccountId !== data.toAccountId, {
      path: ["toAccountId"],
      message: t.transfers.sameAccountError,
    });
}

export type TransferFormData = z.infer<ReturnType<typeof createTransferSchema>>;
