interface BusinessDataDatabase {
  execAsync(sql: string): Promise<void>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

export async function clearBusinessDataFromDatabase(
  db: BusinessDataDatabase,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DELETE FROM general_payments;
      DELETE FROM tax_payments;
      DELETE FROM retentions;
      DELETE FROM invoices;
      DELETE FROM record_history;
    `);
  });
}

export async function clearBusinessData(): Promise<void> {
  const { getDatabase } = await import("./database");
  const db = await getDatabase();
  await clearBusinessDataFromDatabase(db);
}
