import { getDatabase } from "../../database/database";
import type {
  CreateRetentionInput,
  Retention,
  RetentionCategory,
  RetentionFilters,
  RetentionSummary,
  UpdateRetentionInput,
} from "../../domain/Retention";
import type { RetentionRepository } from "../../domain/RetentionRepository";
import { validateMoney } from "../../domain/money";
import { isValidISODate } from "../../utils/dates";
import { createId } from "../../utils/ids";

interface RetentionRow {
  id: string;
  category: string;
  retention_date: string;
  amount: number;
  description: string | null;
  reference: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: RetentionRow): Retention {
  return {
    id: row.id,
    category: row.category as RetentionCategory,
    retentionDate: row.retention_date,
    amount: row.amount,
    description: row.description,
    reference: row.reference,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateRetention(input: {
  category: RetentionCategory;
  retentionDate: string;
  amount: number;
}): void {
  if (
    input.category !== "tax" &&
    input.category !== "tag" &&
    input.category !== "accountant" &&
    input.category !== "savings"
  ) {
    throw new Error(
      "La categoria debe ser tax, tag, accountant o savings",
    );
  }

  if (!input.retentionDate || !isValidISODate(input.retentionDate)) {
    throw new Error("La fecha debe ser valida y usar formato AAAA-MM-DD.");
  }

  validateMoney(input.amount, "Monto");
}

export class SQLiteRetentionRepository implements RetentionRepository {
  async create(input: CreateRetentionInput): Promise<Retention> {
    const db = await getDatabase();
    validateRetention(input);

    const id = createId("ret");
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO retentions (
        id, category, retention_date, amount, description, reference,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.category,
        input.retentionDate,
        input.amount,
        input.description?.trim() || null,
        input.reference?.trim() || null,
        now,
        now,
      ],
    );

    const retention = await this.findById(id);
    if (!retention) throw new Error("No se pudo crear la retencion");
    return retention;
  }

  async update(
    id: string,
    input: UpdateRetentionInput,
  ): Promise<Retention> {
    const db = await getDatabase();
    validateRetention(input);

    const now = new Date().toISOString();
    const result = await db.runAsync(
      `UPDATE retentions
       SET category = ?, retention_date = ?, amount = ?,
           description = ?, reference = ?, updated_at = ?
       WHERE id = ?`,
      [
        input.category,
        input.retentionDate,
        input.amount,
        input.description?.trim() || null,
        input.reference?.trim() || null,
        now,
        id,
      ],
    );

    if (result.changes === 0) {
      throw new Error("La retencion no existe");
    }

    const retention = await this.findById(id);
    if (!retention) throw new Error("No se pudo actualizar la retencion");
    return retention;
  }

  async findById(id: string): Promise<Retention | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<RetentionRow>(
      "SELECT * FROM retentions WHERE id = ? LIMIT 1",
      [id],
    );
    return row ? mapRow(row) : null;
  }

  async findAll(filters?: RetentionFilters): Promise<Retention[]> {
    const db = await getDatabase();
    const conditions: string[] = [];
    const params: string[] = [];

    if (filters?.category) {
      conditions.push("category = ?");
      params.push(filters.category);
    }

    if (filters?.month) {
      conditions.push(
        "SUBSTR(retention_date, 6, 2) = ?",
      );
      params.push(filters.month.padStart(2, "0"));
    }

    if (filters?.year) {
      conditions.push("SUBSTR(retention_date, 1, 4) = ?");
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

    const rows = await db.getAllAsync<RetentionRow>(
      `SELECT * FROM retentions ${where}
       ORDER BY retention_date DESC, created_at DESC`,
      params,
    );
    return rows.map(mapRow);
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    const result = await db.runAsync(
      "DELETE FROM retentions WHERE id = ?",
      [id],
    );
    if (result.changes === 0) {
      throw new Error("La retencion no existe");
    }
  }

  async getSummary(): Promise<RetentionSummary> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{
      total_tax: number;
      total_tag: number;
      total_accountant: number;
      total_savings: number;
    }>(
      `SELECT
        COALESCE(SUM(CASE WHEN category = 'tax' THEN amount ELSE 0 END), 0) AS total_tax,
        COALESCE(SUM(CASE WHEN category = 'tag' THEN amount ELSE 0 END), 0) AS total_tag,
        COALESCE(SUM(CASE WHEN category = 'accountant' THEN amount ELSE 0 END), 0) AS total_accountant,
        COALESCE(SUM(CASE WHEN category = 'savings' THEN amount ELSE 0 END), 0) AS total_savings
      FROM retentions`,
    );

    return {
      totalTax: row?.total_tax ?? 0,
      totalTag: row?.total_tag ?? 0,
      totalAccountant: row?.total_accountant ?? 0,
      totalSavings: row?.total_savings ?? 0,
      totalRetentions:
        (row?.total_tax ?? 0) +
        (row?.total_tag ?? 0) +
        (row?.total_accountant ?? 0) +
        (row?.total_savings ?? 0),
    };
  }

  async getMonthlySummary(): Promise<
    {
      period: string;
      taxAmount: number;
      tagAmount: number;
      accountantAmount: number;
      savingsAmount: number;
      totalRetentions: number;
    }[]
  > {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      period: string;
      tax_amount: number;
      tag_amount: number;
      accountant_amount: number;
      savings_amount: number;
    }>(
      `SELECT
        SUBSTR(retention_date, 1, 7) AS period,
        COALESCE(SUM(CASE WHEN category = 'tax' THEN amount ELSE 0 END), 0) AS tax_amount,
        COALESCE(SUM(CASE WHEN category = 'tag' THEN amount ELSE 0 END), 0) AS tag_amount,
        COALESCE(SUM(CASE WHEN category = 'accountant' THEN amount ELSE 0 END), 0) AS accountant_amount,
        COALESCE(SUM(CASE WHEN category = 'savings' THEN amount ELSE 0 END), 0) AS savings_amount
      FROM retentions
      GROUP BY SUBSTR(retention_date, 1, 7)
      ORDER BY period DESC`,
    );

    return rows.map((row) => ({
      period: row.period,
      taxAmount: row.tax_amount,
      tagAmount: row.tag_amount,
      accountantAmount: row.accountant_amount,
      savingsAmount: row.savings_amount,
      totalRetentions:
        row.tax_amount +
        row.tag_amount +
        row.accountant_amount +
        row.savings_amount,
    }));
  }
}
