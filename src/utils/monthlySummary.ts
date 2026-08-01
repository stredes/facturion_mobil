import type { MonthlyInvoiceSummary } from "../domain/Invoice";

export interface GeneralPaymentMonthSummary {
  period: string;
  tagAmount: number;
  accountantAmount: number;
  savingsAmount: number;
  totalGeneralPayments: number;
}

export interface TaxPaymentMonthSummary {
  period: string;
  paidTax: number;
}

export interface CombinedMonth {
  period: string;
  invoiceCount: number;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  tagAmount: number;
  accountantAmount: number;
  savingsAmount: number;
  paidTax: number;
  vatReserve: number;
  vatReserveOverpaid: boolean;
}

export function combineMonthlySummaries(
  invoiceMonths: MonthlyInvoiceSummary[],
  generalPaymentMonths: GeneralPaymentMonthSummary[],
  taxPaymentMonths: TaxPaymentMonthSummary[],
): CombinedMonth[] {
  const generalByPeriod = new Map(
    generalPaymentMonths.map((month) => [month.period, month]),
  );
  const taxByPeriod = new Map(
    taxPaymentMonths.map((month) => [month.period, month]),
  );
  const periods = collectPeriods(invoiceMonths, generalPaymentMonths, taxPaymentMonths);

  return Array.from(periods)
    .map((period) => buildCombinedMonth(period, invoiceMonths, generalByPeriod, taxByPeriod))
    .sort((a, b) => b.period.localeCompare(a.period));
}

function collectPeriods(
  invoiceMonths: MonthlyInvoiceSummary[],
  generalPaymentMonths: GeneralPaymentMonthSummary[],
  taxPaymentMonths: TaxPaymentMonthSummary[],
): Set<string> {
  const periods = new Set<string>();
  invoiceMonths.forEach((month) => periods.add(month.period));
  generalPaymentMonths.forEach((month) => periods.add(month.period));
  taxPaymentMonths.forEach((month) => periods.add(month.period));
  return periods;
}

function buildCombinedMonth(
  period: string,
  invoiceMonths: MonthlyInvoiceSummary[],
  generalByPeriod: Map<string, GeneralPaymentMonthSummary>,
  taxByPeriod: Map<string, TaxPaymentMonthSummary>,
): CombinedMonth {
  const invoice = invoiceMonths.find((month) => month.period === period);
  const general = generalByPeriod.get(period);
  const tax = taxByPeriod.get(period);
  const generatedTax = invoice?.taxAmount ?? 0;
  const paidTax = tax?.paidTax ?? 0;
  const vatDifference = generatedTax - paidTax;

  return {
    period,
    invoiceCount: invoice?.invoiceCount ?? 0,
    netAmount: invoice?.netAmount ?? 0,
    taxAmount: generatedTax,
    totalAmount: invoice?.totalAmount ?? 0,
    tagAmount: general?.tagAmount ?? 0,
    accountantAmount: general?.accountantAmount ?? 0,
    savingsAmount: general?.savingsAmount ?? 0,
    paidTax,
    vatReserve: vatDifference > 0 ? vatDifference : 0,
    vatReserveOverpaid: vatDifference < 0,
  };
}
