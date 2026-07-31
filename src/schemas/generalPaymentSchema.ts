import { z } from "zod";

import { isValidISODate } from "../utils/dates";

export const generalPaymentCategorySchema = z.enum([
  "tag",
  "accountant",
  "savings",
]);

export const generalPaymentSchema = z
  .object({
    category: generalPaymentCategorySchema,
    paymentDate: z.string().min(1, "Selecciona la fecha"),
    amount: z
      .number()
      .int()
      .positive("El monto debe ser mayor que cero"),
    description: z.string().trim().optional(),
    reference: z.string().trim().optional(),
  })
  .superRefine((input, context) => {
    if (!isValidISODate(input.paymentDate)) {
      context.addIssue({
        code: "custom",
        path: ["paymentDate"],
        message: "Usa una fecha valida con formato AAAA-MM-DD",
      });
    }
  });

export type GeneralPaymentFormValues = z.infer<typeof generalPaymentSchema>;
