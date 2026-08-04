import { formatCurrency, formatCurrencyCompact } from "../currency";

describe("formatCurrency", () => {
  it("formatea montos en pesos chilenos sin decimales", () => {
    expect(formatCurrency(1500)).toBe("$1.500");
    expect(formatCurrency(1234567)).toBe("$1.234.567");
    expect(formatCurrency(0)).toBe("$0");
  });

  it("redondea decimales", () => {
    expect(formatCurrency(1234567.8)).toBe("$1.234.568");
  });
});

describe("formatCurrencyCompact", () => {
  it("usa el formato exacto bajo el millon", () => {
    expect(formatCurrencyCompact(500)).toBe("$500");
    expect(formatCurrencyCompact(999999)).toBe("$999.999");
    expect(formatCurrencyCompact(0)).toBe("$0");
  });

  it("abrevia en millones (M) desde un millon", () => {
    expect(formatCurrencyCompact(1_000_000)).toBe("$1 M");
    expect(formatCurrencyCompact(1_234_567)).toBe("$1,23 M");
    expect(formatCurrencyCompact(1_500_000_000)).toBe("$1.500 M");
  });

  it("abrevia en billones (B) desde 10^12", () => {
    expect(formatCurrencyCompact(1_000_000_000_000)).toBe("$1 B");
    expect(formatCurrencyCompact(1_500_000_000_000)).toBe("$1,5 B");
    expect(formatCurrencyCompact(12_345_678_901_234)).toBe("$12,34 B");
  });

  it("trunca en lugar de redondear para no alterar el dato real", () => {
    expect(formatCurrencyCompact(1_236_000)).toBe("$1,23 M");
    expect(formatCurrencyCompact(1_236_999)).toBe("$1,23 M");
    expect(formatCurrencyCompact(12_355_000_000_000)).toBe("$12,35 B");
    expect(formatCurrencyCompact(12_356_000_000_000)).toBe("$12,35 B");
  });

  it("maneja montos negativos", () => {
    expect(formatCurrencyCompact(-1_236_000)).toBe("-$1,23 M");
    expect(formatCurrencyCompact(-999_999)).toBe("$-999.999");
  });

  it("no excede 14 caracteres ni siquiera para montos extremos", () => {
    const extremes = [
      999_999,
      1_000_000,
      123_456_789,
      999_999_999_999,
      1_000_000_000_000,
      12_345_678_901_234,
      999_999_999_999_999,
      1_000_000_000_000_000_000,
    ];
    for (const amount of extremes) {
      expect(formatCurrencyCompact(amount).length).toBeLessThanOrEqual(14);
    }
  });
});
