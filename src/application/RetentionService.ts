import type {
  CreateRetentionInput,
  Retention,
  RetentionFilters,
  RetentionSummary,
  UpdateRetentionInput,
} from "../domain/Retention";
import type { RetentionRepository } from "../domain/RetentionRepository";

export class RetentionService {
  constructor(
    private readonly repository: RetentionRepository,
  ) {}

  async create(input: CreateRetentionInput): Promise<Retention> {
    return this.repository.create(input);
  }

  async update(
    id: string,
    input: UpdateRetentionInput,
  ): Promise<Retention> {
    return this.repository.update(id, input);
  }

  async getById(id: string): Promise<Retention | null> {
    return this.repository.findById(id);
  }

  async getAll(filters?: RetentionFilters): Promise<Retention[]> {
    return this.repository.findAll(filters);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async getSummary(): Promise<RetentionSummary> {
    return this.repository.getSummary();
  }

  async getMonthlySummary(): Promise<
    {
      period: string;
      taxAmount: number;
      tagAmount: number;
      accountantAmount: number;
      savingsAmount: number;
      totalRetentions: number;
    }[]
  > {
    return this.repository.getMonthlySummary();
  }
}
