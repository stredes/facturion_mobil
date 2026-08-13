import {
  calculateDashboardFundBalances,
  EXTRA_PAYMENT_BALANCE_CATEGORIES,
} from "../dashboardCategories";

describe("dashboard balance categories", () => {
  it("does not expose savings as an IVA balance in extra payments", () => {
    expect(EXTRA_PAYMENT_BALANCE_CATEGORIES.map(({ value }) => value)).toEqual([
      "tag",
      "accountant",
    ]);
  });

  it("adds a savings retention only to the savings balance", () => {
    expect(
      calculateDashboardFundBalances({
        invoiceTag: 0,
        invoiceAccountant: 0,
        invoiceSavings: 0,
        retentionTag: 0,
        retentionAccountant: 0,
        retentionSavings: 100_000,
        paidTag: 0,
        paidAccountant: 0,
        paidSavings: 0,
      }),
    ).toEqual({
      tag: 0,
      accountant: 0,
      savings: 100_000,
    });
  });
});
