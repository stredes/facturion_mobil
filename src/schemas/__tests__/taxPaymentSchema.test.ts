import { taxPaymentSchema } from "../taxPaymentSchema";

const valid = {
  taxPeriod: "2026-07",
  paymentDate: "2026-07-31",
  amount: 100000,
  description: "",
  reference: "",
};

describe("taxPaymentSchema", () => {
  it("acepta valores validos", () => {
    expect(taxPaymentSchema.safeParse(valid).success).toBe(true);
  });

  it("rechaza periodos invalidos", () => {
    expect(
      taxPaymentSchema.safeParse({ ...valid, taxPeriod: "2026-13" }).success,
    ).toBe(false);
    expect(
      taxPaymentSchema.safeParse({ ...valid, taxPeriod: "2026-00" }).success,
    ).toBe(false);
    expect(
      taxPaymentSchema.safeParse({ ...valid, taxPeriod: "2026-7" }).success,
    ).toBe(false);
    expect(
      taxPaymentSchema.safeParse({ ...valid, taxPeriod: "2026/07" }).success,
    ).toBe(false);
  });

  it("rechaza monto cero o negativo", () => {
    expect(
      taxPaymentSchema.safeParse({ ...valid, amount: 0 }).success,
    ).toBe(false);
    expect(
      taxPaymentSchema.safeParse({ ...valid, amount: -50 }).success,
    ).toBe(false);
  });

  it("rechaza fecha invalida", () => {
    expect(
      taxPaymentSchema.safeParse({ ...valid, paymentDate: "31/07/2026" })
        .success,
    ).toBe(false);
  });
});
