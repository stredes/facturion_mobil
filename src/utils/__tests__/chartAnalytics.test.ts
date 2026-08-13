import type { Invoice } from "../../domain/Invoice";
import { buildMonthlyChartSummaries } from "../chartAnalytics";

describe("chart analytics", () => {
  it("groups invoicing and collection status into three-series monthly views", () => {
    const invoices = [
      {
        invoiceDate: "2026-04-01",
        netAmount: 100,
        taxAmount: 19,
        totalAmount: 119,
        status: "paid",
      },
      {
        invoiceDate: "2026-04-20",
        netAmount: 200,
        taxAmount: 38,
        totalAmount: 238,
        status: "pending",
      },
    ] as Invoice[];

    expect(buildMonthlyChartSummaries(invoices)).toEqual([
      {
        period: "2026-04",
        invoiceCount: 2,
        netAmount: 300,
        taxAmount: 57,
        totalAmount: 357,
        paidAmount: 119,
        pendingAmount: 238,
      },
    ]);
  });
});
