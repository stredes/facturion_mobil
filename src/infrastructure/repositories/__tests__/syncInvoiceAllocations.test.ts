import { DatabaseSync } from "node:sqlite";

import { syncInvoiceAllocations } from "../syncInvoiceAllocations";

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

function createSchema(raw: DatabaseSync): void {
  raw.exec(`
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

    CREATE TABLE general_payments (
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

    CREATE TABLE tax_payments (
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

    CREATE TABLE record_history (
      id TEXT PRIMARY KEY NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      snapshot TEXT NOT NULL,
      previous_snapshot TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

function insertInvoice(raw: DatabaseSync, invoiceId = "invoice-1"): void {
  raw.exec(
    `INSERT INTO invoices (
      id, invoice_number, invoice_date, client_name,
      net_amount, tax_amount, total_amount, payment_date,
      tax_payment, tag_amount, accountant_amount, savings_amount,
      created_at, updated_at
    ) VALUES (
      '${invoiceId}', '1', '2026-08-01', 'Cliente',
      1000, 190, 1190, '2026-08-10', 0, 0, 0, 0,
      '2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'
    )`,
  );
}

function seedMigratedRows(raw: DatabaseSync, invoiceId: string): void {
  raw.exec(`
    INSERT INTO tax_payments (
      id, tax_period, payment_date, amount, description, reference,
      source_invoice_id, source_type, created_at, updated_at
    ) VALUES (
      'migrated-tax-${invoiceId}', '2026-08', '2026-08-10', 1900,
      'Migrado desde factura', NULL, '${invoiceId}', 'migrated',
      '2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'
    );

    INSERT INTO general_payments (
      id, category, payment_date, amount, description, reference,
      source_invoice_id, source_type, created_at, updated_at
    ) VALUES (
      'migrated-tag-${invoiceId}', 'tag', '2026-08-10', 500,
      'Migrado desde factura', NULL, '${invoiceId}', 'migrated',
      '2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'
    );

    INSERT INTO general_payments (
      id, category, payment_date, amount, description, reference,
      source_invoice_id, source_type, created_at, updated_at
    ) VALUES (
      'migrated-acc-${invoiceId}', 'accountant', '2026-08-10', 300,
      'Migrado desde factura', NULL, '${invoiceId}', 'migrated',
      '2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'
    );

    INSERT INTO general_payments (
      id, category, payment_date, amount, description, reference,
      source_invoice_id, source_type, created_at, updated_at
    ) VALUES (
      'migrated-sav-${invoiceId}', 'savings', '2026-08-10', 200,
      'Migrado desde factura', NULL, '${invoiceId}', 'migrated',
      '2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'
    );
  `);
}

const INVOICE = {
  id: "invoice-1",
  invoiceDate: "2026-08-01",
  paymentDate: "2026-08-10",
};

const NOW = "2026-08-10T12:00:00.000Z";

describe("syncInvoiceAllocations", () => {
  it("crea filas migradas cuando los montos son positivos", async () => {
    const { db, raw } = createDb();
    createSchema(raw);
    insertInvoice(raw);

    await syncInvoiceAllocations(
      db as never,
      INVOICE,
      { taxPayment: 1900, tagAmount: 500, accountantAmount: 300, savingsAmount: 200 },
      NOW,
    );

    const tax = raw
      .prepare(
        `SELECT * FROM tax_payments
         WHERE source_invoice_id = 'invoice-1' AND source_type = 'migrated'`,
      )
      .all() as Array<Record<string, unknown>>;
    const general = raw
      .prepare(
        `SELECT * FROM general_payments
         WHERE source_invoice_id = 'invoice-1' AND source_type = 'migrated'`,
      )
      .all() as Array<Record<string, unknown>>;

    expect(tax).toHaveLength(1);
    expect(tax[0]).toMatchObject({
      tax_period: "2026-08",
      payment_date: "2026-08-10",
      amount: 1900,
    });

    expect(general).toHaveLength(3);
    expect(
      general.find((row) => row.category === "tag"),
    ).toMatchObject({ amount: 500 });
    expect(
      general.find((row) => row.category === "accountant"),
    ).toMatchObject({ amount: 300 });
    expect(
      general.find((row) => row.category === "savings"),
    ).toMatchObject({ amount: 200 });
  });

  it("actualiza filas migradas existentes cuando cambian los montos", async () => {
    const { db, raw } = createDb();
    createSchema(raw);
    insertInvoice(raw);
    seedMigratedRows(raw, "invoice-1");

    await syncInvoiceAllocations(
      db as never,
      INVOICE,
      { taxPayment: 950, tagAmount: 0, accountantAmount: 300, savingsAmount: 200 },
      NOW,
    );

    const tax = raw
      .prepare(
        `SELECT amount, payment_date, updated_at FROM tax_payments
         WHERE id = 'migrated-tax-invoice-1'`,
      )
      .get() as { amount: number; payment_date: string; updated_at: string };

    expect(tax.amount).toBe(950);
    expect(tax.updated_at).toBe(NOW);

    const tagCount = raw
      .prepare(`SELECT COUNT(*) AS count FROM general_payments WHERE id = 'migrated-tag-invoice-1'`)
      .get() as { count: number };
    expect(tagCount.count).toBe(0);
  });

  it("elimina filas migradas cuando los montos quedan en cero", async () => {
    const { db, raw } = createDb();
    createSchema(raw);
    insertInvoice(raw);
    seedMigratedRows(raw, "invoice-1");

    await syncInvoiceAllocations(
      db as never,
      INVOICE,
      { taxPayment: 0, tagAmount: 0, accountantAmount: 0, savingsAmount: 0 },
      NOW,
    );

    const taxCount = raw
      .prepare(
        `SELECT COUNT(*) AS count FROM tax_payments
         WHERE source_invoice_id = 'invoice-1' AND source_type = 'migrated'`,
      )
      .get() as { count: number };
    const generalCount = raw
      .prepare(
        `SELECT COUNT(*) AS count FROM general_payments
         WHERE source_invoice_id = 'invoice-1' AND source_type = 'migrated'`,
      )
      .get() as { count: number };

    expect(taxCount.count).toBe(0);
    expect(generalCount.count).toBe(0);
  });

  it("no crea filas cuando todos los montos son cero", async () => {
    const { db, raw } = createDb();
    createSchema(raw);
    insertInvoice(raw);

    await syncInvoiceAllocations(
      db as never,
      INVOICE,
      { taxPayment: 0, tagAmount: 0, accountantAmount: 0, savingsAmount: 0 },
      NOW,
    );

    const taxCount = raw
      .prepare("SELECT COUNT(*) AS count FROM tax_payments")
      .get() as { count: number };
    const generalCount = raw
      .prepare("SELECT COUNT(*) AS count FROM general_payments")
      .get() as { count: number };

    expect(taxCount.count).toBe(0);
    expect(generalCount.count).toBe(0);
  });

  it("usa la fecha de la factura como fecha de pago cuando no hay payment_date", async () => {
    const { db, raw } = createDb();
    createSchema(raw);
    insertInvoice(raw);

    await syncInvoiceAllocations(
      db as never,
      { id: "invoice-1", invoiceDate: "2026-08-01", paymentDate: null },
      { taxPayment: 100, tagAmount: 0, accountantAmount: 0, savingsAmount: 0 },
      NOW,
    );

    const tax = raw
      .prepare("SELECT payment_date FROM tax_payments WHERE id = 'migrated-tax-invoice-1'")
      .get() as { payment_date: string };

    expect(tax.payment_date).toBe("2026-08-01");
  });

  it("registra historial de creacion, actualizacion y eliminacion", async () => {
    const { db, raw } = createDb();
    createSchema(raw);
    insertInvoice(raw);
    seedMigratedRows(raw, "invoice-1");

    await syncInvoiceAllocations(
      db as never,
      INVOICE,
      { taxPayment: 0, tagAmount: 600, accountantAmount: 300, savingsAmount: 200 },
      NOW,
    );

    const history = raw
      .prepare(
        `SELECT entity_type, entity_id, action FROM record_history
         ORDER BY created_at`,
      )
      .all() as Array<Record<string, string>>;

    expect(history).toEqual(
      expect.arrayContaining([
        { entity_type: "tax_payment", entity_id: "migrated-tax-invoice-1", action: "deleted" },
        { entity_type: "general_payment", entity_id: "migrated-tag-invoice-1", action: "updated" },
      ]),
    );
  });
});
