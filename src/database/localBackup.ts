import * as FileSystemLegacy from "expo-file-system/legacy";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
  backupDatabaseAsync,
  deserializeDatabaseAsync,
  type SQLiteDatabase,
} from "expo-sqlite";

import {
  displayNameFromDirectoryUri,
  loadAppSettings,
  setBackupDirectory,
  updateAppSettings,
  type BackupDirectorySetting,
  type BackupSettings,
} from "../settings/appSettings";
import { getDatabase } from "./database";
import { restoreDatabaseViaBackup } from "./dbRestore";
import { runMigrations } from "./migrations";

const BACKUP_DIRECTORY = "backups";
const BACKUP_MIME_TYPE = "application/x-sqlite3";
const SAF_MIME_TYPE = "application/octet-stream";

// Etiqueta cada paso del restore para diagnosticar exactamente en que punto
// falla si el error vuelve a reproducirse (p.ej. "preparar base: ...").
async function step<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${label}: ${message}`, { cause: error });
  }
}

export interface LocalBackupResult extends BackupSettings {
  savedToExternal: boolean;
  externalError: string | null;
}

export interface LocalBackupFile {
  fileName: string;
  uri: string;
  sizeBytes: number;
  modificationTime: number;
}

export interface LocalBackupRestoreResult {
  fileName: string;
  restoredAt: string;
  sizeBytes: number;
  uri: string;
  counts: {
    invoices: number;
    generalPayments: number;
    taxPayments: number;
    retentions: number;
  };
}

export interface LocalBackupSourceMeta {
  fileName?: string;
  sizeBytes?: number;
}

/**
 * Pide al usuario elegir la carpeta donde se guardarán los backups (Android
 * Storage Access Framework). Si acepta, queda configurada como destino por
 * defecto y se devuelve; si cancela o no hay soporte, devuelve null.
 */
export async function chooseBackupDirectory(): Promise<BackupDirectorySetting | null> {
  const result =
    await FileSystemLegacy.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!result.granted || !result.directoryUri) {
    return null;
  }

  const directory: BackupDirectorySetting = {
    uri: result.directoryUri,
    displayName: displayNameFromDirectoryUri(result.directoryUri),
  };
  await setBackupDirectory(directory);
  return directory;
}

export async function createLocalBackup(): Promise<LocalBackupResult> {
  const db = await getDatabase();
  const serialized = await db.serializeAsync();
  const createdAt = new Date().toISOString();
  const fileName = `factrion-backup-${toFileTimestamp(createdAt)}.db`;
  const backupDir = new Directory(Paths.document, BACKUP_DIRECTORY);

  backupDir.create({ idempotent: true, intermediates: true });

  const backupFile = new File(backupDir, fileName);
  if (backupFile.exists) {
    backupFile.delete();
  }
  backupFile.create({ overwrite: true });
  backupFile.write(serialized);

  const settings = await loadAppSettings();
  const { savedToExternal, externalError } = settings.backupDirectory
    ? await writeExternalBackup(settings.backupDirectory, fileName, serialized)
    : { savedToExternal: false, externalError: null };

  const result: LocalBackupResult = {
    createdAt,
    fileName,
    sizeBytes: serialized.byteLength,
    uri: backupFile.uri,
    savedToExternal,
    externalError,
  };

  await updateAppSettings((current) => ({
    ...current,
    lastBackup: result,
  }));

  return result;
}

async function writeExternalBackup(
  directory: { uri: string; displayName: string },
  fileName: string,
  bytes: Uint8Array,
): Promise<{ savedToExternal: boolean; externalError: string | null }> {
  try {
    const base64 = bytesToBase64(bytes);
    const fileUri = await createSafFileWithRetry(directory.uri, fileName);
    await FileSystemLegacy.StorageAccessFramework.writeAsStringAsync(
      fileUri,
      base64,
      {
        encoding: FileSystemLegacy.EncodingType.Base64,
      },
    );
    return { savedToExternal: true, externalError: null };
  } catch (error) {
    return {
      savedToExternal: false,
      externalError:
        error instanceof Error
          ? error.message
          : "No se pudo guardar en la carpeta elegida",
    };
  }
}

async function createSafFileWithRetry(
  directoryUri: string,
  fileName: string,
): Promise<string> {
  const baseName = fileName.replace(/\.db$/i, "");
  let attempt = 0;
  for (;;) {
    const candidate =
      attempt === 0 ? fileName : `${baseName}-${attempt}.db`;
    try {
      return await FileSystemLegacy.StorageAccessFramework.createFileAsync(
        directoryUri,
        candidate,
        SAF_MIME_TYPE,
      );
    } catch (error) {
      const exists =
        error instanceof Error &&
        /exist/i.test(error.message);
      if (!exists || attempt >= 3) {
        throw error;
      }
      attempt += 1;
    }
  }
}

export async function exportLocalBackup(uri: string): Promise<void> {
  const file = new File(uri);
  if (!file.exists) {
    throw new Error("El archivo de backup no existe");
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error(
      "Compartir no está disponible en este dispositivo",
    );
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: BACKUP_MIME_TYPE,
    dialogTitle: "Compartir backup de Facturiion",
  });
}

export async function restoreLocalBackup(
  uri: string,
  meta: LocalBackupSourceMeta = {},
): Promise<LocalBackupRestoreResult> {
  const bytes = await readBytesFromUri(uri);

  // Los archivos importados llegan al cache (purgable). Se copian al
  // directorio persistente de backups para que no se pierdan y aparezcan
  // en el listado local.
  const backupDir = new Directory(Paths.document, BACKUP_DIRECTORY);
  backupDir.create({ idempotent: true, intermediates: true });

  const alreadyPersisted = uri.startsWith(backupDir.uri);
  const persisted = alreadyPersisted
    ? null
    : persistImportedBackup(backupDir, bytes, meta, uri);

  let restored = false;
  try {
    const db = await getDatabase();

    // La conexion viva esta en modo WAL. sqlite3_backup hacia un destino en
    // WAL falla documentadamente si el page size difiere entre origen y
    // destino, y deja la conexion en un estado que provoca errores
    // "unable to open database file" en prepares posteriores. Se sale de WAL
    // durante la copia y se reaplica WAL despues.
    await step("preparar base", () => db.execAsync("PRAGMA journal_mode = DELETE"));

    await step("copiar datos", () =>
      restoreDatabaseViaBackup(bytes, db, {
        deserializeSource: deserializeDatabaseAsync,
        assertValidSource: assertValidBackupSource,
        backupSourceInto: (source, dest) =>
          backupDatabaseAsync({
            sourceDatabase: source,
            destDatabase: dest as SQLiteDatabase,
          }),
        closeSource: (source) => source.closeAsync(),
      }),
    );
    restored = true;

    // Reconciliar el esquema si el backup viene de una version anterior y
    // reaplicar pragmas de conexion (journal_mode WAL, foreign_keys).
    await step("reaplicar WAL", () => db.execAsync("PRAGMA journal_mode = WAL"));
    await step("migrar esquema", () => runMigrations(db));

    const restoredAt = new Date().toISOString();
    const fileName =
      persisted?.fileName ??
      meta.fileName ??
      fileNameFromUri(uri) ??
      `restore-${toFileTimestamp(restoredAt)}.db`;
    const result: LocalBackupRestoreResult = {
      fileName,
      restoredAt,
      sizeBytes: meta.sizeBytes ?? bytes.byteLength,
      uri: persisted?.uri ?? uri,
      counts: await getBackupCounts(),
    };

    await updateAppSettings((current) => ({
      ...current,
      lastBackup: {
        createdAt: restoredAt,
        fileName,
        sizeBytes: result.sizeBytes,
        uri: result.uri,
      },
    }));

    return result;
  } catch (error) {
    if (!restored && persisted) {
      const persistedFile = new File(persisted.uri);
      if (persistedFile.exists) {
        persistedFile.delete();
      }
    }
    throw error;
  }
}

export function listLocalBackups(): LocalBackupFile[] {
  const backupDir = new Directory(Paths.document, BACKUP_DIRECTORY);
  if (!backupDir.exists) {
    return [];
  }

  return backupDir
    .list()
    .filter(
      (entry): entry is File => entry instanceof File && entry.extension === ".db",
    )
    .map((file) => ({
      fileName: file.name,
      uri: file.uri,
      sizeBytes: file.size,
      modificationTime: file.modificationTime ?? 0,
    }))
    .sort((a, b) => b.modificationTime - a.modificationTime);
}

async function getBackupCounts(): Promise<LocalBackupRestoreResult["counts"]> {
  const db = await getDatabase();
  const countTable = async (table: string): Promise<number> => {
    try {
      const row = await db.getFirstAsync<{ c: number }>(
        `SELECT COUNT(*) AS c FROM ${table}`,
      );
      return row?.c ?? 0;
    } catch {
      return 0;
    }
  };

  return {
    invoices: await countTable("invoices"),
    generalPayments: await countTable("general_payments"),
    taxPayments: await countTable("tax_payments"),
    retentions: await countTable("retentions"),
  };
}

async function readBytesFromUri(uri: string): Promise<Uint8Array> {
  if (uri.startsWith("file://")) {
    const file = new File(uri);
    if (!file.exists) {
      throw new Error("El archivo de backup no existe");
    }
    return file.bytes();
  }

  const base64 = await FileSystemLegacy.readAsStringAsync(uri, {
    encoding: FileSystemLegacy.EncodingType.Base64,
  });
  return base64ToBytes(base64);
}

/**
 * Tablas de negocio minimas que debe contener un backup de Facturiion.
 * Valida todas: un archivo que solo tenga `invoices` podria ser de otra app.
 */
const REQUIRED_BUSINESS_TABLES = [
  "invoices",
  "general_payments",
  "tax_payments",
  "retentions",
] as const;

/**
 * Valida que la base deserializada del backup contenga las tablas minimas
 * de Facturiion ANTES de copiarla hacia la base actual. Si el archivo es
 * corrupto o no es un backup, lanza y el restore se aborta sin danos.
 */
async function assertValidBackupSource(db: SQLiteDatabase): Promise<void> {
  const placeholders = REQUIRED_BUSINESS_TABLES.map(() => "?").join(", ");
  const rows = await db.getAllAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (${placeholders})`,
    [...REQUIRED_BUSINESS_TABLES],
  );
  const present = new Set(rows.map((row) => row.name));
  const missing = REQUIRED_BUSINESS_TABLES.filter(
    (table) => !present.has(table),
  );
  if (missing.length > 0) {
    throw new Error(
      `El archivo no es un backup de Facturiion válido (faltan tablas: ${missing.join(", ")})`,
    );
  }
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fileNameFromUri(uri: string): string | null {
  const rawName = uri.split("/").pop() ?? "";
  if (!rawName) {
    return null;
  }

  try {
    return decodeURIComponent(rawName);
  } catch {
    return rawName;
  }
}

function persistImportedBackup(
  backupDir: Directory,
  bytes: Uint8Array,
  meta: LocalBackupSourceMeta,
  sourceUri: string,
): { uri: string; fileName: string } {
  const fallback = `import-${toFileTimestamp(new Date().toISOString())}.db`;
  const fileName =
    sanitizeBackupFileName(meta.fileName ?? fileNameFromUri(sourceUri)) ??
    fallback;
  const file = new File(backupDir, fileName);
  if (file.exists) {
    file.delete();
  }
  file.create({ overwrite: true });
  file.write(bytes);
  return { uri: file.uri, fileName };
}

function sanitizeBackupFileName(
  raw: string | null | undefined,
): string | null {
  if (!raw) {
    return null;
  }

  const cleaned = raw
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  if (!cleaned) {
    return null;
  }

  return cleaned.toLowerCase().endsWith(".db") ? cleaned : `${cleaned}.db`;
}

function toFileTimestamp(value: string): string {
  return value.replace(/[:.]/g, "-");
}
