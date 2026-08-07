import {
  hasValidBackupBytesHeader,
  normalizeSerializedHeader,
  restoreDatabaseViaBackup,
} from "../dbRestore";

const SQLITE_MAGIC = [
  0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66,
  0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00,
] as const;

function backupBytes(header = [2, 2]): Uint8Array {
  const bytes = new Uint8Array(100);
  bytes.set(SQLITE_MAGIC);
  bytes[18] = header[0];
  bytes[19] = header[1];
  return bytes;
}

type Source = { id: string };

function createDeps(overrides: Partial<{
  assertValid: jest.Mock;
  backup: jest.Mock;
  close: jest.Mock;
}> = {}) {
  const deserializeSource = jest.fn(async (_bytes: Uint8Array): Promise<Source> => ({ id: "src" }));
  const assertValidSource = overrides.assertValid ?? jest.fn(async () => {});
  const backupSourceInto = overrides.backup ?? jest.fn(async () => {});
  const closeSource = overrides.close ?? jest.fn(async () => {});

  return {
    deps: { deserializeSource, assertValidSource, backupSourceInto, closeSource },
    mocks: { deserializeSource, assertValidSource, backupSourceInto, closeSource },
  };
}

describe("hasValidBackupBytesHeader", () => {
  it("reconoce la cabecera SQLite", () => {
    expect(hasValidBackupBytesHeader(backupBytes())).toBe(true);
  });

  it("rechaza bytes sin cabecera SQLite", () => {
    expect(hasValidBackupBytesHeader(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]))).toBe(false);
  });

  it("rechaza buffers demasiado cortos", () => {
    expect(hasValidBackupBytesHeader(new Uint8Array([0x53, 0x51, 0x4c]))).toBe(false);
  });
});

describe("normalizeSerializedHeader", () => {
  it("marca la cabecera como journal clasico (write/read-version 1,1)", () => {
    const bytes = backupBytes([2, 2]);

    const normalized = normalizeSerializedHeader(bytes);

    expect(normalized[18]).toBe(1);
    expect(normalized[19]).toBe(1);
  });

  it("no muta el buffer de entrada", () => {
    const bytes = backupBytes([2, 2]);

    normalizeSerializedHeader(bytes);

    expect(bytes[18]).toBe(2);
    expect(bytes[19]).toBe(2);
  });

  it("es idempotente sobre un backup ya en journal clasico", () => {
    const bytes = backupBytes([1, 1]);

    const normalized = normalizeSerializedHeader(bytes);

    expect(normalized[18]).toBe(1);
    expect(normalized[19]).toBe(1);
  });
});

describe("restoreDatabaseViaBackup", () => {
  it("rechaza archivos vacios sin deserializar", async () => {
    const { deps, mocks } = createDeps();

    await expect(
      restoreDatabaseViaBackup(new Uint8Array(0), "dest", deps),
    ).rejects.toThrow("El archivo de backup está vacío");

    expect(mocks.deserializeSource).not.toHaveBeenCalled();
    expect(mocks.assertValidSource).not.toHaveBeenCalled();
    expect(mocks.backupSourceInto).not.toHaveBeenCalled();
    expect(mocks.closeSource).not.toHaveBeenCalled();
  });

  it("rechaza bytes sin cabecera SQLite antes de deserializar", async () => {
    const { deps, mocks } = createDeps();

    await expect(
      restoreDatabaseViaBackup(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), "dest", deps),
    ).rejects.toThrow("El archivo no es una base de datos SQLite válida");

    expect(mocks.deserializeSource).not.toHaveBeenCalled();
    expect(mocks.closeSource).not.toHaveBeenCalled();
  });

  it("deserializa los bytes normalizados, valida y copia hacia la base", async () => {
    const { deps, mocks } = createDeps();
    const bytes = backupBytes([2, 2]);

    await restoreDatabaseViaBackup(bytes, "dest-db", deps);

    const received = mocks.deserializeSource.mock.calls[0][0] as Uint8Array;
    expect(received).not.toBe(bytes);
    expect(received[18]).toBe(1);
    expect(received[19]).toBe(1);
    expect(bytes[18]).toBe(2);
    expect(mocks.assertValidSource).toHaveBeenCalledWith({ id: "src" });
    expect(mocks.backupSourceInto).toHaveBeenCalledWith({ id: "src" }, "dest-db");
    expect(mocks.closeSource).toHaveBeenCalledWith({ id: "src" });
  });

  it("no copia hacia la base si la validacion falla y cierra la fuente", async () => {
    const { deps, mocks } = createDeps({
      assertValid: jest.fn(async () => {
        throw new Error("faltan tablas: tax_payments");
      }),
    });

    await expect(
      restoreDatabaseViaBackup(backupBytes(), "dest-db", deps),
    ).rejects.toThrow("faltan tablas");

    expect(mocks.backupSourceInto).not.toHaveBeenCalled();
    expect(mocks.closeSource).toHaveBeenCalledTimes(1);
  });

  it("cierra la fuente incluso si el backup hacia la base falla", async () => {
    const { deps, mocks } = createDeps({
      backup: jest.fn(async () => {
        throw new Error("backup failed");
      }),
    });

    await expect(
      restoreDatabaseViaBackup(backupBytes(), "dest-db", deps),
    ).rejects.toThrow("backup failed");

    expect(mocks.assertValidSource).toHaveBeenCalled();
    expect(mocks.closeSource).toHaveBeenCalledTimes(1);
  });
});
