export const GENERAL_PAYMENT_CATEGORY_LABELS: Record<string, string> = {
  tag: "TAG",
  accountant: "Contador",
  savings: "Ahorro",
};

export function formatGeneralPaymentCategoryLabel(category: string): string {
  return GENERAL_PAYMENT_CATEGORY_LABELS[category] ?? category;
}