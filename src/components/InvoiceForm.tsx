import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { CreateInvoiceInput } from "../domain/Invoice";
import {
  calculateInvoiceTotal,
  calculateTax,
} from "../domain/invoiceCalculations";
import { invoiceSchema } from "../schemas/invoiceSchema";
import type { InvoiceFormValues } from "../schemas/invoiceSchema";
import { radius, spacing, typography, useThemeColors, type Colors } from "../theme";
import { formatCurrency } from "../utils/currency";
import { toISODate } from "../utils/dates";
import { FormSection } from "./form/FormSection";
import { FormScaffold } from "./form/FormScaffold";
import { MoneyField } from "./form/MoneyField";
import { TextField } from "./form/TextField";
import { useFormWithReset } from "./form/useFormWithReset";

interface InvoiceFormProps {
  initialValues?: Partial<CreateInvoiceInput>;
  submitLabel: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (input: CreateInvoiceInput) => Promise<void>;
  title?: string;
  subtitle?: string;
  cancelLabel?: string;
  onCancel?: () => void;
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
  title,
  subtitle,
  cancelLabel,
  onCancel,
}: InvoiceFormProps) {
  const defaultValues = useMemo(
    () => buildDefaultValues(initialValues),
    [initialValues],
  );
  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting: isFormSubmitting },
  } = useFormWithReset<InvoiceFormValues>(defaultValues, {
    resolver: zodResolver(invoiceSchema),
  });

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
    <FormScaffold
      gap={spacing.xl}
      isSubmitting={isBusy}
      onSubmit={submit}
      submitError={submitError}
      submitLabel={submitLabel}
      title={title}
      subtitle={subtitle}
      cancelLabel={cancelLabel}
      onCancel={onCancel}
    >
      <FormSection icon="i" title="Informacion de la factura">
        <TextField control={control} name="invoiceNumber" label="Numero de factura" />
        <TextField
          control={control}
          keyboardType="numbers-and-punctuation"
          label="Fecha"
          name="invoiceDate"
          placeholder="AAAA-MM-DD"
        />
        <TextField control={control} name="clientName" label="Cliente" />
        <TextField
          control={control}
          name="description"
          label="Descripcion"
          multiline
        />
      </FormSection>

      <FormSection icon="$" title="Montos">
        <MoneyField control={control} name="netAmount" label="Monto neto" />
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
      </FormSection>
    </FormScaffold>
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
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      accessibilityRole="summary"
      style={styles.readonlyBox}
    >
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

const createStyles = (c: Colors) =>
  StyleSheet.create({
    readonlyBox: {
      backgroundColor: c.background.tertiary,
      borderColor: c.border.light,
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
      color: c.text.secondary,
    },
    readonlyHint: {
      ...typography.small,
      color: c.text.tertiary,
    },
    readonlyValue: {
      ...typography.cardAmount,
      color: c.text.primary,
    },
  });
