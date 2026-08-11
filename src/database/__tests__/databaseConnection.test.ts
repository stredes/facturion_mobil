const openDatabaseAsync = jest.fn();
const runMigrations = jest.fn();

jest.mock("expo-sqlite", () => ({
  openDatabaseAsync,
}));

jest.mock("../migrations", () => ({
  runMigrations,
}));

describe("database connection", () => {
  beforeEach(() => {
    jest.resetModules();
    openDatabaseAsync.mockReset();
    runMigrations.mockReset();
  });

  it("opens one fresh native connection and reuses it for the active user", async () => {
    const db = { closeAsync: jest.fn() };
    openDatabaseAsync.mockResolvedValue(db);
    const { getDatabase, setActiveUserId } = await import("../database");

    setActiveUserId("user-1");
    const first = await getDatabase();
    const second = await getDatabase();

    expect(first).toBe(db);
    expect(second).toBe(db);
    expect(openDatabaseAsync).toHaveBeenCalledTimes(1);
    expect(openDatabaseAsync).toHaveBeenCalledWith("facturion-user-1.db", {
      useNewConnection: true,
    });
    expect(runMigrations).toHaveBeenCalledTimes(1);
  });
});
