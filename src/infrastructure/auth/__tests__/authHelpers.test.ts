import { createUserId, normalizeEmail } from "../authHelpers";

describe("normalizeEmail", () => {
  it("recorta espacios y pasa a minúsculas", () => {
    expect(normalizeEmail("  Usuario@Ejemplo.COM  ")).toBe(
      "usuario@ejemplo.com",
    );
  });
});

describe("createUserId", () => {
  it("genera ids únicos con prefijo", () => {
    const a = createUserId();
    const b = createUserId();
    expect(a).toMatch(/^u-/);
    expect(a).not.toBe(b);
  });
});
