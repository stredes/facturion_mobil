import type * as SQLite from "expo-sqlite";

import { seedInitialInvoices } from "./seedInvoices";

const DATABASE_VERSION = 2;

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

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
