import type { Invoice } from "../domain/Invoice";
import type { TaxPayment } from "../domain/TaxPayment";

export interface TaxBalance {
  totalTax: number;
  paidTax: number;
  balance: number;
  overpaid: boolean;
}

export interface MonthlyTaxBalance {
  period: string;
  generatedTax: number;
  paidTax: number;
  balance: number;
}

export function calculateTaxBalance(
  invoices: Invoice[],
  payments: TaxPayment[],
): TaxBalance {
  const totalTax = invoices.reduce((sum, invoice) => sum + invoice.taxAmount, 0);
  const paidTax = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balance = totalTax - paidTax;

  return { totalTax, paidTax, balance, overpaid: balance < 0 };
}

export function buildMonthlyTaxBalances(
  invoices: Invoice[],
  payments: TaxPayment[],
  limit = 6,
): MonthlyTaxBalance[] {
  const periods = new Map<string, { generated: number; paid: number }>();

  for (const invoice of invoices) {
    const period = invoice.invoiceDate.slice(0, 7);
    const current = periods.get(period) ?? { generated: 0, paid: 0 };
    current.generated += invoice.taxAmount;
    periods.set(period, current);
  }
  for (const payment of payments) {
    const period = payment.paymentDate.slice(0, 7);
    const current = periods.get(period) ?? { generated: 0, paid: 0 };
    current.paid += payment.amount;
    periods.set(period, current);
  }

  let generatedTax = 0;
  let paidTax = 0;
  return Array.from(periods.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([period, values]) => {
      generatedTax += values.generated;
      paidTax += values.paid;
      return {
        period,
        generatedTax,
        paidTax,
        balance: generatedTax - paidTax,
      };
    })
    .slice(-limit);
}
