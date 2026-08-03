import type {
  CreateTaxPaymentInput,
  TaxPayment,
  TaxPaymentFilters,
  UpdateTaxPaymentInput,
} from "./TaxPayment";

export interface TaxPaymentRepository {
  create(input: CreateTaxPaymentInput): Promise<TaxPayment>;
  update(id: string, input: UpdateTaxPaymentInput): Promise<TaxPayment>;
  findById(id: string): Promise<TaxPayment | null>;
  findAll(filters?: TaxPaymentFilters): Promise<TaxPayment[]>;
  delete(id: string): Promise<void>;
  getTotalPaidTax(): Promise<number>;
  getMonthlySummary(): Promise<
    { period: string; paidTax: number }[]
  >;
}
