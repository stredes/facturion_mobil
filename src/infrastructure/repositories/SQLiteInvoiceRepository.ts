import { getDatabase } from "../../database/database";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceSummary,
  MonthlyInvoiceSummary,
} from "../../domain/Invoice";
import type { InvoiceRepository } from "../../domain/InvoiceRepository";
import {
  calculateAllocatedAmount,
  calculateInvoiceTotal,
  calculateTax,
} from "../../services/invoiceCalculations";
import { isValidISODate } from "../../utils/dates";
import { createId } from "../../utils/ids";

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
  total_tax_payment: number;
  total_tag_amount: number;
  total_accountant_amount: number;
  total_savings_amount: number;
  total_remaining_amount: number;
}

interface MonthlySummaryRow {
  period: string;
  invoice_count: number;
  net_amount: number;
  tax_amount: number;
  total_amount: number;
  tax_payment: number;
  tag_amount: number;
  accountant_amount: number;
  savings_amount: number;
  remaining_amount: number;
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
    taxPayment: row.tax_payment,
    tagAmount: row.tag_amount,
    accountantAmount: row.accountant_amount,
    savingsAmount: row.savings_amount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes("unique")
  );
}

function validateMoney(value: number, fieldName: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(
      `${fieldName} debe ser un número entero igual o mayor que cero.`,
    );
  }
}

function normalizeInvoiceInput(input: CreateInvoiceInput): NormalizedInvoiceInput {
  const invoiceNumber = input.invoiceNumber.trim();
  const invoiceDate = input.invoiceDate.trim();
  const clientName = input.clientName.trim();
  const description = input.description?.trim() || null;
  const paymentDate = input.paymentDate?.trim() || null;
  const netAmount = Number(input.netAmount);
  const taxPayment = Number(input.taxPayment ?? 0);
  const tagAmount = Number(input.tagAmount ?? 0);
  const accountantAmount = Number(input.accountantAmount ?? 0);
  const savingsAmount = Number(input.savingsAmount ?? 0);

  if (!invoiceNumber) {
    throw new Error("El número de factura es obligatorio.");
  }

  if (!invoiceDate || !isValidISODate(invoiceDate)) {
    throw new Error("La fecha debe ser válida y usar formato AAAA-MM-DD.");
  }

  if (!clientName) {
    throw new Error("El cliente es obligatorio.");
  }

  if (paymentDate && !isValidISODate(paymentDate)) {
    throw new Error("La fecha de pago debe usar formato AAAA-MM-DD.");
  }

  validateMoney(netAmount, "Neto");

  if (netAmount <= 0) {
    throw new Error("El neto debe ser mayor que cero.");
  }

  validateMoney(taxPayment, "Pago IVA");
  validateMoney(tagAmount, "TAG");
  validateMoney(accountantAmount, "Contador");
  validateMoney(savingsAmount, "Ahorro");

  const taxAmount = calculateTax(netAmount);
  const totalAmount = calculateInvoiceTotal(netAmount, taxAmount);
  const allocatedAmount = calculateAllocatedAmount({
    taxPayment,
    tagAmount,
    accountantAmount,
    savingsAmount,
  });

  if (allocatedAmount > totalAmount) {
    throw new Error("Las separaciones no pueden superar el total de la factura");
  }

  return {
    invoiceNumber,
    invoiceDate,
    clientName,
    description,
    netAmount,
    taxAmount,
    totalAmount,
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
      throw new Error("Ya existe una factura con ese número");
    }

    const normalizedInput = normalizeInvoiceInput(input);
    const id = createId();
    const now = new Date().toISOString();

    try {
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
          id,
          normalizedInput.invoiceNumber,
          normalizedInput.invoiceDate,
          normalizedInput.clientName,
          normalizedInput.description,
          normalizedInput.netAmount,
          normalizedInput.taxAmount,
          normalizedInput.totalAmount,
          normalizedInput.paymentDate,
          normalizedInput.taxPayment,
          normalizedInput.tagAmount,
          normalizedInput.accountantAmount,
          normalizedInput.savingsAmount,
          now,
          now,
        ],
      );
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new Error("Ya existe una factura con ese número");
      }

      throw error;
    }

    const invoice = await this.findById(id);

    if (!invoice) {
      throw new Error("No se pudo crear la factura");
    }

    return invoice;
  }

  async update(id: string, input: CreateInvoiceInput): Promise<Invoice> {
    const db = await getDatabase();
    const exists = await this.existsByInvoiceNumber(input.invoiceNumber, id);

    if (exists) {
      throw new Error("Ya existe una factura con ese número");
    }

    const normalizedInput = normalizeInvoiceInput(input);
    const now = new Date().toISOString();

    try {
      const result = await db.runAsync(
        `UPDATE invoices
        SET
          invoice_number = ?,
          invoice_date = ?,
          client_name = ?,
          description = ?,
          net_amount = ?,
          tax_amount = ?,
          total_amount = ?,
          payment_date = ?,
          tax_payment = ?,
          tag_amount = ?,
          accountant_amount = ?,
          savings_amount = ?,
          updated_at = ?
        WHERE id = ?`,
        [
          normalizedInput.invoiceNumber,
          normalizedInput.invoiceDate,
          normalizedInput.clientName,
          normalizedInput.description,
          normalizedInput.netAmount,
          normalizedInput.taxAmount,
          normalizedInput.totalAmount,
          normalizedInput.paymentDate,
          normalizedInput.taxPayment,
          normalizedInput.tagAmount,
          normalizedInput.accountantAmount,
          normalizedInput.savingsAmount,
          now,
          id,
        ],
      );

      if (result.changes === 0) {
        throw new Error("La factura no existe");
      }
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new Error("Ya existe una factura con ese número");
      }

      throw error;
    }

    const invoice = await this.findById(id);

    if (!invoice) {
      throw new Error("No se pudo actualizar la factura");
    }

    return invoice;
  }

  async findById(id: string): Promise<Invoice | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<InvoiceRow>(
      "SELECT * FROM invoices WHERE id = ? LIMIT 1",
      [id],
    );

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
    const trimmedSearchText = searchText.trim();

    if (!trimmedSearchText) {
      return this.findAll();
    }

    const db = await getDatabase();
    const likeText = `%${trimmedSearchText}%`;
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
    const result = await db.runAsync("DELETE FROM invoices WHERE id = ?", [id]);

    if (result.changes === 0) {
      throw new Error("La factura no existe");
    }
  }

  async existsByInvoiceNumber(
    invoiceNumber: string,
    excludedId?: string,
  ): Promise<boolean> {
    const db = await getDatabase();
    const normalizedInvoiceNumber = invoiceNumber.trim();
    const row = excludedId
      ? await db.getFirstAsync<{ invoice_count: number }>(
          `SELECT COUNT(*) AS invoice_count
          FROM invoices
          WHERE invoice_number = ? AND id <> ?`,
          [normalizedInvoiceNumber, excludedId],
        )
      : await db.getFirstAsync<{ invoice_count: number }>(
          `SELECT COUNT(*) AS invoice_count
          FROM invoices
          WHERE invoice_number = ?`,
          [normalizedInvoiceNumber],
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
        COALESCE(SUM(total_amount), 0) AS total_invoice_amount,

        COALESCE(SUM(tax_payment), 0) AS total_tax_payment,
        COALESCE(SUM(tag_amount), 0) AS total_tag_amount,
        COALESCE(SUM(accountant_amount), 0) AS total_accountant_amount,
        COALESCE(SUM(savings_amount), 0) AS total_savings_amount,

        COALESCE(
          SUM(
            total_amount
            - tax_payment
            - tag_amount
            - accountant_amount
            - savings_amount
          ),
          0
        ) AS total_remaining_amount
      FROM invoices`,
    );

    return {
      invoiceCount: row?.invoice_count ?? 0,
      totalNetAmount: row?.total_net_amount ?? 0,
      totalTaxAmount: row?.total_tax_amount ?? 0,
      totalInvoiceAmount: row?.total_invoice_amount ?? 0,
      totalTaxPayment: row?.total_tax_payment ?? 0,
      totalTagAmount: row?.total_tag_amount ?? 0,
      totalAccountantAmount: row?.total_accountant_amount ?? 0,
      totalSavingsAmount: row?.total_savings_amount ?? 0,
      totalRemainingAmount: row?.total_remaining_amount ?? 0,
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
        COALESCE(SUM(total_amount), 0) AS total_amount,

        COALESCE(SUM(tax_payment), 0) AS tax_payment,
        COALESCE(SUM(tag_amount), 0) AS tag_amount,
        COALESCE(SUM(accountant_amount), 0) AS accountant_amount,
        COALESCE(SUM(savings_amount), 0) AS savings_amount,

        COALESCE(
          SUM(
            total_amount
            - tax_payment
            - tag_amount
            - accountant_amount
            - savings_amount
          ),
          0
        ) AS remaining_amount
      FROM invoices
      GROUP BY SUBSTR(invoice_date, 1, 7)
      ORDER BY period DESC`,
    );

    return rows.map((row) => ({
      period: row.period,
      invoiceCount: row.invoice_count,
      netAmount: row.net_amount,
      taxAmount: row.tax_amount,
      totalAmount: row.total_amount,
      taxPayment: row.tax_payment,
      tagAmount: row.tag_amount,
      accountantAmount: row.accountant_amount,
      savingsAmount: row.savings_amount,
      remainingAmount: row.remaining_amount,
    }));
  }
}
