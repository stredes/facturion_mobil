import type * as SQLite from "expo-sqlite";

import { createId } from "../utils/ids";

export type RecordEntityType =
  | "invoice"
  | "general_payment"
  | "tax_payment"
  | "retention";

export type RecordHistoryAction =
  | "imported"
  | "created"
  | "updated"
  | "deleted";

type Snapshot = object;

interface RecordHistoryInput {
  entityType: RecordEntityType;
  entityId: string;
  action: RecordHistoryAction;
  snapshot: Snapshot;
  previousSnapshot?: Snapshot | null;
  occurredAt?: string;
}

interface BackfillTarget {
  entityType: RecordEntityType;
  tableName: string;
}

const BACKFILL_TARGETS: BackfillTarget[] = [
  { entityType: "invoice", tableName: "invoices" },
  { entityType: "general_payment", tableName: "general_payments" },
  { entityType: "tax_payment", tableName: "tax_payments" },
  { entityType: "retention", tableName: "retentions" },
];

function serialize(snapshot: Snapshot | null | undefined): string | null {
  return snapshot ? JSON.stringify(snapshot) : null;
}

async function tableExists(
  db: SQLite.SQLiteDatabase,
  tableName: string,
): Promise<boolean> {
  const row = await db.getFirstAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
    [tableName],
  );
  return Boolean(row);
}

export async function ensureRecordHistoryTable(
  db: SQLite.SQLiteDatabase,
): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS record_history (
      id TEXT PRIMARY KEY NOT NULL,
      entity_type TEXT NOT NULL CHECK (
        entity_type IN ('invoice', 'general_payment', 'tax_payment', 'retention')
      ),
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL CHECK (
        action IN ('imported', 'created', 'updated', 'deleted')
      ),
      snapshot TEXT NOT NULL,
      previous_snapshot TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_record_history_entity
    ON record_history(entity_type, entity_id, created_at);

    CREATE INDEX IF NOT EXISTS idx_record_history_created_at
    ON record_history(created_at);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_record_history_imported_once
    ON record_history(entity_type, entity_id, action)
    WHERE action = 'imported';
  `);
}

export async function insertRecordHistory(
  db: SQLite.SQLiteDatabase,
  input: RecordHistoryInput,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO record_history (
      id, entity_type, entity_id, action, snapshot, previous_snapshot, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      createId("hist"),
      input.entityType,
      input.entityId,
      input.action,
      serialize(input.snapshot),
      serialize(input.previousSnapshot),
      input.occurredAt ?? new Date().toISOString(),
    ],
  );
}

export async function backfillInitialRecordHistory(
  db: SQLite.SQLiteDatabase,
): Promise<void> {
  const timestamp = new Date().toISOString();

  for (const target of BACKFILL_TARGETS) {
    if (!(await tableExists(db, target.tableName))) {
      continue;
    }

    const rows = await db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM ${target.tableName}`,
    );

    for (const row of rows) {
      await db.runAsync(
        `INSERT OR IGNORE INTO record_history (
          id, entity_type, entity_id, action, snapshot, previous_snapshot, created_at
        ) VALUES (?, ?, ?, 'imported', ?, NULL, ?)`,
        [
          createId("hist"),
          target.entityType,
          String(row.id),
          serialize(row),
          timestamp,
        ],
      );
    }
  }
}
