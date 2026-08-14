import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

import type { CreateGeneralPaymentInput } from "../domain/GeneralPayment";
import { generalPaymentSchema } from "../schemas/generalPaymentSchema";
import type { GeneralPaymentFormValues } from "../schemas/generalPaymentSchema";
import { spacing, typography, useThemeColors, type Colors } from "../theme";
import { toISODate } from "../utils/dates";
import { FilterChip } from "./FilterChip";
import { DateField } from "./form/DateField";
import { FormScaffold } from "./form/FormScaffold";
import { MoneyField } from "./form/MoneyField";
import { TextField } from "./form/TextField";
import { useFormWithReset } from "./form/useFormWithReset";

const CATEGORIES = [
  { value: "tag" as const, label: "TAG" },
  { value: "accountant" as const, label: "Contador" },
  { value: "savings" as const, label: "Ahorro" },
];

interface GeneralPaymentFormProps {
  initialValues?: Partial<CreateGeneralPaymentInput>;
  submitLabel: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (input: CreateGeneralPaymentInput) => Promise<void>;
  title?: string;
  subtitle?: string;
  cancelLabel?: string;
  onCancel?: () => void;
}

function buildDefaultValues(
  initialValues?: Partial<CreateGeneralPaymentInput>,
): GeneralPaymentFormValues {
  return {
    category: initialValues?.category ?? "tag",
    paymentDate: initialValues?.paymentDate ?? toISODate(new Date()),
    amount: initialValues?.amount ?? 0,
    description: initialValues?.description ?? "",
    reference: initialValues?.reference ?? "",
  };
}

export function GeneralPaymentForm({
  initialValues,
  submitLabel,
  isSubmitting = false,
  submitError,
  onSubmit,
  title,
  subtitle,
  cancelLabel,
  onCancel,
}: GeneralPaymentFormProps) {
  const defaultValues = useMemo(
    () => buildDefaultValues(initialValues),
    [initialValues],
  );
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    control,
    handleSubmit,
    trigger,
    formState: { isSubmitting: isFormSubmitting },
  } = useFormWithReset<GeneralPaymentFormValues>(defaultValues, {
    resolver: zodResolver(generalPaymentSchema),
  });

  const isBusy = isSubmitting || isFormSubmitting;

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      category: values.category,
      paymentDate: values.paymentDate,
      amount: values.amount,
      description: values.description?.trim() || undefined,
      reference: values.reference?.trim() || undefined,
    });
  });

  return (
    <FormScaffold
      control={control}
      isSubmitting={isBusy}
      onSubmit={submit}
      submitError={submitError}
      submitLabel={submitLabel}
      title={title}
      subtitle={subtitle}
      cancelLabel={cancelLabel}
      onCancel={onCancel}
      trigger={trigger}
    >
      <Text
        accessibilityRole="header"
        style={styles.sectionTitle}
      >
        Categoria
      </Text>
      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <View style={styles.chips}>
            {CATEGORIES.map((category) => (
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

      <DateField control={control} name="paymentDate" label="Fecha de pago" />
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

const createStyles = (c: Colors) =>
  StyleSheet.create({
    sectionTitle: {
      ...typography.sectionTitle,
      color: c.text.primary,
    },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
  });
