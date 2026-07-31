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
