import { invoiceSchema } from "../invoiceSchema";

const valid = {
  invoiceNumber: "FAC-001",
  invoiceDate: "2026-07-31",
  clientName: "Cliente",
  description: "",
  netAmount: 1000,
};

describe("invoiceSchema", () => {
  it("acepta valores validos", () => {
    expect(invoiceSchema.safeParse(valid).success).toBe(true);
  });

  it("rechaza monto cero o negativo", () => {
    expect(
      invoiceSchema.safeParse({ ...valid, netAmount: 0 }).success,
    ).toBe(false);
    expect(
      invoiceSchema.safeParse({ ...valid, netAmount: -100 }).success,
    ).toBe(false);
  });

  it("rechaza montos decimales", () => {
    expect(
      invoiceSchema.safeParse({ ...valid, netAmount: 10.5 }).success,
    ).toBe(false);
  });

  it("rechaza fechas invalidas", () => {
    expect(
      invoiceSchema.safeParse({ ...valid, invoiceDate: "2026-13-40" }).success,
    ).toBe(false);
    expect(
      invoiceSchema.safeParse({ ...valid, invoiceDate: "31/07/2026" }).success,
    ).toBe(false);
  });

  it("rechaza numero de factura vacio", () => {
    expect(
      invoiceSchema.safeParse({ ...valid, invoiceNumber: "   " }).success,
    ).toBe(false);
  });
});
