import { getDatabase } from "../../database/database";
import { insertRecordHistory } from "../../database/recordHistory";
import {
  calculateInvoiceTotal,
  calculateTax,
} from "../../domain/invoiceCalculations";
import { validateMoney } from "../../domain/money";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceStatus,
  InvoiceSummary,
  MonthlyInvoiceSummary,
} from "../../domain/Invoice";
import type { InvoiceRepository } from "../../domain/InvoiceRepository";
import { isValidISODate } from "../../utils/dates";
import { createId } from "../../utils/ids";
import { syncInvoiceAllocations } from "./syncInvoiceAllocations";

interface InvoiceRow {
  id: string;
  invoice_number: string;
  invoice_date: string;
  client_name: string;
  description: string | null;
  net_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_date: string | null;
  tax_payment: number;
  tag_amount: number;
  accountant_amount: number;
  savings_amount: number;
  created_at: string;
  updated_at: string;
}

interface NormalizedInvoiceInput {
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  description: string | null;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  paymentDate: string | null;
  taxPayment: number;
  tagAmount: number;
  accountantAmount: number;
  savingsAmount: number;
}

interface SummaryRow {
  invoice_count: number;
  total_net_amount: number;
  total_tax_amount: number;
  total_invoice_amount: number;
}

interface MonthlySummaryRow {
  period: string;
  invoice_count: number;
  net_amount: number;
  tax_amount: number;
  total_amount: number;
}

function mapInvoiceRow(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date,
    clientName: row.client_name,
    description: row.description,
    netAmount: row.net_amount,
    taxAmount: row.tax_amount,
    totalAmount: row.total_amount,
    paymentDate: row.payment_date,
    status: row.payment_date ? "paid" : "pending",
    taxPayment: row.tax_payment,
    tagAmount: row.tag_amount,
    accountantAmount: row.accountant_amount,
    savingsAmount: row.savings_amount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findInvoiceRowById(
  db: Awaited<ReturnType<typeof getDatabase>>,
  id: string,
): Promise<InvoiceRow | null> {
  return db.getFirstAsync<InvoiceRow>(
    "SELECT * FROM invoices WHERE id = ? LIMIT 1",
    [id],
  );
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes("unique")
  );
}

function normalizeInvoiceInput(
  input: CreateInvoiceInput,
): NormalizedInvoiceInput {
  const invoiceNumber = input.invoiceNumber.trim();
  const invoiceDate = input.invoiceDate.trim();
  const clientName = input.clientName.trim();
  const description = input.description?.trim() || null;
  const netAmount = Number(input.netAmount);
  const status = input.status ?? (input.paymentDate ? "paid" : "pending");
  const paymentDate =
    status === "paid" ? input.paymentDate?.trim() ?? "" : null;
  const taxPayment = Number(input.taxPayment ?? 0);
  const tagAmount = Number(input.tagAmount ?? 0);
  const accountantAmount = Number(input.accountantAmount ?? 0);
  const savingsAmount = Number(input.savingsAmount ?? 0);

  if (!invoiceNumber) {
    throw new Error("El numero de factura es obligatorio.");
  }

  if (!invoiceDate || !isValidISODate(invoiceDate)) {
    throw new Error("La fecha debe ser valida y usar formato AAAA-MM-DD.");
  }

  if (!clientName) {
    throw new Error("El cliente es obligatorio.");
  }

  validateMoney(netAmount, "Neto");

  if (netAmount <= 0) {
    throw new Error("El neto debe ser mayor que cero.");
  }

  const taxAmount = calculateTax(netAmount);
  const totalAmount = calculateInvoiceTotal(netAmount, taxAmount);

  if (status !== "pending" && status !== "paid") {
    throw new Error("El estado debe ser pendiente o pagada.");
  }

  if (status === "paid" && (!paymentDate || !isValidISODate(paymentDate))) {
    throw new Error(
      "La fecha de pago debe ser valida y usar formato AAAA-MM-DD.",
    );
  }

  validateMoney(taxPayment, "Pago de IVA");
  validateMoney(tagAmount, "Saldo TAG");
  validateMoney(accountantAmount, "Saldo Contador");
  validateMoney(savingsAmount, "Saldo Ahorro");

  return {
    invoiceNumber,
    invoiceDate,
    clientName,
    description,
    netAmount,
    taxAmount,
    totalAmount,
    status,
    paymentDate,
    taxPayment,
    tagAmount,
    accountantAmount,
    savingsAmount,
  };
}

export class SQLiteInvoiceRepository implements InvoiceRepository {
  async create(input: CreateInvoiceInput): Promise<Invoice> {
    const db = await getDatabase();
    const exists = await this.existsByInvoiceNumber(input.invoiceNumber);

    if (exists) {
      throw new Error("Ya existe una factura con ese numero");
    }

    const normalized = normalizeInvoiceInput(input);
    const id = createId("invoice");
    const now = new Date().toISOString();
    let createdInvoice: Invoice | null = null;

    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO invoices (
            id, invoice_number, invoice_date, client_name, description,
            net_amount, tax_amount, total_amount,
            payment_date, tax_payment, tag_amount, accountant_amount, savings_amount,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            normalized.invoiceNumber,
            normalized.invoiceDate,
            normalized.clientName,
            normalized.description,
            normalized.netAmount,
            normalized.taxAmount,
            normalized.totalAmount,
            normalized.paymentDate,
            normalized.taxPayment,
            normalized.tagAmount,
            normalized.accountantAmount,
            normalized.savingsAmount,
            now,
            now,
          ],
        );

        await syncInvoiceAllocations(
          db,
          {
            id,
            invoiceDate: normalized.invoiceDate,
            paymentDate: normalized.paymentDate,
          },
          {
            taxPayment: normalized.taxPayment,
            tagAmount: normalized.tagAmount,
            accountantAmount: normalized.accountantAmount,
            savingsAmount: normalized.savingsAmount,
          },
          now,
        );

        const row = await findInvoiceRowById(db, id);
        if (!row) throw new Error("No se pudo crear la factura");

        await insertRecordHistory(db, {
          entityType: "invoice",
          entityId: id,
          action: "created",
          snapshot: row,
          occurredAt: now,
        });
        createdInvoice = mapInvoiceRow(row);
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new Error("Ya existe una factura con ese numero");
      }
      throw error;
    }

    if (!createdInvoice) throw new Error("No se pudo crear la factura");
    return createdInvoice;
  }

  async update(id: string, input: CreateInvoiceInput): Promise<Invoice> {
    const db = await getDatabase();
    const exists = await this.existsByInvoiceNumber(input.invoiceNumber, id);

    if (exists) {
      throw new Error("Ya existe una factura con ese numero");
    }

    const normalized = normalizeInvoiceInput(input);
    const now = new Date().toISOString();
    let updatedInvoice: Invoice | null = null;

    try {
      await db.withTransactionAsync(async () => {
        const previousRow = await findInvoiceRowById(db, id);
        if (!previousRow) throw new Error("La factura no existe");

        const result = await db.runAsync(
          `UPDATE invoices
           SET invoice_number = ?, invoice_date = ?, client_name = ?,
               description = ?, net_amount = ?, tax_amount = ?,
               total_amount = ?, payment_date = ?, tax_payment = ?,
               tag_amount = ?, accountant_amount = ?, savings_amount = ?,
               updated_at = ?
           WHERE id = ?`,
          [
            normalized.invoiceNumber,
            normalized.invoiceDate,
            normalized.clientName,
            normalized.description,
            normalized.netAmount,
            normalized.taxAmount,
            normalized.totalAmount,
            normalized.paymentDate,
            normalized.taxPayment,
            normalized.tagAmount,
            normalized.accountantAmount,
            normalized.savingsAmount,
            now,
            id,
          ],
        );

        if (result.changes === 0) {
          throw new Error("La factura no existe");
        }

        await syncInvoiceAllocations(
          db,
          {
            id,
            invoiceDate: normalized.invoiceDate,
            paymentDate: normalized.paymentDate,
          },
          {
            taxPayment: normalized.taxPayment,
            tagAmount: normalized.tagAmount,
            accountantAmount: normalized.accountantAmount,
            savingsAmount: normalized.savingsAmount,
          },
          now,
        );

        const nextRow = await findInvoiceRowById(db, id);
        if (!nextRow) throw new Error("No se pudo actualizar la factura");

        await insertRecordHistory(db, {
          entityType: "invoice",
          entityId: id,
          action: "updated",
          snapshot: nextRow,
          previousSnapshot: previousRow,
          occurredAt: now,
        });
        updatedInvoice = mapInvoiceRow(nextRow);
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new Error("Ya existe una factura con ese numero");
      }
      throw error;
    }

    if (!updatedInvoice) throw new Error("No se pudo actualizar la factura");
    return updatedInvoice;
  }

  async findById(id: string): Promise<Invoice | null> {
    const db = await getDatabase();
    const row = await findInvoiceRowById(db, id);
    return row ? mapInvoiceRow(row) : null;
  }

  async findAll(): Promise<Invoice[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<InvoiceRow>(
      `SELECT * FROM invoices
       ORDER BY invoice_date DESC, CAST(invoice_number AS INTEGER) DESC`,
    );
    return rows.map(mapInvoiceRow);
  }

  async search(searchText: string): Promise<Invoice[]> {
    const trimmed = searchText.trim();
    if (!trimmed) return this.findAll();

    const db = await getDatabase();
    const likeText = `%${trimmed}%`;
    const rows = await db.getAllAsync<InvoiceRow>(
      `SELECT * FROM invoices
       WHERE invoice_number LIKE ? COLLATE NOCASE
          OR client_name LIKE ? COLLATE NOCASE
          OR COALESCE(description, '') LIKE ? COLLATE NOCASE
       ORDER BY invoice_date DESC, CAST(invoice_number AS INTEGER) DESC`,
      [likeText, likeText, likeText],
    );
    return rows.map(mapInvoiceRow);
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      const previousRow = await findInvoiceRowById(db, id);
      if (!previousRow) throw new Error("La factura no existe");

      const result = await db.runAsync("DELETE FROM invoices WHERE id = ?", [
        id,
      ]);
      if (result.changes === 0) {
        throw new Error("La factura no existe");
      }

      await insertRecordHistory(db, {
        entityType: "invoice",
        entityId: id,
        action: "deleted",
        snapshot: previousRow,
      });
    });
  }

  async existsByInvoiceNumber(
    invoiceNumber: string,
    excludedId?: string,
  ): Promise<boolean> {
    const db = await getDatabase();
    const normalized = invoiceNumber.trim();
    const row = excludedId
      ? await db.getFirstAsync<{ invoice_count: number }>(
          `SELECT COUNT(*) AS invoice_count
           FROM invoices WHERE invoice_number = ? AND id <> ?`,
          [normalized, excludedId],
        )
      : await db.getFirstAsync<{ invoice_count: number }>(
          `SELECT COUNT(*) AS invoice_count
           FROM invoices WHERE invoice_number = ?`,
          [normalized],
        );
    return (row?.invoice_count ?? 0) > 0;
  }

  async getSummary(): Promise<InvoiceSummary> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<SummaryRow>(
      `SELECT
        COUNT(*) AS invoice_count,
        COALESCE(SUM(net_amount), 0) AS total_net_amount,
        COALESCE(SUM(tax_amount), 0) AS total_tax_amount,
        COALESCE(SUM(total_amount), 0) AS total_invoice_amount
      FROM invoices
      WHERE payment_date IS NOT NULL`,
    );

    return {
      invoiceCount: row?.invoice_count ?? 0,
      totalNetAmount: row?.total_net_amount ?? 0,
      totalTaxAmount: row?.total_tax_amount ?? 0,
      totalInvoiceAmount: row?.total_invoice_amount ?? 0,
    };
  }

  async getMonthlySummary(): Promise<MonthlyInvoiceSummary[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<MonthlySummaryRow>(
      `SELECT
        SUBSTR(invoice_date, 1, 7) AS period,
        COUNT(*) AS invoice_count,
        COALESCE(SUM(net_amount), 0) AS net_amount,
        COALESCE(SUM(tax_amount), 0) AS tax_amount,
        COALESCE(SUM(total_amount), 0) AS total_amount
      FROM invoices
      WHERE payment_date IS NOT NULL
      GROUP BY SUBSTR(invoice_date, 1, 7)
      ORDER BY period DESC`,
    );

    return rows.map((row) => ({
      period: row.period,
      invoiceCount: row.invoice_count,
      netAmount: row.net_amount,
      taxAmount: row.tax_amount,
      totalAmount: row.total_amount,
    }));
  }
}
