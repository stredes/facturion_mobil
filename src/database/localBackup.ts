import { Directory, File, Paths } from "expo-file-system";

import {
  updateAppSettings,
  type BackupSettings,
} from "../settings/appSettings";
import { getDatabase } from "./database";

const BACKUP_DIRECTORY = "backups";

export interface LocalBackupResult extends BackupSettings {}

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

  const result: LocalBackupResult = {
    createdAt,
    fileName,
    sizeBytes: serialized.byteLength,
    uri: backupFile.uri,
  };

  await updateAppSettings((current) => ({
    ...current,
    lastBackup: result,
  }));

  return result;
}

function toFileTimestamp(value: string): string {
  return value.replace(/[:.]/g, "-");
}
