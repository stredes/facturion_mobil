import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { CreateTaxPaymentInput } from "../domain/TaxPayment";
import type { TaxPaymentFormValues } from "../schemas/taxPaymentSchema";
import { taxPaymentSchema } from "../schemas/taxPaymentSchema";
import { colors, radius, spacing, typography } from "../theme";
import { toISODate } from "../utils/dates";
import { AnimatedPressable } from "./AnimatedPressable";
import { DateInput } from "./DateInput";
import { MoneyInput } from "./MoneyInput";
import { TextInputField } from "./TextInputField";

interface TaxPaymentFormProps {
  initialValues?: Partial<CreateTaxPaymentInput>;
  submitLabel: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (input: CreateTaxPaymentInput) => Promise<void>;
}

function buildDefaultValues(
  initialValues?: Partial<CreateTaxPaymentInput>,
): TaxPaymentFormValues {
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return {
    taxPeriod: initialValues?.taxPeriod ?? currentPeriod,
    paymentDate: initialValues?.paymentDate ?? toISODate(now),
    amount: initialValues?.amount ?? 0,
    description: initialValues?.description ?? "",
    reference: initialValues?.reference ?? "",
  };
}

export function TaxPaymentForm({
  initialValues,
  submitLabel,
  isSubmitting = false,
  submitError,
  onSubmit,
}: TaxPaymentFormProps) {
  const defaultValues = useMemo(
    () => buildDefaultValues(initialValues),
    [initialValues],
  );
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<TaxPaymentFormValues>({
    defaultValues,
    resolver: zodResolver(taxPaymentSchema),
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const isBusy = isSubmitting || isFormSubmitting;

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      taxPeriod: values.taxPeriod,
      paymentDate: values.paymentDate,
      amount: values.amount,
      description: values.description?.trim() || undefined,
      reference: values.reference?.trim() || undefined,
    });
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", default: undefined })}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Controller
          control={control}
          name="taxPeriod"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextInputField
              error={errors.taxPeriod?.message}
              keyboardType="numbers-and-punctuation"
              label="Periodo (AAAA-MM)"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="AAAA-MM"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="paymentDate"
          render={({ field: { onBlur, onChange, value } }) => (
            <DateInput
              error={errors.paymentDate?.message}
              label="Fecha de pago"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, value } }) => (
            <MoneyInput
              error={errors.amount?.message}
              label="Monto pagado"
              onChangeValue={onChange}
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextInputField
              error={errors.description?.message}
              label="Descripcion"
              multiline
              onBlur={onBlur}
              onChangeText={onChange}
              value={value ?? ""}
            />
          )}
        />

        <Controller
          control={control}
          name="reference"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextInputField
              error={errors.reference?.message}
              label="Referencia"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Opcional"
              value={value ?? ""}
            />
          )}
        />

        {submitError ? (
          <View style={styles.submitErrorBox}>
            <Text style={styles.submitErrorText}>{submitError}</Text>
          </View>
        ) : null}

        <View style={styles.footerSpacer} />
      </ScrollView>

      <View style={styles.stickyFooter}>
        <AnimatedPressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={submit}
          style={[
            styles.submitButton,
            isBusy && styles.submitButtonDisabled,
          ]}
        >
          <Text style={styles.submitText}>
            {isBusy ? "Guardando..." : submitLabel}
          </Text>
        </AnimatedPressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.lg,
  },
  submitErrorBox: {
    backgroundColor: colors.statusLight.error,
    borderColor: colors.status.error + "40",
    borderRadius: radius.input,
    borderWidth: 1,
    padding: spacing.lg,
  },
  submitErrorText: {
    ...typography.bodyMedium,
    color: colors.status.error,
  },
  footerSpacer: {
    height: spacing.xl,
  },
  stickyFooter: {
    backgroundColor: colors.surface.primary,
    borderTopColor: colors.border.light,
    borderTopWidth: 1,
    padding: spacing.lg,
    paddingBottom: spacing.lg + 6,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: colors.primary.main,
    borderRadius: radius.button,
    minHeight: spacing.buttonHeight,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  submitButtonDisabled: {
    backgroundColor: colors.text.disabled,
  },
  submitText: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
});
