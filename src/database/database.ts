import * as SQLite from "expo-sqlite";

import { runMigrations } from "./migrations";
import { databaseNameForUser } from "./dbNames";

export { databaseNameForUser, sanitizeUserIdForFilename } from "./dbNames";

let activeUserId: string | null = null;
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getActiveUserId(): string | null {
  return activeUserId;
}

export function setActiveUserId(userId: string | null): void {
  activeUserId = userId;
  databasePromise = null;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!activeUserId) {
    throw new Error("No hay una sesión de usuario activa");
  }

  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(
      databaseNameForUser(activeUserId),
    )
      .then(async (db) => {
        await runMigrations(db);
        return db;
      })
      .catch((error) => {
        databasePromise = null;
        throw error;
      });
  }

  return databasePromise;
}

export async function initializeDatabase(): Promise<void> {
  await getDatabase();
}

export async function resetDatabase(): Promise<void> {
  const current = databasePromise;
  databasePromise = null;
  activeUserId = null;
  if (current) {
    try {
      const db = await current;
      await db.closeAsync();
    } catch {
      // La conexión pudo estar cerrada o fallar; se ignora al resetear.
    }
  }
}
