import type * as SQLite from "expo-sqlite";

import {
  backfillInitialRecordHistory,
  ensureRecordHistoryTable,
} from "./recordHistory";
import {
  replaceImportedSeedInvoices,
  seedInitialInvoices,
} from "./seedInvoices";

const DATABASE_VERSION = 8;

export async function runMigrations(
  db: SQLite.SQLiteDatabase,
): Promise<void> {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
  `);

  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const currentVersion = result?.user_version ?? 0;

  // Safety net: garantiza que la tabla retentions exista aunque el marcador
  // de version este adelantado (evita "no such table: retentions").
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS retentions (
      id TEXT PRIMARY KEY NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('tax', 'tag', 'accountant', 'savings')),
      retention_date TEXT NOT NULL,
      amount INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      reference TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_retentions_category
    ON retentions(category);

    CREATE INDEX IF NOT EXISTS idx_retentions_date
    ON retentions(retention_date);
  `);

  // Safety net: el historial debe existir incluso si una version previa dejo el
  // marcador de esquema adelantado.
  await ensureRecordHistoryTable(db);

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY NOT NULL,

        invoice_number TEXT NOT NULL,
        invoice_date TEXT NOT NULL,
        client_name TEXT NOT NULL,
        description TEXT,

        net_amount INTEGER NOT NULL DEFAULT 0,
        tax_amount INTEGER NOT NULL DEFAULT 0,
        total_amount INTEGER NOT NULL DEFAULT 0,

        payment_date TEXT,
        tax_payment INTEGER NOT NULL DEFAULT 0,

        tag_amount INTEGER NOT NULL DEFAULT 0,
        accountant_amount INTEGER NOT NULL DEFAULT 0,
        savings_amount INTEGER NOT NULL DEFAULT 0,

        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_invoice_number
      ON invoices(invoice_number);
    `);

  }

  if (currentVersion < 2) {
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_invoices_date
      ON invoices(invoice_date);

      CREATE INDEX IF NOT EXISTS idx_invoices_client
      ON invoices(client_name);
    `);
  }

  if (currentVersion < 3) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS general_payments (
        id TEXT PRIMARY KEY NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('tag', 'accountant', 'savings')),
        payment_date TEXT NOT NULL,
        amount INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        reference TEXT,
        source_invoice_id TEXT,
        source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'migrated')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (source_invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_general_payments_category
      ON general_payments(category);

      CREATE INDEX IF NOT EXISTS idx_general_payments_date
      ON general_payments(payment_date);

      CREATE INDEX IF NOT EXISTS idx_general_payments_invoice
      ON general_payments(source_invoice_id);

      CREATE TABLE IF NOT EXISTS tax_payments (
        id TEXT PRIMARY KEY NOT NULL,
        tax_period TEXT NOT NULL,
        payment_date TEXT NOT NULL,
        amount INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        reference TEXT,
        source_invoice_id TEXT,
        source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'migrated')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (source_invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_tax_payments_period
      ON tax_payments(tax_period);

      CREATE INDEX IF NOT EXISTS idx_tax_payments_date
      ON tax_payments(payment_date);

      CREATE INDEX IF NOT EXISTS idx_tax_payments_invoice
      ON tax_payments(source_invoice_id);
    `);

    const rows = await db.getAllAsync<{
      id: string;
      invoice_date: string;
      payment_date: string | null;
      tax_payment: number;
      tag_amount: number;
      accountant_amount: number;
      savings_amount: number;
    }>(
      `SELECT id, invoice_date, payment_date,
              tax_payment, tag_amount,
              accountant_amount, savings_amount
       FROM invoices
       WHERE payment_date IS NOT NULL
          OR tax_payment > 0
          OR tag_amount > 0
          OR accountant_amount > 0
          OR savings_amount > 0`,
    );

    if (rows.length > 0) {
      await db.withTransactionAsync(async () => {
        const now = new Date().toISOString();

        for (const row of rows) {
          const taxPeriod = row.invoice_date.slice(0, 7);
          const payDate = row.payment_date ?? row.invoice_date;

          if (row.tax_payment > 0) {
            await db.runAsync(
              `INSERT INTO tax_payments (
                id, tax_period, payment_date, amount, description,
                reference, source_invoice_id, source_type, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 'migrated', ?, ?)`,
              [
                `migrated-tax-${row.id}`,
                taxPeriod,
                payDate,
                row.tax_payment,
                "Migrado desde factura",
                null,
                row.id,
                now,
                now,
              ],
            );
          }

          if (row.tag_amount > 0) {
            await db.runAsync(
              `INSERT INTO general_payments (
                id, category, payment_date, amount, description,
                reference, source_invoice_id, source_type, created_at, updated_at
              ) VALUES (?, 'tag', ?, ?, ?, ?, ?, 'migrated', ?, ?)`,
              [
                `migrated-tag-${row.id}`,
                payDate,
                row.tag_amount,
                "Migrado desde factura",
                null,
                row.id,
                now,
                now,
              ],
            );
          }

          if (row.accountant_amount > 0) {
            await db.runAsync(
              `INSERT INTO general_payments (
                id, category, payment_date, amount, description,
                reference, source_invoice_id, source_type, created_at, updated_at
              ) VALUES (?, 'accountant', ?, ?, ?, ?, ?, 'migrated', ?, ?)`,
              [
                `migrated-acc-${row.id}`,
                payDate,
                row.accountant_amount,
                "Migrado desde factura",
                null,
                row.id,
                now,
                now,
              ],
            );
          }

          if (row.savings_amount > 0) {
            await db.runAsync(
              `INSERT INTO general_payments (
                id, category, payment_date, amount, description,
                reference, source_invoice_id, source_type, created_at, updated_at
              ) VALUES (?, 'savings', ?, ?, ?, ?, ?, 'migrated', ?, ?)`,
              [
                `migrated-sav-${row.id}`,
                payDate,
                row.savings_amount,
                "Migrado desde factura",
                null,
                row.id,
                now,
                now,
              ],
            );
          }
        }
      });
    }
  }

  if (currentVersion === 0) {
    await seedInitialInvoices(db);
  }

  if (currentVersion < 5) {
    await backfillInitialRecordHistory(db);
  }

  if (currentVersion < 6) {
    const now = new Date().toISOString();
    const taxPaymentsTable = await db.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tax_payments'",
    );
    const seedTaxPayments = [
      ["excel-invoice-3", "2026-04", "2026-04-20", 150886, "3"],
      ["excel-invoice-8", "2026-05", "2026-05-22", 292104, "8"],
      ["excel-invoice-12", "2026-06", "2026-06-23", 179460, "12"],
      ["excel-invoice-13", "2026-07", "2026-07-17", 537410, "13"],
    ] as const;

    await db.withTransactionAsync(async () => {
      for (const [invoiceId, period, paymentDate, amount, reference] of seedTaxPayments) {
        if (!taxPaymentsTable) break;
        await db.runAsync(
          `DELETE FROM tax_payments
           WHERE source_invoice_id = ? AND source_type = 'migrated'`,
          [invoiceId],
        );
        await db.runAsync(
          `INSERT INTO tax_payments (
            id, tax_period, payment_date, amount, description,
            reference, source_invoice_id, source_type, created_at, updated_at
          )
          SELECT ?, ?, ?, ?, ?, ?, id, 'migrated', ?, ?
          FROM invoices WHERE id = ?`,
          [
            `seed-tax-${invoiceId}`,
            period,
            paymentDate,
            amount,
            "Pago IVA importado desde Don Pollo.xlsx",
            reference,
            now,
            now,
            invoiceId,
          ],
        );
      }

      await db.runAsync(
        `UPDATE invoices
         SET payment_date = invoice_date, tax_payment = 0, tag_amount = 0,
             accountant_amount = 0, savings_amount = 0, updated_at = ?
         WHERE id LIKE 'excel-invoice-%'`,
        [now],
      );
    });
  }

  if (currentVersion < 7) {
    const generalPaymentsTable = await db.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'general_payments'",
    );
    if (generalPaymentsTable) {
      await db.runAsync(
        `DELETE FROM general_payments
         WHERE source_type = 'migrated'
           AND source_invoice_id LIKE 'excel-invoice-%'`,
      );
    }
  }

  if (currentVersion < 8 && currentVersion > 0) {
    const taxPaymentsTable = await db.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tax_payments'",
    );
    if (taxPaymentsTable) {
      await replaceImportedSeedInvoices(db);
    }
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
