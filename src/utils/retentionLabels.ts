import type { RetentionCategory } from "../domain/Retention";

export const RETENTION_CATEGORIES: {
  value: RetentionCategory;
  label: string;
}[] = [
  { value: "tax", label: "IVA" },
  { value: "tag", label: "TAG" },
  { value: "accountant", label: "Contador" },
  { value: "savings", label: "Ahorro" },
];

export function formatRetentionCategoryLabel(
  category: RetentionCategory,
): string {
  return (
    RETENTION_CATEGORIES.find((c) => c.value === category)?.label ?? category
  );
}
