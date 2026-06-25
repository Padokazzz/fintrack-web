import {z} from "zod";

export const transactionSchema = z.object({
    description: z
        .string()
        .min(1, "Description is required")
        .max(150, "Description must not exceed 150 characters"),

    amount: z
        .number()
        .positive("Amount must be greater than zero"),

    date: z
        .string()
        .min(1, "Date is required"),

    type: z.union([
        z.literal(1),
        z.literal(2),
    ]),
    accountId: z
        .string()
        .uuid("Select a valid account"),

    categoryId: z
    .string()
    .uuid("Select a valid category"),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;