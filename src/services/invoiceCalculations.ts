export function calculateTax(netAmount: number): number {
  return Math.round(netAmount * 0.19);
}

export function calculateInvoiceTotal(
  netAmount: number,
  taxAmount: number,
): number {
  return netAmount + taxAmount;
}

export function calculateAllocatedAmount(input: {
  taxPayment: number;
  tagAmount: number;
  accountantAmount: number;
  savingsAmount: number;
}): number {
  return (
    input.taxPayment +
    input.tagAmount +
    input.accountantAmount +
    input.savingsAmount
  );
}

export function calculateRemainingAmount(input: {
  totalAmount: number;
  taxPayment: number;
  tagAmount: number;
  accountantAmount: number;
  savingsAmount: number;
}): number {
  return (
    input.totalAmount -
    input.taxPayment -
    input.tagAmount -
    input.accountantAmount -
    input.savingsAmount
  );
}
