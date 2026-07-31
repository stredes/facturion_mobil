import { getDatabase } from "../../database/database";
import type {
  CreateTaxPaymentInput,
  TaxPayment,
  TaxPaymentFilters,
  TaxPeriodSummary,
  UpdateTaxPaymentInput,
} from "../../domain/TaxPayment";
import type { TaxPaymentRepository } from "../../domain/TaxPaymentRepository";
import { createId } from "../../utils/ids";

interface TaxPaymentRow {
  id: string;
  tax_period: string;
  payment_date: string;
  amount: number;
  description: string | null;
  reference: string | null;
  source_invoice_id: string | null;
  source_type: string;
  created_at: string;
  updated_at: string;
}

function mapRow(row: TaxPaymentRow): TaxPayment {
  return {
    id: row.id,
    taxPeriod: row.tax_period,
    paymentDate: row.payment_date,
    amount: row.amount,
    description: row.description,
    reference: row.reference,
    sourceInvoiceId: row.source_invoice_id,
    sourceType: row.source_type as "manual" | "migrated",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateAmount(amount: number): void {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new Error("El monto debe ser un numero entero mayor o igual a cero");
  }
}

export class SQLiteTaxPaymentRepository implements TaxPaymentRepository {
  async create(input: CreateTaxPaymentInput): Promise<TaxPayment> {
    const db = await getDatabase();
    validateAmount(input.amount);

    const id = createId("tp");
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO tax_payments (
        id, tax_period, payment_date, amount, description, reference,
        source_invoice_id, source_type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'manual', ?, ?)`,
      [
        id,
        input.taxPeriod,
        input.paymentDate,
        input.amount,
        input.description?.trim() || null,
        input.reference?.trim() || null,
        null,
        now,
        now,
      ],
    );

    const payment = await this.findById(id);
    if (!payment) throw new Error("No se pudo crear el pago");
    return payment;
  }

  async update(
    id: string,
    input: UpdateTaxPaymentInput,
  ): Promise<TaxPayment> {
    const db = await getDatabase();
    validateAmount(input.amount);

    const now = new Date().toISOString();
    const result = await db.runAsync(
      `UPDATE tax_payments
       SET tax_period = ?, payment_date = ?, amount = ?,
           description = ?, reference = ?, updated_at = ?
       WHERE id = ?`,
      [
        input.taxPeriod,
        input.paymentDate,
        input.amount,
        input.description?.trim() || null,
        input.reference?.trim() || null,
        now,
        id,
      ],
    );

    if (result.changes === 0) {
      throw new Error("El pago no existe");
    }

    const payment = await this.findById(id);
    if (!payment) throw new Error("No se pudo actualizar el pago");
    return payment;
  }

  async findById(id: string): Promise<TaxPayment | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<TaxPaymentRow>(
      "SELECT * FROM tax_payments WHERE id = ? LIMIT 1",
      [id],
    );
    return row ? mapRow(row) : null;
  }

  async findAll(filters?: TaxPaymentFilters): Promise<TaxPayment[]> {
    const db = await getDatabase();
    const conditions: string[] = [];
    const params: string[] = [];

    if (filters?.taxPeriod) {
      conditions.push("tax_period = ?");
      params.push(filters.taxPeriod);
    }

    if (filters?.year) {
      conditions.push("SUBSTR(tax_period, 1, 4) = ?");
      params.push(filters.year);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await db.getAllAsync<TaxPaymentRow>(
      `SELECT * FROM tax_payments ${where}
       ORDER BY payment_date DESC, created_at DESC`,
      params,
    );
    return rows.map(mapRow);
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    const result = await db.runAsync(
      "DELETE FROM tax_payments WHERE id = ?",
      [id],
    );
    if (result.changes === 0) {
      throw new Error("El pago no existe");
    }
  }

  async getTotalPaidTax(): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ total: number }>(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM tax_payments",
    );
    return row?.total ?? 0;
  }

  async getPeriodSummary(period: string): Promise<TaxPeriodSummary> {
    const db = await getDatabase();

    const generatedResult = await db.getFirstAsync<{
      generated_tax: number;
    }>(
      `SELECT COALESCE(SUM(tax_amount), 0) AS generated_tax
       FROM invoices
       WHERE SUBSTR(invoice_date, 1, 7) = ?`,
      [period],
    );

    const paidResult = await db.getFirstAsync<{ paid_tax: number }>(
      `SELECT COALESCE(SUM(amount), 0) AS paid_tax
       FROM tax_payments
       WHERE tax_period = ?`,
      [period],
    );

    const generatedTax = generatedResult?.generated_tax ?? 0;
    const paidTax = paidResult?.paid_tax ?? 0;

    return {
      period,
      generatedTax,
      paidTax,
      difference: generatedTax - paidTax,
    };
  }

  async getMonthlySummary(): Promise<
    { period: string; paidTax: number }[]
  > {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      period: string;
      paid_tax: number;
    }>(
      `SELECT
        tax_period AS period,
        COALESCE(SUM(amount), 0) AS paid_tax
      FROM tax_payments
      GROUP BY tax_period
      ORDER BY period DESC`,
    );

    return rows.map((row) => ({
      period: row.period,
      paidTax: row.paid_tax,
    }));
  }

  async findRecent(limit: number): Promise<TaxPayment[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TaxPaymentRow>(
      `SELECT * FROM tax_payments
       ORDER BY payment_date DESC, created_at DESC
       LIMIT ?`,
      [limit],
    );
    return rows.map(mapRow);
  }
}
