import type { Invoice } from "../domain/Invoice";

export interface MonthlyChartSummary {
  period: string;
  invoiceCount: number;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export function buildMonthlyChartSummaries(
  invoices: Invoice[],
  limit = 6,
): MonthlyChartSummary[] {
  const periods = new Map<string, MonthlyChartSummary>();

  for (const invoice of invoices) {
    const period = invoice.invoiceDate.slice(0, 7);
    const current = periods.get(period) ?? {
      period,
      invoiceCount: 0,
      netAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
    };

    current.invoiceCount += 1;
    current.netAmount += invoice.netAmount;
    current.taxAmount += invoice.taxAmount;
    current.totalAmount += invoice.totalAmount;
    if (invoice.status === "paid") current.paidAmount += invoice.totalAmount;
    else current.pendingAmount += invoice.totalAmount;
    periods.set(period, current);
  }

  return Array.from(periods.values())
    .sort((left, right) => left.period.localeCompare(right.period))
    .slice(-limit);
}
