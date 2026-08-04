import { getDatabase } from "../../database/database";
import { insertRecordHistory } from "../../database/recordHistory";
import type {
  CreateTaxPaymentInput,
  TaxPayment,
  TaxPaymentFilters,
  UpdateTaxPaymentInput,
} from "../../domain/TaxPayment";
import type { TaxPaymentRepository } from "../../domain/TaxPaymentRepository";
import { validateMoney } from "../../domain/money";
import { isValidISODate } from "../../utils/dates";
import { createId } from "../../utils/ids";

const TAX_PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

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

async function findTaxPaymentRowById(
  db: Awaited<ReturnType<typeof getDatabase>>,
  id: string,
): Promise<TaxPaymentRow | null> {
  return db.getFirstAsync<TaxPaymentRow>(
    "SELECT * FROM tax_payments WHERE id = ? LIMIT 1",
    [id],
  );
}

function validatePayment(input: {
  taxPeriod: string;
  paymentDate: string;
  amount: number;
}): void {
  if (!TAX_PERIOD_PATTERN.test(input.taxPeriod)) {
    throw new Error("El periodo debe usar formato AAAA-MM.");
  }

  if (!input.paymentDate || !isValidISODate(input.paymentDate)) {
    throw new Error("La fecha debe ser valida y usar formato AAAA-MM-DD.");
  }

  validateMoney(input.amount, "Monto");
}

export class SQLiteTaxPaymentRepository implements TaxPaymentRepository {
  async create(input: CreateTaxPaymentInput): Promise<TaxPayment> {
    const db = await getDatabase();
    validatePayment(input);

    const id = createId("tp");
    const now = new Date().toISOString();
    let createdPayment: TaxPayment | null = null;

    await db.withTransactionAsync(async () => {
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

      const row = await findTaxPaymentRowById(db, id);
      if (!row) throw new Error("No se pudo crear el pago");

      await insertRecordHistory(db, {
        entityType: "tax_payment",
        entityId: id,
        action: "created",
        snapshot: row,
        occurredAt: now,
      });
      createdPayment = mapRow(row);
    });

    if (!createdPayment) throw new Error("No se pudo crear el pago");
    return createdPayment;
  }

  async update(
    id: string,
    input: UpdateTaxPaymentInput,
  ): Promise<TaxPayment> {
    const db = await getDatabase();
    validatePayment(input);

    const now = new Date().toISOString();
    let updatedPayment: TaxPayment | null = null;

    await db.withTransactionAsync(async () => {
      const previousRow = await findTaxPaymentRowById(db, id);
      if (!previousRow) throw new Error("El pago no existe");

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

      const nextRow = await findTaxPaymentRowById(db, id);
      if (!nextRow) throw new Error("No se pudo actualizar el pago");

      await insertRecordHistory(db, {
        entityType: "tax_payment",
        entityId: id,
        action: "updated",
        snapshot: nextRow,
        previousSnapshot: previousRow,
        occurredAt: now,
      });
      updatedPayment = mapRow(nextRow);
    });

    if (!updatedPayment) throw new Error("No se pudo actualizar el pago");
    return updatedPayment;
  }

  async findById(id: string): Promise<TaxPayment | null> {
    const db = await getDatabase();
    const row = await findTaxPaymentRowById(db, id);
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
    await db.withTransactionAsync(async () => {
      const previousRow = await findTaxPaymentRowById(db, id);
      if (!previousRow) throw new Error("El pago no existe");

      const result = await db.runAsync(
        "DELETE FROM tax_payments WHERE id = ?",
        [id],
      );
      if (result.changes === 0) {
        throw new Error("El pago no existe");
      }

      await insertRecordHistory(db, {
        entityType: "tax_payment",
        entityId: id,
        action: "deleted",
        snapshot: previousRow,
      });
    });
  }

  async getTotalPaidTax(): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ total: number }>(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM tax_payments",
    );
    return row?.total ?? 0;
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
}
