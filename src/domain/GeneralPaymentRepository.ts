import type {
  CreateGeneralPaymentInput,
  GeneralPayment,
  GeneralPaymentFilters,
  GeneralPaymentSummary,
  UpdateGeneralPaymentInput,
} from "./GeneralPayment";

export interface GeneralPaymentRepository {
  create(input: CreateGeneralPaymentInput): Promise<GeneralPayment>;
  update(id: string, input: UpdateGeneralPaymentInput): Promise<GeneralPayment>;
  findById(id: string): Promise<GeneralPayment | null>;
  findAll(filters?: GeneralPaymentFilters): Promise<GeneralPayment[]>;
  delete(id: string): Promise<void>;
  getSummary(): Promise<GeneralPaymentSummary>;
  getMonthlySummary(): Promise<
    { period: string; tagAmount: number; accountantAmount: number; savingsAmount: number; totalGeneralPayments: number }[]
  >;
  findRecent(limit: number): Promise<GeneralPayment[]>;
}
