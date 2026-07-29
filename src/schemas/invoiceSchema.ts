import { z } from "zod";

import { isValidISODate } from "../utils/dates";

export const invoiceSchema = z.object({
  invoiceNumber: z
    .string()
    .trim()
    .min(1, "Ingresa el numero de factura"),

  invoiceDate: z.string().min(1, "Selecciona la fecha"),

  clientName: z.string().trim().min(1, "Ingresa el cliente"),

  description: z.string().trim().optional(),

  netAmount: z
    .number()
    .int()
    .positive("El monto neto debe ser mayor que cero"),
}).superRefine((input, context) => {
  if (!isValidISODate(input.invoiceDate)) {
    context.addIssue({
      code: "custom",
      path: ["invoiceDate"],
      message: "Usa una fecha valida con formato AAAA-MM-DD",
    });
  }
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
