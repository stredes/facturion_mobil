import { DatabaseSync } from "node:sqlite";

type SQLInputValue = string | number | bigint | null | Uint8Array;

type AsyncDb = {
  execAsync: (sql: string) => Promise<void>;
  getFirstAsync: <T>(sql: string, params?: unknown[]) => Promise<T | null>;
  getAllAsync: <T>(sql: string, params?: unknown[]) => Promise<T[]>;
  runAsync: (
    sql: string,
    params?: unknown[],
  ) => Promise<{ changes: number }>;
  withTransactionAsync: (task: () => Promise<void>) => Promise<void>;
};

function createDb(): { db: AsyncDb; raw: DatabaseSync } {
  const raw = new DatabaseSync(":memory:");

  const db: AsyncDb = {
    execAsync: async (sql) => {
      raw.exec(sql);
    },
    getFirstAsync: async <T>(sql: string, params: unknown[] = []) => {
      const row = raw
        .prepare(sql)
        .get(...(params as SQLInputValue[])) as object | undefined;
      return (row ?? null) as T | null;
    },
    getAllAsync: async <T>(sql: string, params: unknown[] = []) => {
      return raw.prepare(sql).all(...(params as SQLInputValue[])) as T[];
    },
    runAsync: async (sql: string, params: unknown[] = []) => {
      const result = raw.prepare(sql).run(...(params as SQLInputValue[]));
      return { changes: Number(result.changes) };
    },
    withTransactionAsync: async (task) => {
      raw.exec("BEGIN");
      try {
        await task();
        raw.exec("COMMIT");
      } catch (error) {
        raw.exec("ROLLBACK");
        throw error;
      }
    },
  };

  return { db, raw };
}

function tableExists(db: DatabaseSync, name: string): boolean {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(name) as { name: string } | undefined;
  return Boolean(row);
}

function userVersion(db: DatabaseSync): number {
  const row = db.prepare("PRAGMA user_version").get() as {
    user_version: number;
  };
  return row.user_version;
}

describe("database migrations", () => {
  it("creates the retentions table on a fresh database", async () => {
    const { db, raw } = createDb();

    const { runMigrations } = await import("../migrations");
    await runMigrations(db as never);

    expect(tableExists(raw, "retentions")).toBe(true);
    expect(tableExists(raw, "record_history")).toBe(true);
    expect(userVersion(raw)).toBe(8);
  });

  it("seeds manuel pollo invoices without automatic allocations and separates IVA payments", async () => {
    const { db, raw } = createDb();

    const { runMigrations } = await import("../migrations");
    await runMigrations(db as never);

    const invoiceTotals = raw
      .prepare(
        `SELECT COUNT(*) AS count,
                SUM(net_amount) AS net_amount,
                SUM(tax_amount) AS tax_amount,
                SUM(total_amount) AS total_amount,
                SUM(tax_payment) AS tax_payment,
                SUM(tag_amount) AS tag_amount,
                SUM(accountant_amount) AS accountant_amount,
                SUM(savings_amount) AS savings_amount,
                SUM(payment_date IS NOT NULL) AS paid
         FROM invoices`,
      )
      .get() as Record<string, number>;
    const taxPayments = raw
      .prepare("SELECT COUNT(*) AS count, SUM(amount) AS amount FROM tax_payments")
      .get() as { count: number; amount: number };

    expect(invoiceTotals).toMatchObject({
      count: 17,
      net_amount: 12982730,
      tax_amount: 2466720,
      total_amount: 15449450,
      tax_payment: 0,
      tag_amount: 0,
      accountant_amount: 0,
      savings_amount: 0,
      paid: 17,
    });
    expect(taxPayments).toEqual({ count: 4, amount: 1159860 });
  });

  it("creates retentions when upgrading an existing v3 database (the reported bug)", async () => {
    const { db, raw } = createDb();

    // Simulate a v1.0.4 database: version marker at 3, no retentions table.
    raw.exec(`
      PRAGMA user_version = 3;

      CREATE TABLE invoices (
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
    `);

    const { runMigrations } = await import("../migrations");
    await runMigrations(db as never);

    expect(tableExists(raw, "retentions")).toBe(true);
    expect(tableExists(raw, "record_history")).toBe(true);
    expect(userVersion(raw)).toBe(8);
  });

  it("is idempotent: running migrations twice does not fail", async () => {
    const { db, raw } = createDb();

    const { runMigrations } = await import("../migrations");
    await runMigrations(db as never);
    await runMigrations(db as never);

    expect(tableExists(raw, "retentions")).toBe(true);
    expect(tableExists(raw, "record_history")).toBe(true);
    expect(userVersion(raw)).toBe(8);
  });

  it("migrates legacy Don Pollo seed allocations into the IVA payments table", async () => {
    const { db, raw } = createDb();
    const { runMigrations } = await import("../migrations");
    await runMigrations(db as never);

    raw.exec(`
      DELETE FROM tax_payments;
      UPDATE invoices
      SET payment_date = '2026-04-20', tax_payment = 150886,
          tag_amount = 10, accountant_amount = 20, savings_amount = 100
      WHERE id = 'excel-invoice-3';
      PRAGMA user_version = 5;
    `);

    await runMigrations(db as never);

    const invoice = raw
      .prepare(
        `SELECT payment_date, tax_payment, tag_amount,
                accountant_amount, savings_amount
         FROM invoices WHERE id = 'excel-invoice-3'`,
      )
      .get();
    const payment = raw
      .prepare(
        `SELECT payment_date, amount FROM tax_payments
         WHERE id = 'seed-tax-excel-invoice-3'`,
      )
      .get();

    expect(invoice).toEqual({
      payment_date: "2026-04-19",
      tax_payment: 0,
      tag_amount: 0,
      accountant_amount: 0,
      savings_amount: 0,
    });
    expect(payment).toEqual({ payment_date: "2026-04-20", amount: 150886 });
    expect(userVersion(raw)).toBe(8);
  });

  it("removes only legacy savings payments generated from Don Pollo seed invoices", async () => {
    const { db, raw } = createDb();
    const { runMigrations } = await import("../migrations");
    await runMigrations(db as never);

    raw.exec(`
      INSERT INTO general_payments (
        id, category, payment_date, amount, description, reference,
        source_invoice_id, source_type, created_at, updated_at
      ) VALUES
        ('migrated-sav-excel-invoice-1', 'savings', '2026-03-29', 100,
         'Migrado desde factura', NULL, 'excel-invoice-1', 'migrated', 'now', 'now'),
        ('manual-savings', 'savings', '2026-03-29', 500,
         'Pago manual', NULL, NULL, 'manual', 'now', 'now');
      PRAGMA user_version = 6;
    `);

    await runMigrations(db as never);

    const rows = raw
      .prepare("SELECT id, amount FROM general_payments ORDER BY id")
      .all();
    expect(rows).toEqual([{ id: "manual-savings", amount: 500 }]);
    expect(userVersion(raw)).toBe(8);
  });

  it("preserves an existing manual invoice when the updated seed uses the same number", async () => {
    const { db, raw } = createDb();
    const { runMigrations } = await import("../migrations");
    await runMigrations(db as never);

    raw.exec(`
      DELETE FROM tax_payments WHERE source_invoice_id = 'excel-invoice-14';
      DELETE FROM invoices WHERE id = 'excel-invoice-14';
      INSERT INTO invoices (
        id, invoice_number, invoice_date, client_name, description,
        net_amount, tax_amount, total_amount, payment_date,
        tax_payment, tag_amount, accountant_amount, savings_amount,
        created_at, updated_at
      ) VALUES (
        'manual-14', '14', '2026-07-06', 'Cliente manual', NULL,
        1000, 190, 1190, '2026-07-06', 0, 0, 0, 0, 'now', 'now'
      );
      PRAGMA user_version = 7;
    `);

    await runMigrations(db as never);

    const invoice = raw
      .prepare("SELECT id, client_name FROM invoices WHERE invoice_number = '14'")
      .get();
    expect(invoice).toEqual({ id: "manual-14", client_name: "Cliente manual" });
    expect(userVersion(raw)).toBe(8);
  });

  it("backfills current records into record history once", async () => {
    const { db, raw } = createDb();

    raw.exec(`
      PRAGMA user_version = 4;

      CREATE TABLE invoices (
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

      INSERT INTO invoices (
        id, invoice_number, invoice_date, client_name, description,
        net_amount, tax_amount, total_amount, payment_date,
        tax_payment, tag_amount, accountant_amount, savings_amount,
        created_at, updated_at
      ) VALUES (
        'invoice-1', '1', '2026-08-01', 'Cliente', NULL,
        1000, 190, 1190, NULL, 0, 0, 0, 0,
        '2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'
      );
    `);

    const { runMigrations } = await import("../migrations");
    await runMigrations(db as never);
    await runMigrations(db as never);

    const row = raw
      .prepare(
        `SELECT COUNT(*) AS count
         FROM record_history
         WHERE entity_type = 'invoice'
           AND entity_id = 'invoice-1'
           AND action = 'imported'`,
      )
      .get() as { count: number };

    expect(row.count).toBe(1);
    expect(userVersion(raw)).toBe(8);
  });
});
