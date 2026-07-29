import { z } from "zod";

import {
  calculateAllocatedAmount,
  calculateInvoiceTotal,
  calculateTax,
} from "../services/invoiceCalculations";
import { isValidISODate } from "../utils/dates";

export const invoiceSchema = z
  .object({
    invoiceNumber: z
      .string()
      .trim()
      .min(1, "Ingresa el número de factura"),

    invoiceDate: z.string().min(1, "Selecciona la fecha"),

    clientName: z.string().trim().min(1, "Ingresa el cliente"),

    description: z.string().trim().optional(),

    netAmount: z
      .number()
      .int()
      .positive("El monto neto debe ser mayor que cero"),

    paymentDate: z.string().optional(),

    taxPayment: z.number().int().min(0, "Pago IVA no puede ser negativo"),

    tagAmount: z.number().int().min(0, "TAG no puede ser negativo"),

    accountantAmount: z
      .number()
      .int()
      .min(0, "Contador no puede ser negativo"),

    savingsAmount: z.number().int().min(0, "Ahorro no puede ser negativo"),
  })
  .superRefine((input, context) => {
    if (!isValidISODate(input.invoiceDate)) {
      context.addIssue({
        code: "custom",
        path: ["invoiceDate"],
        message: "Usa una fecha válida con formato AAAA-MM-DD",
      });
    }

    if (input.paymentDate && !isValidISODate(input.paymentDate)) {
      context.addIssue({
        code: "custom",
        path: ["paymentDate"],
        message: "Usa una fecha válida con formato AAAA-MM-DD",
      });
    }

    const taxAmount = calculateTax(input.netAmount);
    const totalAmount = calculateInvoiceTotal(input.netAmount, taxAmount);
    const allocatedAmount = calculateAllocatedAmount({
      taxPayment: input.taxPayment,
      tagAmount: input.tagAmount,
      accountantAmount: input.accountantAmount,
      savingsAmount: input.savingsAmount,
    });

    if (allocatedAmount > totalAmount) {
      context.addIssue({
        code: "custom",
        path: ["savingsAmount"],
        message: "Las separaciones no pueden superar el total de la factura",
      });
    }
  });

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
