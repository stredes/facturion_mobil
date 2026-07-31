import { generalPaymentSchema } from "../generalPaymentSchema";

const valid = {
  category: "tag",
  paymentDate: "2026-07-31",
  amount: 5000,
  description: "",
  reference: "",
};

describe("generalPaymentSchema", () => {
  it("acepta valores validos", () => {
    expect(generalPaymentSchema.safeParse(valid).success).toBe(true);
  });

  it("acepta las tres categorias", () => {
    for (const category of ["tag", "accountant", "savings"]) {
      expect(
        generalPaymentSchema.safeParse({ ...valid, category }).success,
      ).toBe(true);
    }
  });

  it("rechaza categoria invalida", () => {
    expect(
      generalPaymentSchema.safeParse({ ...valid, category: "otra" }).success,
    ).toBe(false);
  });

  it("rechaza monto cero o negativo", () => {
    expect(
      generalPaymentSchema.safeParse({ ...valid, amount: 0 }).success,
    ).toBe(false);
    expect(
      generalPaymentSchema.safeParse({ ...valid, amount: -1 }).success,
    ).toBe(false);
  });

  it("rechaza fecha invalida", () => {
    expect(
      generalPaymentSchema.safeParse({ ...valid, paymentDate: "01-01-2026" })
        .success,
    ).toBe(false);
    expect(
      generalPaymentSchema.safeParse({ ...valid, paymentDate: "2026-02-30" })
        .success,
    ).toBe(false);
  });
});
