import type * as SQLite from "expo-sqlite";

import { insertRecordHistory } from "../../database/recordHistory";

export interface InvoiceAllocationAmounts {
  taxPayment: number;
  tagAmount: number;
  accountantAmount: number;
  savingsAmount: number;
}

interface SyncInvoice {
  id: string;
  invoiceDate: string;
  paymentDate: string | null;
}

type PaymentTable = "tax_payments" | "general_payments";
type PaymentEntityType = "tax_payment" | "general_payment";

const GENERAL_CATEGORY_PREFIX = {
  tag: "migrated-tag-",
  accountant: "migrated-acc-",
  savings: "migrated-sav-",
} as const;

/**
 * Mantiene las filas de pagos con source_type='migrated' (creadas por la
 * migracion v3) alineadas con los montos de reparto de la factura, para que
 * los balances del home (que leen la factura) y el informe mensual (que lee
 * las tablas de pagos) no se desincronicen.
 */
export async function syncInvoiceAllocations(
  db: SQLite.SQLiteDatabase,
  invoice: SyncInvoice,
  amounts: InvoiceAllocationAmounts,
  now: string,
): Promise<void> {
  const payDate = invoice.paymentDate ?? invoice.invoiceDate;
  const taxPeriod = invoice.invoiceDate.slice(0, 7);

  await syncTaxPayment(db, invoice.id, taxPeriod, payDate, amounts.taxPayment, now);
  await syncGeneralPayment(db, invoice.id, "tag", payDate, amounts.tagAmount, now);
  await syncGeneralPayment(db, invoice.id, "accountant", payDate, amounts.accountantAmount, now);
  await syncGeneralPayment(db, invoice.id, "savings", payDate, amounts.savingsAmount, now);
}

async function syncTaxPayment(
  db: SQLite.SQLiteDatabase,
  invoiceId: string,
  taxPeriod: string,
  payDate: string,
  amount: number,
  now: string,
): Promise<void> {
  await syncMigratedPayment(db, "tax_payments", "tax_payment", () =>
    findMigratedPaymentId(
      db,
      "tax_payments",
      "source_invoice_id = ? AND source_type = 'migrated'",
      [invoiceId],
    ),
    amount,
    now,
    {
      upsertId: `migrated-tax-${invoiceId}`,
      update: async (id, paymentDate) => {
        await db.runAsync(
          `UPDATE tax_payments
           SET tax_period = ?, payment_date = ?, amount = ?, updated_at = ?
           WHERE id = ?`,
          [taxPeriod, paymentDate, amount, now, id],
        );
      },
      insert: async (paymentDate) => {
        await db.runAsync(
          `INSERT INTO tax_payments (
            id, tax_period, payment_date, amount, description,
            reference, source_invoice_id, source_type, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'migrated', ?, ?)`,
          [
            `migrated-tax-${invoiceId}`,
            taxPeriod,
            paymentDate,
            amount,
            "Generado desde factura",
            null,
            invoiceId,
            now,
            now,
          ],
        );
      },
    },
    payDate,
  );
}

async function syncGeneralPayment(
  db: SQLite.SQLiteDatabase,
  invoiceId: string,
  category: "tag" | "accountant" | "savings",
  payDate: string,
  amount: number,
  now: string,
): Promise<void> {
  await syncMigratedPayment(db, "general_payments", "general_payment", () =>
    findMigratedPaymentId(
      db,
      "general_payments",
      "source_invoice_id = ? AND source_type = 'migrated' AND category = ?",
      [invoiceId, category],
    ),
    amount,
    now,
    {
      upsertId: `${GENERAL_CATEGORY_PREFIX[category]}${invoiceId}`,
      update: async (id, paymentDate) => {
        await db.runAsync(
          `UPDATE general_payments
           SET payment_date = ?, amount = ?, updated_at = ?
           WHERE id = ?`,
          [paymentDate, amount, now, id],
        );
      },
      insert: async (paymentDate) => {
        await db.runAsync(
          `INSERT INTO general_payments (
            id, category, payment_date, amount, description,
            reference, source_invoice_id, source_type, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'migrated', ?, ?)`,
          [
            `${GENERAL_CATEGORY_PREFIX[category]}${invoiceId}`,
            category,
            paymentDate,
            amount,
            "Generado desde factura",
            null,
            invoiceId,
            now,
            now,
          ],
        );
      },
    },
    payDate,
  );
}

async function findMigratedPaymentId(
  db: SQLite.SQLiteDatabase,
  table: PaymentTable,
  where: string,
  params: (string | number | null)[],
): Promise<string | null> {
  const row = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM ${table} WHERE ${where} LIMIT 1`,
    params,
  );
  return row?.id ?? null;
}

async function findPaymentRow(
  db: SQLite.SQLiteDatabase,
  table: PaymentTable,
  id: string,
): Promise<Record<string, unknown> | null> {
  return db.getFirstAsync<Record<string, unknown>>(
    `SELECT * FROM ${table} WHERE id = ? LIMIT 1`,
    [id],
  );
}

async function syncMigratedPayment(
  db: SQLite.SQLiteDatabase,
  table: PaymentTable,
  entityType: PaymentEntityType,
  findExisting: () => Promise<string | null>,
  amount: number,
  now: string,
  apply: {
    upsertId: string;
    update: (id: string, paymentDate: string) => Promise<void>;
    insert: (paymentDate: string) => Promise<void>;
  },
  payDate: string,
): Promise<void> {
  const existingId = await findExisting();

  if (amount > 0) {
    const id = existingId ?? apply.upsertId;

    if (existingId) {
      const previous = await findPaymentRow(db, table, id);
      await apply.update(id, payDate);
      const next = (await findPaymentRow(db, table, id)) ?? { id };
      await insertRecordHistory(db, {
        entityType,
        entityId: id,
        action: "updated",
        snapshot: next,
        previousSnapshot: previous,
        occurredAt: now,
      });
    } else {
      await apply.insert(payDate);
      const next = (await findPaymentRow(db, table, apply.upsertId)) ?? {
        id: apply.upsertId,
      };
      await insertRecordHistory(db, {
        entityType,
        entityId: apply.upsertId,
        action: "created",
        snapshot: next,
        occurredAt: now,
      });
    }
  } else if (existingId) {
    const previous = await findPaymentRow(db, table, existingId);
    await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [existingId]);
    await insertRecordHistory(db, {
      entityType,
      entityId: existingId,
      action: "deleted",
      snapshot: previous ?? { id: existingId },
      occurredAt: now,
    });
  }
}
