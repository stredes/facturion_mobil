import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceFilters,
  InvoiceSummary,
  MonthlyInvoiceSummary,
} from "../domain/Invoice";
import type { InvoiceRepository } from "../domain/InvoiceRepository";

export class InvoiceService {
  constructor(private readonly repository: InvoiceRepository) {}

  async create(input: CreateInvoiceInput): Promise<Invoice> {
    return this.repository.create(input);
  }

  async update(id: string, input: CreateInvoiceInput): Promise<Invoice> {
    return this.repository.update(id, input);
  }

  async getById(id: string): Promise<Invoice | null> {
    return this.repository.findById(id);
  }

  async getAll(filters?: InvoiceFilters): Promise<Invoice[]> {
    const all = filters?.searchText
      ? await this.repository.search(filters.searchText)
      : await this.repository.findAll();

    if (!filters) {
      return all;
    }

    return all.filter((invoice) => {
      const month = filters.month?.padStart(2, "0");
      const year = filters.year;

      if (month && invoice.invoiceDate.slice(5, 7) !== month) {
        return false;
      }

      if (year && invoice.invoiceDate.slice(0, 4) !== year) {
        return false;
      }

      return true;
    });
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async existsByInvoiceNumber(
    invoiceNumber: string,
    excludedId?: string,
  ): Promise<boolean> {
    return this.repository.existsByInvoiceNumber(invoiceNumber, excludedId);
  }

  async getSummary(): Promise<InvoiceSummary> {
    return this.repository.getSummary();
  }

  async getMonthlySummary(): Promise<MonthlyInvoiceSummary[]> {
    return this.repository.getMonthlySummary();
  }
}
