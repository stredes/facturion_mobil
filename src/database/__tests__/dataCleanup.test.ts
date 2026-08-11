import { DatabaseSync } from "node:sqlite";

type SQLInputValue = string | number | bigint | null | Uint8Array;

function createDb() {
  const raw = new DatabaseSync(":memory:");
  raw.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE profiles (id TEXT PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE invoices (id TEXT PRIMARY KEY);
    CREATE TABLE general_payments (
      id TEXT PRIMARY KEY,
      source_invoice_id TEXT REFERENCES invoices(id)
    );
    CREATE TABLE tax_payments (
      id TEXT PRIMARY KEY,
      source_invoice_id TEXT REFERENCES invoices(id)
    );
    CREATE TABLE retentions (id TEXT PRIMARY KEY);
    CREATE TABLE record_history (id TEXT PRIMARY KEY);

    INSERT INTO profiles VALUES ('user-1', 'Usuario');
    INSERT INTO invoices VALUES ('invoice-1');
    INSERT INTO general_payments VALUES ('payment-1', 'invoice-1');
    INSERT INTO tax_payments VALUES ('tax-1', 'invoice-1');
    INSERT INTO retentions VALUES ('retention-1');
    INSERT INTO record_history VALUES ('history-1');
  `);

  return {
    raw,
    db: {
      execAsync: async (sql: string) => raw.exec(sql),
      withTransactionAsync: async (task: () => Promise<void>) => {
        raw.exec("BEGIN");
        try {
          await task();
          raw.exec("COMMIT");
        } catch (error) {
          raw.exec("ROLLBACK");
          throw error;
        }
      },
    },
  };
}

function count(raw: DatabaseSync, table: string): number {
  return Number(
    (raw.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as {
      count: SQLInputValue;
    }).count,
  );
}

describe("clearBusinessDataFromDatabase", () => {
  it("clears operational data but preserves profile data", async () => {
    const { clearBusinessDataFromDatabase } = await import("../dataCleanup");
    const { raw, db } = createDb();

    await clearBusinessDataFromDatabase(db);

    expect(count(raw, "invoices")).toBe(0);
    expect(count(raw, "general_payments")).toBe(0);
    expect(count(raw, "tax_payments")).toBe(0);
    expect(count(raw, "retentions")).toBe(0);
    expect(count(raw, "record_history")).toBe(0);
    expect(count(raw, "profiles")).toBe(1);
  });
});
