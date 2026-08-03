import { retentionSchema } from "../retentionSchema";

const valid = {
  category: "tax",
  retentionDate: "2026-07-31",
  amount: 5000,
  description: "",
  reference: "",
};

describe("retentionSchema", () => {
  it("acepta valores validos", () => {
    expect(retentionSchema.safeParse(valid).success).toBe(true);
  });

  it("acepta las cuatro categorias", () => {
    for (const category of ["tax", "tag", "accountant", "savings"]) {
      expect(
        retentionSchema.safeParse({ ...valid, category }).success,
      ).toBe(true);
    }
  });

  it("rechaza categoria invalida", () => {
    expect(
      retentionSchema.safeParse({ ...valid, category: "otra" }).success,
    ).toBe(false);
  });

  it("rechaza monto cero o negativo", () => {
    expect(
      retentionSchema.safeParse({ ...valid, amount: 0 }).success,
    ).toBe(false);
    expect(
      retentionSchema.safeParse({ ...valid, amount: -1 }).success,
    ).toBe(false);
  });

  it("rechaza fecha invalida", () => {
    expect(
      retentionSchema.safeParse({ ...valid, retentionDate: "01-01-2026" })
        .success,
    ).toBe(false);
    expect(
      retentionSchema.safeParse({ ...valid, retentionDate: "2026-02-30" })
        .success,
    ).toBe(false);
  });
});
