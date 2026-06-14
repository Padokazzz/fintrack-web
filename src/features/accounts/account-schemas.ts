import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters"),
  type: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  initialBalance: z
    .number()
    .min(0, "Initial balance cannot be negative")
    .optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;
