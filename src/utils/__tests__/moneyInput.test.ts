import { formatMoneyInput, parseMoneyInput } from "../moneyInput";

describe("parseMoneyInput", () => {
  it("parsea numeros enteros", () => {
    expect(parseMoneyInput("1500")).toBe(1500);
    expect(parseMoneyInput("0")).toBe(0);
    expect(parseMoneyInput("900981")).toBe(900981);
  });

  it("quita separadores de miles validos", () => {
    expect(parseMoneyInput("1.500")).toBe(1500);
    expect(parseMoneyInput("1.500.750")).toBe(1500750);
    expect(parseMoneyInput("1,500")).toBe(1500);
  });

  it("descarta centavos en lugar de mezclarlos", () => {
    expect(parseMoneyInput("1500.50")).toBe(1500);
    expect(parseMoneyInput("1500,50")).toBe(1500);
    expect(parseMoneyInput("1.500,75")).toBe(1500);
    expect(parseMoneyInput("123.45")).toBe(123);
  });

  it("retorna 0 para entradas no numericas", () => {
    expect(parseMoneyInput("")).toBe(0);
    expect(parseMoneyInput("abc")).toBe(0);
    expect(parseMoneyInput("   ")).toBe(0);
  });
});

describe("formatMoneyInput", () => {
  it("formatea con separador de miles", () => {
    expect(formatMoneyInput(1234567)).toBe("1.234.567");
    expect(formatMoneyInput(1000)).toBe("1.000");
    expect(formatMoneyInput(900981)).toBe("900.981");
  });

  it("retorna vacio para cero", () => {
    expect(formatMoneyInput(0)).toBe("");
  });
});
