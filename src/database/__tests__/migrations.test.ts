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
    expect(userVersion(raw)).toBe(4);
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
    expect(userVersion(raw)).toBe(4);
  });

  it("is idempotent: running migrations twice does not fail", async () => {
    const { db, raw } = createDb();

    const { runMigrations } = await import("../migrations");
    await runMigrations(db as never);
    await runMigrations(db as never);

    expect(tableExists(raw, "retentions")).toBe(true);
    expect(userVersion(raw)).toBe(4);
  });
});
