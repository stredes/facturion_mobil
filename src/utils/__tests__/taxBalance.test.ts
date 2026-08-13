import type { Invoice } from "../../domain/Invoice";
import type { TaxPayment } from "../../domain/TaxPayment";
import { buildMonthlyTaxBalances, calculateTaxBalance } from "../taxBalance";

describe("tax balance", () => {
  it("is total invoice tax minus payments from the IVA section", () => {
    const invoices = [
      { taxAmount: 171186 },
      { taxAmount: 112008 },
    ] as Invoice[];
    const payments = [{ amount: 150886 }] as TaxPayment[];

    expect(calculateTaxBalance(invoices, payments)).toEqual({
      totalTax: 283194,
      paidTax: 150886,
      balance: 132308,
      overpaid: false,
    });
  });

  it("does not depend on invoice payment status or retentions", () => {
    const invoices = [
      { taxAmount: 100, status: "pending" },
      { taxAmount: 200, status: "paid" },
    ] as Invoice[];

    expect(calculateTaxBalance(invoices, [])).toMatchObject({
      totalTax: 300,
      paidTax: 0,
      balance: 300,
    });
  });

  it("builds the cumulative three-line series used by the historical chart", () => {
    const invoices = [
      { invoiceDate: "2026-03-29", taxAmount: 100 },
      { invoiceDate: "2026-04-05", taxAmount: 200 },
    ] as Invoice[];
    const payments = [
      { paymentDate: "2026-04-20", amount: 50 },
    ] as TaxPayment[];

    expect(buildMonthlyTaxBalances(invoices, payments)).toEqual([
      { period: "2026-03", generatedTax: 100, paidTax: 0, balance: 100 },
      { period: "2026-04", generatedTax: 300, paidTax: 50, balance: 250 },
    ]);
  });
});
