export type GeneralPaymentCategory = "tag" | "accountant" | "savings";

export interface GeneralPayment {
  id: string;
  category: GeneralPaymentCategory;
  paymentDate: string;
  amount: number;
  description: string | null;
  reference: string | null;
  sourceInvoiceId: string | null;
  sourceType: "manual" | "migrated";
  createdAt: string;
  updatedAt: string;
}

export interface CreateGeneralPaymentInput {
  category: GeneralPaymentCategory;
  paymentDate: string;
  amount: number;
  description?: string;
  reference?: string;
}

export interface UpdateGeneralPaymentInput {
  category: GeneralPaymentCategory;
  paymentDate: string;
  amount: number;
  description?: string | null;
  reference?: string | null;
}

export interface GeneralPaymentFilters {
  category?: GeneralPaymentCategory;
  month?: string;
  year?: string;
  searchText?: string;
}

export interface GeneralPaymentSummary {
  totalTag: number;
  totalAccountant: number;
  totalSavings: number;
  totalGeneralPayments: number;
}
