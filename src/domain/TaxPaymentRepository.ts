import type {
  CreateTaxPaymentInput,
  TaxPayment,
  TaxPaymentFilters,
  TaxPeriodSummary,
  UpdateTaxPaymentInput,
} from "./TaxPayment";

export interface TaxPaymentRepository {
  create(input: CreateTaxPaymentInput): Promise<TaxPayment>;
  update(id: string, input: UpdateTaxPaymentInput): Promise<TaxPayment>;
  findById(id: string): Promise<TaxPayment | null>;
  findAll(filters?: TaxPaymentFilters): Promise<TaxPayment[]>;
  delete(id: string): Promise<void>;
  getTotalPaidTax(): Promise<number>;
  getPeriodSummary(period: string): Promise<TaxPeriodSummary>;
  getMonthlySummary(): Promise<
    { period: string; paidTax: number }[]
  >;
  findRecent(limit: number): Promise<TaxPayment[]>;
}
