import type {
  CreateTaxPaymentInput,
  TaxPayment,
  TaxPaymentFilters,
  UpdateTaxPaymentInput,
} from "../domain/TaxPayment";
import type { TaxPaymentRepository } from "../domain/TaxPaymentRepository";

export class TaxPaymentService {
  constructor(
    private readonly repository: TaxPaymentRepository,
  ) {}

  async create(input: CreateTaxPaymentInput): Promise<TaxPayment> {
    return this.repository.create(input);
  }

  async update(
    id: string,
    input: UpdateTaxPaymentInput,
  ): Promise<TaxPayment> {
    return this.repository.update(id, input);
  }

  async getById(id: string): Promise<TaxPayment | null> {
    return this.repository.findById(id);
  }

  async getAll(filters?: TaxPaymentFilters): Promise<TaxPayment[]> {
    return this.repository.findAll(filters);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async getTotalPaidTax(): Promise<number> {
    return this.repository.getTotalPaidTax();
  }

  async getMonthlySummary(): Promise<
    { period: string; paidTax: number }[]
  > {
    return this.repository.getMonthlySummary();
  }
}
