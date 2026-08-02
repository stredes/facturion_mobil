export type RetentionCategory = "tax" | "tag" | "accountant" | "savings";

export interface Retention {
  id: string;
  category: RetentionCategory;
  retentionDate: string;
  amount: number;
  description: string | null;
  reference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRetentionInput {
  category: RetentionCategory;
  retentionDate: string;
  amount: number;
  description?: string;
  reference?: string;
}

export interface UpdateRetentionInput {
  category: RetentionCategory;
  retentionDate: string;
  amount: number;
  description?: string | null;
  reference?: string | null;
}

export interface RetentionFilters {
  category?: RetentionCategory;
  month?: string;
  year?: string;
  searchText?: string;
}

export interface RetentionSummary {
  totalTax: number;
  totalTag: number;
  totalAccountant: number;
  totalSavings: number;
  totalRetentions: number;
}
