import {
  calculateInvoiceTotal,
  calculateTax,
} from "../invoiceCalculations";

describe("calculateTax", () => {
  it("calcula el 19% del monto", () => {
    expect(calculateTax(1000)).toBe(190);
    expect(calculateTax(100)).toBe(19);
  });

  it("redondea al entero mas cercano", () => {
    expect(calculateTax(1)).toBe(0);
    expect(calculateTax(3)).toBe(1);
    expect(calculateTax(900981)).toBe(171186);
  });

  it("maneja cero", () => {
    expect(calculateTax(0)).toBe(0);
  });
});

describe("calculateInvoiceTotal", () => {
  it("suma neto mas IVA", () => {
    expect(calculateInvoiceTotal(1000, 190)).toBe(1190);
    expect(calculateInvoiceTotal(0, 0)).toBe(0);
  });
});
