import type * as SQLite from "expo-sqlite";

import { seedInitialInvoices } from "./seedInvoices";

const DATABASE_VERSION = 3;

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

    await seedInitialInvoices(db);
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

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
