const clpFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const clpNumberFormatter = new Intl.NumberFormat("es-CL", {
  maximumFractionDigits: 2,
});

const MILLION = 1_000_000;
const BILLION = 1_000_000_000_000;

export function formatCurrency(amount: number): string {
  return clpFormatter.format(amount);
}

function truncateToTwoDecimals(value: number): number {
  return Math.trunc(value * 100) / 100;
}

export function formatCurrencyCompact(amount: number): string {
  if (Math.abs(amount) < MILLION) {
    return formatCurrency(amount);
  }
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  if (abs >= BILLION) {
    return `${sign}$${clpNumberFormatter.format(
      truncateToTwoDecimals(abs / BILLION),
    )} B`;
  }
  return `${sign}$${clpNumberFormatter.format(
    truncateToTwoDecimals(abs / MILLION),
  )} M`;
}
