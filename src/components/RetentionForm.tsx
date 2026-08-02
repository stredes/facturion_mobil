import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

import type { CreateRetentionInput } from "../domain/Retention";
import { retentionSchema } from "../schemas/retentionSchema";
import type { RetentionFormValues } from "../schemas/retentionSchema";
import { colors, spacing, typography } from "../theme";
import { toISODate } from "../utils/dates";
import { RETENTION_CATEGORIES } from "../utils/retentionLabels";
import { FilterChip } from "./FilterChip";
import { DateField } from "./form/DateField";
import { FormScaffold } from "./form/FormScaffold";
import { MoneyField } from "./form/MoneyField";
import { TextField } from "./form/TextField";
import { useFormWithReset } from "./form/useFormWithReset";

interface RetentionFormProps {
  initialValues?: Partial<CreateRetentionInput>;
  submitLabel: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (input: CreateRetentionInput) => Promise<void>;
}

function buildDefaultValues(
  initialValues?: Partial<CreateRetentionInput>,
): RetentionFormValues {
  return {
    category: initialValues?.category ?? "tax",
    retentionDate: initialValues?.retentionDate ?? toISODate(new Date()),
    amount: initialValues?.amount ?? 0,
    description: initialValues?.description ?? "",
    reference: initialValues?.reference ?? "",
  };
}

export function RetentionForm({
  initialValues,
  submitLabel,
  isSubmitting = false,
  submitError,
  onSubmit,
}: RetentionFormProps) {
  const defaultValues = useMemo(
    () => buildDefaultValues(initialValues),
    [initialValues],
  );
  const {
    control,
    handleSubmit,
    formState: { isSubmitting: isFormSubmitting },
  } = useFormWithReset<RetentionFormValues>(defaultValues, {
    resolver: zodResolver(retentionSchema),
  });

  const isBusy = isSubmitting || isFormSubmitting;

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      category: values.category,
      retentionDate: values.retentionDate,
      amount: values.amount,
      description: values.description?.trim() || undefined,
      reference: values.reference?.trim() || undefined,
    });
  });

  return (
    <FormScaffold
      isSubmitting={isBusy}
      onSubmit={submit}
      submitError={submitError}
      submitLabel={submitLabel}
    >
      <Text style={styles.sectionTitle}>Categoria</Text>
      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <View style={styles.chips}>
            {RETENTION_CATEGORIES.map((category) => (
              <FilterChip
                key={category.value}
                label={category.label}
                selected={value === category.value}
                onPress={() => onChange(category.value)}
              />
            ))}
          </View>
        )}
      />

      <DateField control={control} name="retentionDate" label="Fecha" />
      <MoneyField control={control} name="amount" label="Monto" />
      <TextField
        control={control}
        name="description"
        label="Descripcion"
        multiline
      />
      <TextField
        control={control}
        name="reference"
        label="Referencia"
        placeholder="Opcional"
      />
    </FormScaffold>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.text.primary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
