/**
 * Restore de la base de datos SQLite desde un backup sin reemplazar el
 * archivo: se deserializa el backup en una base en memoria y se copia su
 * contenido hacia la conexion viva con `sqlite3_backup`.
 *
 * La conexion viva nunca se cierra ni se reabre. Eso evita la clase de
 * fallos de close/reopen del hot path (handles desalineados, cache del
 * singleton apuntando a una conexion vieja y errores `unable to open
 * database file` al preparar sentencias sobre el archivo reemplazado).
 *
 * Vive en un modulo sin dependencias de expo para poder testearse en Node.
 */

/** Cabecera SQLite: "SQLite format 3\0" (16 bytes). */
const SQLITE_HEADER_MAGIC = new Uint8Array([
  0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66,
  0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00,
]);

/**
 * Bytes 18/19 de la cabecera SQLite: version de formato de escritura y de
 * lectura. 1 = journal clasico (rollback), 2 = WAL.
 */
const FILE_FORMAT_WRITE_VERSION_OFFSET = 18;
const FILE_FORMAT_READ_VERSION_OFFSET = 19;
const FILE_FORMAT_ROLLBACK = 1;

export function hasValidBackupBytesHeader(bytes: Uint8Array): boolean {
  if (bytes.byteLength < SQLITE_HEADER_MAGIC.byteLength) {
    return false;
  }
  for (let i = 0; i < SQLITE_HEADER_MAGIC.byteLength; i++) {
    if (bytes[i] !== SQLITE_HEADER_MAGIC[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Un backup serializado desde una base en modo WAL lleva la cabecera marcada
 * como WAL (write/read-version = 2). Al deserializar esos bytes en una base
 * `:memory:` con sqlite3_deserialize, sqlite intenta abrir los archivos
 * `-wal`/`-shm` que no existen para una base en memoria, y cualquier acceso
 * (p.ej. un prepare para validar el esquema) falla con "unable to open
 * database file" (SQLITE_CANTOPEN). Se devuelve una copia con la cabecera
 * marcada como journal clasico para que la base en memoria sea legible.
 * No muta el buffer de entrada.
 */
export function normalizeSerializedHeader(bytes: Uint8Array): Uint8Array {
  const normalized = new Uint8Array(bytes);
  if (normalized.byteLength <= FILE_FORMAT_READ_VERSION_OFFSET) {
    return normalized;
  }
  normalized[FILE_FORMAT_WRITE_VERSION_OFFSET] = FILE_FORMAT_ROLLBACK;
  normalized[FILE_FORMAT_READ_VERSION_OFFSET] = FILE_FORMAT_ROLLBACK;
  return normalized;
}

export interface DbRestoreDeps<TSource> {
  deserializeSource(bytes: Uint8Array): Promise<TSource>;
  assertValidSource(source: TSource): Promise<void>;
  backupSourceInto(source: TSource, destDatabase: unknown): Promise<void>;
  closeSource(source: TSource): Promise<void>;
}

/**
 * Orquestador de un restore. Orden critico:
 * 1. Chequeos baratos sobre los bytes ANTES de deserializar.
 * 2. Deserializar el backup en una base en memoria (no toca la actual).
 * 3. Validar las tablas minimas sobre la base deserializada.
 * 4. Copiar el contenido hacia la conexion viva con sqlite3_backup.
 * La base en memoria se cierra SIEMPRE en un `finally`.
 */
export async function restoreDatabaseViaBackup<TSource>(
  bytes: Uint8Array,
  destDatabase: unknown,
  deps: DbRestoreDeps<TSource>,
): Promise<void> {
  if (bytes.byteLength === 0) {
    throw new Error("El archivo de backup está vacío");
  }
  if (!hasValidBackupBytesHeader(bytes)) {
    throw new Error("El archivo no es una base de datos SQLite válida");
  }

  // Los backups serializados desde una base en WAL quedan marcados como WAL
  // en su cabecera y no se pueden leer deserializados en memoria. Se
  // normalizan ANTES de deserializar.
  const source = await deps.deserializeSource(normalizeSerializedHeader(bytes));
  try {
    await deps.assertValidSource(source);
    await deps.backupSourceInto(source, destDatabase);
  } finally {
    await deps.closeSource(source);
  }
}
