import type {
  CreateRetentionInput,
  Retention,
  RetentionFilters,
  RetentionSummary,
  UpdateRetentionInput,
} from "./Retention";

export interface RetentionRepository {
  create(input: CreateRetentionInput): Promise<Retention>;
  update(id: string, input: UpdateRetentionInput): Promise<Retention>;
  findById(id: string): Promise<Retention | null>;
  findAll(filters?: RetentionFilters): Promise<Retention[]>;
  delete(id: string): Promise<void>;
  getSummary(): Promise<RetentionSummary>;
  getMonthlySummary(): Promise<
    {
      period: string;
      taxAmount: number;
      tagAmount: number;
      accountantAmount: number;
      savingsAmount: number;
      totalRetentions: number;
    }[]
  >;
  findRecent(limit: number): Promise<Retention[]>;
}
