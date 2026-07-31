import { validateMoney } from "../money";

describe("validateMoney", () => {
  it("acepta enteros positivos y cero", () => {
    expect(() => validateMoney(0)).not.toThrow();
    expect(() => validateMoney(12345)).not.toThrow();
  });

  it("rechaza montos negativos", () => {
    expect(() => validateMoney(-1)).toThrow("entero mayor o igual a cero");
  });

  it("rechaza decimales", () => {
    expect(() => validateMoney(10.5)).toThrow();
  });

  it("rechaza NaN e Infinity", () => {
    expect(() => validateMoney(NaN)).toThrow();
    expect(() => validateMoney(Infinity)).toThrow();
  });

  it("incluye el nombre del campo en el mensaje", () => {
    expect(() => validateMoney(-5, "Neto")).toThrow("Neto");
  });
});
