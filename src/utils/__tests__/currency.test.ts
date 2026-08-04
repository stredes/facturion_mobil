import { formatCurrency } from "../currency";

describe("formatCurrency", () => {
  it("formatea montos en pesos chilenos sin decimales", () => {
    expect(formatCurrency(1500)).toBe("$1.500");
    expect(formatCurrency(1234567)).toBe("$1.234.567");
    expect(formatCurrency(0)).toBe("$0");
  });

  it("redondea decimales", () => {
    expect(formatCurrency(1234567.8)).toBe("$1.234.568");
  });

  it("mantiene el dato real completo sin abreviar", () => {
    expect(formatCurrency(1_000_000)).toBe("$1.000.000");
    expect(formatCurrency(12_345_678_901_234)).toBe("$12.345.678.901.234");
  });
});
