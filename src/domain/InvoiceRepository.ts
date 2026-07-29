import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceSummary,
  MonthlyInvoiceSummary,
} from "./Invoice";

export interface InvoiceRepository {
  create(input: CreateInvoiceInput): Promise<Invoice>;

  update(id: string, input: CreateInvoiceInput): Promise<Invoice>;

  findById(id: string): Promise<Invoice | null>;

  findAll(): Promise<Invoice[]>;

  search(searchText: string): Promise<Invoice[]>;

  delete(id: string): Promise<void>;

  existsByInvoiceNumber(
    invoiceNumber: string,
    excludedId?: string,
  ): Promise<boolean>;

  getSummary(): Promise<InvoiceSummary>;

  getMonthlySummary(): Promise<MonthlyInvoiceSummary[]>;
}
