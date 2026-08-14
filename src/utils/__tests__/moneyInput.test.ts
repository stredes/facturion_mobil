import {
  formatMoneyInput,
  parseMoneyInput,
  sanitizeMoneyText,
} from "../moneyInput";

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

describe("sanitizeMoneyText", () => {
  it("agrupa miles mientras se escribe", () => {
    expect(sanitizeMoneyText("1500")).toEqual({ text: "1.500", value: 1500 });
    expect(sanitizeMoneyText("1500000")).toEqual({
      text: "1.500.000",
      value: 1500000,
    });
  });

  it("no corrompe el monto al borrar un digito de un valor agrupado", () => {
    expect(sanitizeMoneyText("1.50")).toEqual({ text: "150", value: 150 });
    expect(sanitizeMoneyText("1.")).toEqual({ text: "1", value: 1 });
    expect(sanitizeMoneyText("1.500.00")).toEqual({
      text: "150.000",
      value: 150000,
    });
  });

  it("descarta caracteres no numericos y negativos", () => {
    expect(sanitizeMoneyText("-1500")).toEqual({ text: "1.500", value: 1500 });
    expect(sanitizeMoneyText("abc123")).toEqual({ text: "123", value: 123 });
  });

  it("retorna vacio y cero al limpiar el campo", () => {
    expect(sanitizeMoneyText("")).toEqual({ text: "", value: 0 });
    expect(sanitizeMoneyText("   ")).toEqual({ text: "", value: 0 });
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
