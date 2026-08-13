import type { GeneralPaymentCategory } from "../domain/GeneralPayment";

export const EXTRA_PAYMENT_BALANCE_CATEGORIES: ReadonlyArray<{
  value: Exclude<GeneralPaymentCategory, "savings">;
  label: string;
}> = [
  { value: "tag", label: "TAG" },
  { value: "accountant", label: "Contador" },
];

interface DashboardFundBalanceInput {
  invoiceTag: number;
  invoiceAccountant: number;
  invoiceSavings: number;
  retentionTag: number;
  retentionAccountant: number;
  retentionSavings: number;
  paidTag: number;
  paidAccountant: number;
  paidSavings: number;
}

export function calculateDashboardFundBalances(
  input: DashboardFundBalanceInput,
): Record<GeneralPaymentCategory, number> {
  return {
    tag: input.invoiceTag + input.retentionTag - input.paidTag,
    accountant:
      input.invoiceAccountant +
      input.retentionAccountant -
      input.paidAccountant,
    savings:
      input.invoiceSavings + input.retentionSavings - input.paidSavings,
  };
}
