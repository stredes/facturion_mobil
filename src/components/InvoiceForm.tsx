import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { CreateInvoiceInput } from "../domain/Invoice";
import type { InvoiceFormValues } from "../schemas/invoiceSchema";
import { invoiceSchema } from "../schemas/invoiceSchema";
import {
  calculateAllocatedAmount,
  calculateInvoiceTotal,
  calculateRemainingAmount,
  calculateTax,
} from "../services/invoiceCalculations";
import { formatCurrency } from "../utils/currency";
import { toISODate } from "../utils/dates";
import { MoneyInput } from "./MoneyInput";

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
    paymentDate: initialValues?.paymentDate ?? "",
    taxPayment: initialValues?.taxPayment ?? 0,
    tagAmount: initialValues?.tagAmount ?? 0,
    accountantAmount: initialValues?.accountantAmount ?? 0,
    savingsAmount: initialValues?.savingsAmount ?? 0,
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
  const taxPayment = watch("taxPayment") ?? 0;
  const tagAmount = watch("tagAmount") ?? 0;
  const accountantAmount = watch("accountantAmount") ?? 0;
  const savingsAmount = watch("savingsAmount") ?? 0;
  const taxAmount = calculateTax(netAmount);
  const totalAmount = calculateInvoiceTotal(netAmount, taxAmount);
  const allocatedAmount = calculateAllocatedAmount({
    taxPayment,
    tagAmount,
    accountantAmount,
    savingsAmount,
  });
  const remainingAmount = calculateRemainingAmount({
    totalAmount,
    taxPayment,
    tagAmount,
    accountantAmount,
    savingsAmount,
  });
  const isBusy = isSubmitting || isFormSubmitting;

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      invoiceNumber: values.invoiceNumber,
      invoiceDate: values.invoiceDate,
      clientName: values.clientName,
      description: values.description?.trim() || undefined,
      netAmount: values.netAmount,
      paymentDate: values.paymentDate?.trim() || undefined,
      taxPayment: values.taxPayment,
      tagAmount: values.tagAmount,
      accountantAmount: values.accountantAmount,
      savingsAmount: values.savingsAmount,
    });
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", default: undefined })}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información general</Text>

          <Controller
            control={control}
            name="invoiceNumber"
            render={({ field: { onBlur, onChange, value } }) => (
              <Field
                error={errors.invoiceNumber?.message}
                label="Número de factura"
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
              <Field
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
              <Field
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
              <Field
                error={errors.description?.message}
                label="Descripción"
                multiline
                onBlur={onBlur}
                onChangeText={onChange}
                value={value ?? ""}
              />
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valores de la factura</Text>

          <Controller
            control={control}
            name="netAmount"
            render={({ field: { onChange, value } }) => (
              <MoneyInput
                error={errors.netAmount?.message}
                label="Neto"
                onChangeValue={onChange}
                value={value}
              />
            )}
          />

          <ReadonlyAmount label="IVA" value={formatCurrency(taxAmount)} />
          <ReadonlyAmount
            label="Total factura"
            value={formatCurrency(totalAmount)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pago y separación</Text>

          <Controller
            control={control}
            name="paymentDate"
            render={({ field: { onBlur, onChange, value } }) => (
              <Field
                error={errors.paymentDate?.message}
                keyboardType="numbers-and-punctuation"
                label="Fecha de pago"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="AAAA-MM-DD"
                value={value ?? ""}
              />
            )}
          />

          <Controller
            control={control}
            name="taxPayment"
            render={({ field: { onChange, value } }) => (
              <MoneyInput
                error={errors.taxPayment?.message}
                label="Pago IVA"
                onChangeValue={onChange}
                value={value}
              />
            )}
          />

          <Controller
            control={control}
            name="tagAmount"
            render={({ field: { onChange, value } }) => (
              <MoneyInput
                error={errors.tagAmount?.message}
                label="TAG"
                onChangeValue={onChange}
                value={value}
              />
            )}
          />

          <Controller
            control={control}
            name="accountantAmount"
            render={({ field: { onChange, value } }) => (
              <MoneyInput
                error={errors.accountantAmount?.message}
                label="Contador"
                onChangeValue={onChange}
                value={value}
              />
            )}
          />

          <Controller
            control={control}
            name="savingsAmount"
            render={({ field: { onChange, value } }) => (
              <MoneyInput
                error={errors.savingsAmount?.message}
                label="Ahorro"
                onChangeValue={onChange}
                value={value}
              />
            )}
          />

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total separado</Text>
            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.total}>
              {formatCurrency(allocatedAmount)}
            </Text>
          </View>
          <View
            style={[
              styles.remainingBox,
              remainingAmount < 0 ? styles.remainingBoxError : null,
            ]}
          >
            <Text style={styles.remainingLabel}>Dinero restante</Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[
                styles.remaining,
                remainingAmount < 0 ? styles.remainingError : null,
              ]}
            >
              {formatCurrency(remainingAmount)}
            </Text>
          </View>
        </View>

        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={submit}
          style={({ pressed }) => [
            styles.submitButton,
            isBusy ? styles.submitButtonDisabled : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={styles.submitText}>
            {isBusy ? "Guardando..." : submitLabel}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  keyboardType?: "default" | "numbers-and-punctuation";
  multiline?: boolean;
  onBlur: () => void;
  onChangeText: (value: string) => void;
}

function Field({
  label,
  value,
  error,
  placeholder,
  keyboardType = "default",
  multiline = false,
  onBlur,
  onChangeText,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType={keyboardType}
        multiline={multiline}
        onBlur={onBlur}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#7C8794"
        style={[
          styles.input,
          multiline ? styles.multiline : null,
          error ? styles.inputError : null,
        ]}
        value={value}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function ReadonlyAmount({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.readonly}>
      <Text style={styles.readonlyLabel}>{label}</Text>
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
  container: {
    gap: 18,
    padding: 18,
    paddingBottom: 34,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    color: "#102A43",
    fontSize: 18,
    fontWeight: "900",
  },
  field: {
    gap: 6,
  },
  label: {
    color: "#1F2933",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D9E2EC",
    borderRadius: 8,
    borderWidth: 1,
    color: "#102A43",
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  multiline: {
    minHeight: 94,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#C2410C",
  },
  error: {
    color: "#C2410C",
    fontSize: 12,
    fontWeight: "600",
  },
  readonly: {
    backgroundColor: "#EAF6F8",
    borderColor: "#B6E0E8",
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  readonlyLabel: {
    color: "#155E75",
    fontSize: 13,
    fontWeight: "800",
  },
  readonlyValue: {
    color: "#102A43",
    fontSize: 20,
    fontWeight: "900",
  },
  totalBox: {
    backgroundColor: "#F3F7FA",
    borderRadius: 8,
    gap: 6,
    padding: 14,
  },
  totalLabel: {
    color: "#52606D",
    fontSize: 13,
    fontWeight: "800",
  },
  total: {
    color: "#102A43",
    fontSize: 18,
    fontWeight: "900",
  },
  remainingBox: {
    backgroundColor: "#ECFDF3",
    borderColor: "#BBF7D0",
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  remainingBoxError: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FDBA74",
  },
  remainingLabel: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "800",
  },
  remaining: {
    color: "#166534",
    fontSize: 24,
    fontWeight: "900",
  },
  remainingError: {
    color: "#C2410C",
  },
  submitError: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FDBA74",
    borderRadius: 8,
    borderWidth: 1,
    color: "#C2410C",
    fontSize: 14,
    fontWeight: "700",
    padding: 14,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#0E7490",
    borderRadius: 8,
    minHeight: 54,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  submitButtonDisabled: {
    backgroundColor: "#93A4B3",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.72,
  },
});
