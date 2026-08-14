const GROUPING_PATTERN = /^\d{1,3}(?:[.,]\d{3})+$/;

export function parseMoneyInput(raw: string): number {
  const text = raw.trim();
  if (!text) {
    return 0;
  }

  const normalized = GROUPING_PATTERN.test(text)
    ? text.replace(/[.,]/g, "")
    : text.replace(/[.,]\d{1,2}$/, "").replace(/[^\d]/g, "");

  const parsed = parseInt(normalized, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatMoneyInput(value: number): string {
  if (!value) {
    return "";
  }

  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Normaliza el texto tal como lo escribe el usuario en vivo: solo digitos,
 * con separadores de miles agrupados de a 3. Descarta cualquier otro
 * caracter (incluido el signo "-"), por lo que el borrado de un digito de
 * un valor agrupado ("1.500" -> "1.50" -> 150) nunca corrompe el monto.
 */
export function sanitizeMoneyText(raw: string): {
  text: string;
  value: number;
} {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) {
    return { text: "", value: 0 };
  }

  const value = parseInt(digits, 10);
  return { text: formatMoneyInput(value), value };
}
