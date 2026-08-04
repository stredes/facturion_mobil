import { getDatabase } from "../../database/database";
import { insertRecordHistory } from "../../database/recordHistory";
import type {
  CreateGeneralPaymentInput,
  GeneralPayment,
  GeneralPaymentCategory,
  GeneralPaymentFilters,
  GeneralPaymentSummary,
  UpdateGeneralPaymentInput,
} from "../../domain/GeneralPayment";
import type { GeneralPaymentRepository } from "../../domain/GeneralPaymentRepository";
import { validateMoney } from "../../domain/money";
import { isValidISODate } from "../../utils/dates";
import { createId } from "../../utils/ids";

interface GeneralPaymentRow {
  id: string;
  category: string;
  payment_date: string;
  amount: number;
  description: string | null;
  reference: string | null;
  source_invoice_id: string | null;
  source_type: string;
  created_at: string;
  updated_at: string;
}

function mapRow(row: GeneralPaymentRow): GeneralPayment {
  return {
    id: row.id,
    category: row.category as GeneralPaymentCategory,
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

async function findGeneralPaymentRowById(
  db: Awaited<ReturnType<typeof getDatabase>>,
  id: string,
): Promise<GeneralPaymentRow | null> {
  return db.getFirstAsync<GeneralPaymentRow>(
    "SELECT * FROM general_payments WHERE id = ? LIMIT 1",
    [id],
  );
}

function validatePayment(input: {
  category: GeneralPaymentCategory;
  paymentDate: string;
  amount: number;
}): void {
  if (
    input.category !== "tag" &&
    input.category !== "accountant" &&
    input.category !== "savings"
  ) {
    throw new Error("La categoria debe ser tag, accountant o savings");
  }

  if (!input.paymentDate || !isValidISODate(input.paymentDate)) {
    throw new Error("La fecha debe ser valida y usar formato AAAA-MM-DD.");
  }

  validateMoney(input.amount, "Monto");
}

export class SQLiteGeneralPaymentRepository
  implements GeneralPaymentRepository {
  async create(input: CreateGeneralPaymentInput): Promise<GeneralPayment> {
    const db = await getDatabase();
    validatePayment(input);

    const id = createId("gp");
    const now = new Date().toISOString();
    let createdPayment: GeneralPayment | null = null;

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO general_payments (
          id, category, payment_date, amount, description, reference,
          source_invoice_id, source_type, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'manual', ?, ?)`,
        [
          id,
          input.category,
          input.paymentDate,
          input.amount,
          input.description?.trim() || null,
          input.reference?.trim() || null,
          null,
          now,
          now,
        ],
      );

      const row = await findGeneralPaymentRowById(db, id);
      if (!row) throw new Error("No se pudo crear el pago");

      await insertRecordHistory(db, {
        entityType: "general_payment",
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
    input: UpdateGeneralPaymentInput,
  ): Promise<GeneralPayment> {
    const db = await getDatabase();
    validatePayment(input);

    const now = new Date().toISOString();
    let updatedPayment: GeneralPayment | null = null;

    await db.withTransactionAsync(async () => {
      const previousRow = await findGeneralPaymentRowById(db, id);
      if (!previousRow) throw new Error("El pago no existe");

      const result = await db.runAsync(
        `UPDATE general_payments
         SET category = ?, payment_date = ?, amount = ?,
             description = ?, reference = ?, updated_at = ?
         WHERE id = ?`,
        [
          input.category,
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

      const nextRow = await findGeneralPaymentRowById(db, id);
      if (!nextRow) throw new Error("No se pudo actualizar el pago");

      await insertRecordHistory(db, {
        entityType: "general_payment",
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

  async findById(id: string): Promise<GeneralPayment | null> {
    const db = await getDatabase();
    const row = await findGeneralPaymentRowById(db, id);
    return row ? mapRow(row) : null;
  }

  async findAll(filters?: GeneralPaymentFilters): Promise<GeneralPayment[]> {
    const db = await getDatabase();
    const conditions: string[] = [];
    const params: string[] = [];

    if (filters?.category) {
      conditions.push("category = ?");
      params.push(filters.category);
    }

    if (filters?.month) {
      conditions.push(
        "SUBSTR(payment_date, 6, 2) = ?",
      );
      params.push(filters.month.padStart(2, "0"));
    }

    if (filters?.year) {
      conditions.push("SUBSTR(payment_date, 1, 4) = ?");
      params.push(filters.year);
    }

    if (filters?.searchText) {
      conditions.push(
        "(COALESCE(description, '') LIKE ? OR COALESCE(reference, '') LIKE ?)",
      );
      const like = `%${filters.searchText}%`;
      params.push(like, like);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await db.getAllAsync<GeneralPaymentRow>(
      `SELECT * FROM general_payments ${where}
       ORDER BY payment_date DESC, created_at DESC`,
      params,
    );
    return rows.map(mapRow);
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      const previousRow = await findGeneralPaymentRowById(db, id);
      if (!previousRow) throw new Error("El pago no existe");

      const result = await db.runAsync(
        "DELETE FROM general_payments WHERE id = ?",
        [id],
      );
      if (result.changes === 0) {
        throw new Error("El pago no existe");
      }

      await insertRecordHistory(db, {
        entityType: "general_payment",
        entityId: id,
        action: "deleted",
        snapshot: previousRow,
      });
    });
  }

  async getSummary(): Promise<GeneralPaymentSummary> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{
      total_tag: number;
      total_accountant: number;
      total_savings: number;
    }>(
      `SELECT
        COALESCE(SUM(CASE WHEN category = 'tag' THEN amount ELSE 0 END), 0) AS total_tag,
        COALESCE(SUM(CASE WHEN category = 'accountant' THEN amount ELSE 0 END), 0) AS total_accountant,
        COALESCE(SUM(CASE WHEN category = 'savings' THEN amount ELSE 0 END), 0) AS total_savings
      FROM general_payments`,
    );

    return {
      totalTag: row?.total_tag ?? 0,
      totalAccountant: row?.total_accountant ?? 0,
      totalSavings: row?.total_savings ?? 0,
      totalGeneralPayments:
        (row?.total_tag ?? 0) +
        (row?.total_accountant ?? 0) +
        (row?.total_savings ?? 0),
    };
  }

  async getMonthlySummary(): Promise<
    { period: string; tagAmount: number; accountantAmount: number; savingsAmount: number; totalGeneralPayments: number }[]
  > {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      period: string;
      tag_amount: number;
      accountant_amount: number;
      savings_amount: number;
    }>(
      `SELECT
        SUBSTR(payment_date, 1, 7) AS period,
        COALESCE(SUM(CASE WHEN category = 'tag' THEN amount ELSE 0 END), 0) AS tag_amount,
        COALESCE(SUM(CASE WHEN category = 'accountant' THEN amount ELSE 0 END), 0) AS accountant_amount,
        COALESCE(SUM(CASE WHEN category = 'savings' THEN amount ELSE 0 END), 0) AS savings_amount
      FROM general_payments
      GROUP BY SUBSTR(payment_date, 1, 7)
      ORDER BY period DESC`,
    );

    return rows.map((row) => ({
      period: row.period,
      tagAmount: row.tag_amount,
      accountantAmount: row.accountant_amount,
      savingsAmount: row.savings_amount,
      totalGeneralPayments:
        row.tag_amount + row.accountant_amount + row.savings_amount,
    }));
  }
}
