export function validateMoney(
  value: number,
  fieldName = "Monto",
): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(
      `${fieldName} debe ser un numero entero mayor o igual a cero`,
    );
  }
}
