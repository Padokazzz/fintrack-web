import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(80, "Name must not exceed 80 characters"),
  type: z.union([z.literal(1), z.literal(2)]),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
