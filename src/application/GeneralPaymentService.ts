import type {
  CreateGeneralPaymentInput,
  GeneralPayment,
  GeneralPaymentFilters,
  GeneralPaymentSummary,
  UpdateGeneralPaymentInput,
} from "../domain/GeneralPayment";
import type { GeneralPaymentRepository } from "../domain/GeneralPaymentRepository";

export class GeneralPaymentService {
  constructor(
    private readonly repository: GeneralPaymentRepository,
  ) {}

  async create(input: CreateGeneralPaymentInput): Promise<GeneralPayment> {
    return this.repository.create(input);
  }

  async update(
    id: string,
    input: UpdateGeneralPaymentInput,
  ): Promise<GeneralPayment> {
    return this.repository.update(id, input);
  }

  async getById(id: string): Promise<GeneralPayment | null> {
    return this.repository.findById(id);
  }

  async getAll(filters?: GeneralPaymentFilters): Promise<GeneralPayment[]> {
    return this.repository.findAll(filters);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async getSummary(): Promise<GeneralPaymentSummary> {
    return this.repository.getSummary();
  }

  async getMonthlySummary(): Promise<
    { period: string; tagAmount: number; accountantAmount: number; savingsAmount: number; totalGeneralPayments: number }[]
  > {
    return this.repository.getMonthlySummary();
  }
}
