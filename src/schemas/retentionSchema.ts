import { z } from "zod";

import { isValidISODate } from "../utils/dates";

export const retentionCategorySchema = z.enum([
  "tax",
  "tag",
  "accountant",
  "savings",
]);

export const retentionSchema = z
  .object({
    category: retentionCategorySchema,
    retentionDate: z.string().min(1, "Selecciona la fecha"),
    amount: z
      .number()
      .int()
      .positive("El monto debe ser mayor que cero"),
    description: z.string().trim().optional(),
    reference: z.string().trim().optional(),
  })
  .superRefine((input, context) => {
    if (!isValidISODate(input.retentionDate)) {
      context.addIssue({
        code: "custom",
        path: ["retentionDate"],
        message: "Usa una fecha valida con formato AAAA-MM-DD",
      });
    }
  });

export type RetentionFormValues = z.infer<typeof retentionSchema>;
