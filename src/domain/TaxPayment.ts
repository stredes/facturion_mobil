export interface TaxPayment {
  id: string;
  taxPeriod: string;
  paymentDate: string;
  amount: number;
  description: string | null;
  reference: string | null;
  sourceInvoiceId: string | null;
  sourceType: "manual" | "migrated";
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaxPaymentInput {
  taxPeriod: string;
  paymentDate: string;
  amount: number;
  description?: string;
  reference?: string;
}

export interface UpdateTaxPaymentInput {
  taxPeriod: string;
  paymentDate: string;
  amount: number;
  description?: string | null;
  reference?: string | null;
}

export interface TaxPaymentFilters {
  taxPeriod?: string;
  year?: string;
}

export interface TaxPeriodSummary {
  period: string;
  generatedTax: number;
  paidTax: number;
  difference: number;
}
