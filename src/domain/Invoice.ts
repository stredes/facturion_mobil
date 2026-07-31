export interface Invoice {
  id: string;

  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  description: string | null;

  netAmount: number;
  taxAmount: number;
  totalAmount: number;

  paymentDate: string | null;
  taxPayment: number;

  tagAmount: number;
  accountantAmount: number;
  savingsAmount: number;

  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceInput {
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  description?: string;
  netAmount: number;
}

export interface InvoiceSummary {
  invoiceCount: number;
  totalNetAmount: number;
  totalTaxAmount: number;
  totalInvoiceAmount: number;
}

export interface MonthlyInvoiceSummary {
  period: string;
  invoiceCount: number;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface InvoiceFilters {
  searchText?: string;
  month?: string;
  year?: string;
}
