import {
  databaseNameForUser,
  sanitizeUserIdForFilename,
} from "../dbNames";

describe("databaseNameForUser", () => {
  it("arma el nombre por usuario con prefijo facturion", () => {
    expect(databaseNameForUser("u-abc123")).toBe("facturion-u-abc123.db");
  });

  it("sanea caracteres no seguros para el nombre de archivo", () => {
    expect(sanitizeUserIdForFilename("u a/é/..")).toBe("ua");
    expect(databaseNameForUser("u a/é")).toBe("facturion-ua.db");
  });

  it("usa fallback si el id queda vacío tras sanear", () => {
    expect(sanitizeUserIdForFilename("///")).toBe("user");
    expect(databaseNameForUser("///")).toBe("facturion-user.db");
  });

  it("limita la longitud del id saneado", () => {
    const longId = "u-" + "a".repeat(200);
    expect(sanitizeUserIdForFilename(longId)).toHaveLength(64);
  });
});
