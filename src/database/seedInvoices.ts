import type * as SQLite from "expo-sqlite";

import {
  calculateInvoiceTotal,
  calculateTax,
} from "../domain/invoiceCalculations";

interface SeedInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  description: string;
  netAmount: number;
  taxPaymentDate?: string;
  taxPayment?: number;
  tagAmount?: number;
  accountantAmount?: number;
  savingsAmount?: number;
}

const INITIAL_INVOICES: SeedInvoice[] = [
  {
    id: "excel-invoice-1",
    invoiceNumber: "1",
    invoiceDate: "2026-03-29",
    clientName: "M&Y Spa",
    description: "",
    netAmount: 900981,
  },
  {
    id: "excel-invoice-2",
    invoiceNumber: "2",
    invoiceDate: "2026-04-05",
    clientName: "M&Y Spa",
    description: "",
    netAmount: 589515,
  },
  {
    id: "excel-invoice-3",
    invoiceNumber: "3",
    invoiceDate: "2026-04-19",
    clientName: "m&y sPA",
    description: "",
    netAmount: 483353,
    taxPaymentDate: "2026-04-20",
    taxPayment: 150886,
  },
  {
    id: "excel-invoice-4",
    invoiceNumber: "4",
    invoiceDate: "2026-04-25",
    clientName: "M&Y Spa",
    description: "",
    netAmount: 855032,
  },
  {
    id: "excel-invoice-5",
    invoiceNumber: "5",
    invoiceDate: "2026-04-30",
    clientName: "M&Y Spa",
    description: "",
    netAmount: 543594,
  },
  {
    id: "excel-invoice-6",
    invoiceNumber: "6",
    invoiceDate: "2026-05-11",
    clientName: "M&Y Spa",
    description: "",
    netAmount: 496419,
  },
  {
    id: "excel-invoice-7",
    invoiceNumber: "7",
    invoiceDate: "2026-05-17",
    clientName: "M&Y",
    description: "",
    netAmount: 649120,
  },
  {
    id: "excel-invoice-8",
    invoiceNumber: "8",
    invoiceDate: "2026-05-25",
    clientName: "M&Y Spa",
    description: "",
    netAmount: 421330,
    taxPaymentDate: "2026-05-22",
    taxPayment: 292104,
  },
  {
    id: "excel-invoice-9",
    invoiceNumber: "9",
    invoiceDate: "2026-06-02",
    clientName: "M&Y Spa",
    description: "",
    netAmount: 452093,
  },
  {
    id: "excel-invoice-10",
    invoiceNumber: "10",
    invoiceDate: "2026-06-05",
    clientName: "M&Y Spa",
    description: "",
    netAmount: 759710,
  },
  {
    id: "excel-invoice-11",
    invoiceNumber: "11",
    invoiceDate: "2026-06-14",
    clientName: "M&I spa",
    description: "",
    netAmount: 704700,
  },
  {
    id: "excel-invoice-12",
    invoiceNumber: "12",
    invoiceDate: "2026-06-23",
    clientName: "M&Y Spa",
    description: "",
    netAmount: 1135174,
    taxPaymentDate: "2026-06-23",
    taxPayment: 179460,
  },
  {
    id: "excel-invoice-14",
    invoiceNumber: "14",
    invoiceDate: "2026-07-05",
    clientName: "M&Y Spa",
    description: "",
    netAmount: 1332000,
    taxPaymentDate: "2026-07-17",
    taxPayment: 537410,
  },
  {
    id: "excel-invoice-15",
    invoiceNumber: "15",
    invoiceDate: "2026-07-22",
    clientName: "M&Y Spa",
    description: "",
    netAmount: 1308410,
  },
  {
    id: "excel-invoice-16",
    invoiceNumber: "16",
    invoiceDate: "2026-07-23",
    clientName: "M&Y Spa",
    description: "",
    netAmount: 656069,
  },
  {
    id: "excel-invoice-18",
    invoiceNumber: "18",
    invoiceDate: "2026-08-10",
    clientName: "M&Y Spa",
    description: "",
    netAmount: 954331,
  },
  {
    id: "excel-invoice-19",
    invoiceNumber: "19",
    invoiceDate: "2026-08-11",
    clientName: "M&Y Spa",
    description: "",
    netAmount: 740899,
  },
];

export async function seedInitialInvoices(
  db: SQLite.SQLiteDatabase,
): Promise<void> {
  const row = await db.getFirstAsync<{ invoice_count: number }>(
    "SELECT COUNT(*) AS invoice_count FROM invoices",
  );

  if ((row?.invoice_count ?? 0) > 0) {
    return;
  }

  await replaceImportedSeedInvoices(db);
}

export async function replaceImportedSeedInvoices(
  db: SQLite.SQLiteDatabase,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `DELETE FROM tax_payments
       WHERE source_type = 'migrated'
         AND source_invoice_id LIKE 'excel-invoice-%'`,
    );
    await db.runAsync("DELETE FROM invoices WHERE id LIKE 'excel-invoice-%'");

    for (const invoice of INITIAL_INVOICES) {
      const existingInvoice = await db.getFirstAsync<{ id: string }>(
        "SELECT id FROM invoices WHERE invoice_number = ?",
        [invoice.invoiceNumber],
      );
      if (existingInvoice) {
        continue;
      }

      const taxAmount = calculateTax(invoice.netAmount);
      const totalAmount = calculateInvoiceTotal(invoice.netAmount, taxAmount);
      const timestamp = `${invoice.invoiceDate}T12:00:00.000Z`;

      await db.runAsync(
        `INSERT INTO invoices (
          id,
          invoice_number,
          invoice_date,
          client_name,
          description,
          net_amount,
          tax_amount,
          total_amount,
          payment_date,
          tax_payment,
          tag_amount,
          accountant_amount,
          savings_amount,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoice.id,
          invoice.invoiceNumber,
          invoice.invoiceDate,
          invoice.clientName,
          invoice.description?.trim() || null,
          invoice.netAmount,
          taxAmount,
          totalAmount,
          invoice.invoiceDate,
          0,
          0,
          0,
          0,
          timestamp,
          timestamp,
        ],
      );

      if (invoice.taxPayment && invoice.taxPaymentDate) {
        await db.runAsync(
          `INSERT INTO tax_payments (
            id, tax_period, payment_date, amount, description,
            reference, source_invoice_id, source_type, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'migrated', ?, ?)`,
          [
            `seed-tax-${invoice.id}`,
            invoice.invoiceDate.slice(0, 7),
            invoice.taxPaymentDate,
            invoice.taxPayment,
            "Pago IVA importado desde manuel pollo.xlsx",
            invoice.invoiceNumber,
            invoice.id,
            timestamp,
            timestamp,
          ],
        );
      }
    }
  });
}
