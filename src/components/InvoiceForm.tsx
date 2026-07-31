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

import type { CreateInvoiceInput } from "../domain/Invoice";
import type { InvoiceFormValues } from "../schemas/invoiceSchema";
import { invoiceSchema } from "../schemas/invoiceSchema";
import {
  calculateInvoiceTotal,
  calculateTax,
} from "../services/invoiceCalculations";
import { colors, radius, spacing, typography } from "../theme";
import { formatCurrency } from "../utils/currency";
import { toISODate } from "../utils/dates";
import { AnimatedPressable } from "./AnimatedPressable";
import { MoneyInput } from "./MoneyInput";
import { TextInputField } from "./TextInputField";

interface InvoiceFormProps {
  initialValues?: Partial<CreateInvoiceInput>;
  submitLabel: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (input: CreateInvoiceInput) => Promise<void>;
}

function buildDefaultValues(
  initialValues?: Partial<CreateInvoiceInput>,
): InvoiceFormValues {
  return {
    invoiceNumber: initialValues?.invoiceNumber ?? "",
    invoiceDate: initialValues?.invoiceDate ?? toISODate(new Date()),
    clientName: initialValues?.clientName ?? "",
    description: initialValues?.description ?? "",
    netAmount: initialValues?.netAmount ?? 0,
  };
}

export function InvoiceForm({
  initialValues,
  submitLabel,
  isSubmitting = false,
  submitError,
  onSubmit,
}: InvoiceFormProps) {
  const defaultValues = useMemo(
    () => buildDefaultValues(initialValues),
    [initialValues],
  );
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<InvoiceFormValues>({
    defaultValues,
    resolver: zodResolver(invoiceSchema),
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const netAmount = watch("netAmount") ?? 0;
  const taxAmount = calculateTax(netAmount);
  const totalAmount = calculateInvoiceTotal(netAmount, taxAmount);
  const isBusy = isSubmitting || isFormSubmitting;

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      invoiceNumber: values.invoiceNumber,
      invoiceDate: values.invoiceDate,
      clientName: values.clientName,
      description: values.description?.trim() || undefined,
      netAmount: values.netAmount,
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
        <View style={styles.block}>
          <View style={styles.blockHeader}>
            <View style={styles.blockIcon}>
              <Text style={styles.blockIconText}>i</Text>
            </View>
            <Text style={styles.blockTitle}>Informacion de la factura</Text>
          </View>

          <Controller
            control={control}
            name="invoiceNumber"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInputField
                error={errors.invoiceNumber?.message}
                label="Numero de factura"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Controller
            control={control}
            name="invoiceDate"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInputField
                error={errors.invoiceDate?.message}
                keyboardType="numbers-and-punctuation"
                label="Fecha"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="AAAA-MM-DD"
                value={value}
              />
            )}
          />

          <Controller
            control={control}
            name="clientName"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInputField
                error={errors.clientName?.message}
                label="Cliente"
                onBlur={onBlur}
                onChangeText={onChange}
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
        </View>

        <View style={styles.block}>
          <View style={styles.blockHeader}>
            <View style={styles.blockIcon}>
              <Text style={styles.blockIconText}>$</Text>
            </View>
            <Text style={styles.blockTitle}>Montos</Text>
          </View>

          <Controller
            control={control}
            name="netAmount"
            render={({ field: { onChange, value } }) => (
              <MoneyInput
                error={errors.netAmount?.message}
                label="Monto neto"
                onChangeValue={onChange}
                value={value}
              />
            )}
          />

          <ReadonlyBox
            label="IVA"
            value={formatCurrency(taxAmount)}
            hint="Calculado automaticamente"
          />

          <ReadonlyBox
            label="Total factura"
            value={formatCurrency(totalAmount)}
            hint="Calculado automaticamente"
          />
        </View>

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

function ReadonlyBox({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <View style={styles.readonlyBox}>
      <View style={styles.readonlyHeader}>
        <Text style={styles.readonlyLabel}>{label}</Text>
        {hint ? <Text style={styles.readonlyHint}>{hint}</Text> : null}
      </View>
      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.readonlyValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.xl,
    padding: spacing.lg,
    paddingBottom: spacing.lg,
  },
  block: {
    gap: spacing.md,
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  blockIcon: {
    backgroundColor: colors.primary.light,
    borderRadius: radius.inner,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  blockIconText: {
    ...typography.label,
    color: colors.primary.main,
    fontWeight: "700",
  },
  blockTitle: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    flex: 1,
  },
  readonlyBox: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  readonlyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readonlyLabel: {
    ...typography.label,
    color: colors.text.secondary,
  },
  readonlyHint: {
    ...typography.small,
    color: colors.text.tertiary,
  },
  readonlyValue: {
    ...typography.cardAmount,
    color: colors.text.primary,
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
