import { z } from "zod";

import { isValidISODate } from "../utils/dates";

const TAX_PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export const taxPaymentSchema = z
  .object({
    taxPeriod: z.string().trim().min(1, "Ingresa el periodo"),
    paymentDate: z.string().min(1, "Selecciona la fecha"),
    amount: z
      .number()
      .int()
      .positive("El monto debe ser mayor que cero"),
    description: z.string().trim().optional(),
    reference: z.string().trim().optional(),
  })
  .superRefine((input, context) => {
    if (!TAX_PERIOD_PATTERN.test(input.taxPeriod)) {
      context.addIssue({
        code: "custom",
        path: ["taxPeriod"],
        message: "Usa un periodo valido con formato AAAA-MM",
      });
    }

    if (!isValidISODate(input.paymentDate)) {
      context.addIssue({
        code: "custom",
        path: ["paymentDate"],
        message: "Usa una fecha valida con formato AAAA-MM-DD",
      });
    }
  });

export type TaxPaymentFormValues = z.infer<typeof taxPaymentSchema>;
