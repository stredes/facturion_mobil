import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useController, type Control } from "react-hook-form";

import type { CreateInvoiceInput, InvoiceStatus } from "../domain/Invoice";
import {
  calculateInvoiceTotal,
  calculateTax,
} from "../domain/invoiceCalculations";
import { invoiceSchema } from "../schemas/invoiceSchema";
import type { InvoiceFormValues } from "../schemas/invoiceSchema";
import { radius, spacing, typography, useThemeColors, type Colors } from "../theme";
import { formatCurrencyCompact } from "../utils/currency";
import { toISODate } from "../utils/dates";
import { FormSection } from "./form/FormSection";
import { FormScaffold } from "./form/FormScaffold";
import { MoneyField } from "./form/MoneyField";
import { TextField } from "./form/TextField";
import { useFormWithReset } from "./form/useFormWithReset";
import { FilterChip } from "./FilterChip";

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
  const status =
    initialValues?.status ?? (initialValues?.paymentDate ? "paid" : "pending");

  return {
    invoiceNumber: initialValues?.invoiceNumber ?? "",
    invoiceDate: initialValues?.invoiceDate ?? toISODate(new Date()),
    clientName: initialValues?.clientName ?? "",
    description: initialValues?.description ?? "",
    netAmount: initialValues?.netAmount ?? 0,
    status,
    paymentDate:
      status === "paid" ? initialValues?.paymentDate ?? toISODate(new Date()) : "",
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
    setValue,
    watch,
    formState: { isSubmitting: isFormSubmitting },
  } = useFormWithReset<InvoiceFormValues>(defaultValues, {
    resolver: zodResolver(invoiceSchema),
  });

  const netAmount = watch("netAmount") ?? 0;
  const status = watch("status");
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
      status: values.status,
      paymentDate:
        values.status === "paid" ? values.paymentDate?.trim() : null,
      taxPayment: values.taxPayment,
      tagAmount: values.tagAmount,
      accountantAmount: values.accountantAmount,
      savingsAmount: values.savingsAmount,
    });
  });

  const setInvoiceStatus = (nextStatus: InvoiceStatus) => {
    setValue("status", nextStatus, { shouldDirty: true, shouldValidate: true });
    setValue(
      "paymentDate",
      nextStatus === "paid" ? watch("paymentDate") || toISODate(new Date()) : "",
      { shouldDirty: true, shouldValidate: true },
    );
  };

  return (
    <FormScaffold
      gap={spacing.lg}
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
          value={formatCurrencyCompact(taxAmount)}
          hint="Calculado automaticamente"
        />
        <ReadonlyBox
          label="Total factura"
          value={formatCurrencyCompact(totalAmount)}
          hint="Calculado automaticamente"
        />
      </FormSection>

      <FormSection icon="E" title="Estado de pago">
        <InvoiceStatusField
          control={control}
          onSelectStatus={setInvoiceStatus}
        />
        {status === "paid" ? (
          <TextField
            control={control}
            keyboardType="numbers-and-punctuation"
            label="Fecha en que cayo el dinero"
            name="paymentDate"
            placeholder="AAAA-MM-DD"
          />
        ) : (
          <ReadonlyBox
            label="Pendiente"
            value="No aprobado / sin dinero recibido"
            hint="No se registra fecha de pago"
          />
        )}
      </FormSection>
    </FormScaffold>
  );
}

function InvoiceStatusField({
  control,
  onSelectStatus,
}: {
  control: Control<InvoiceFormValues>;
  onSelectStatus: (status: InvoiceStatus) => void;
}) {
  const { field } = useController({ control, name: "status" });
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.statusGroup}>
      <FilterChip
        label="Pendiente"
        selected={field.value === "pending"}
        onPress={() => onSelectStatus("pending")}
      />
      <FilterChip
        label="Pagada"
        selected={field.value === "paid"}
        onPress={() => onSelectStatus("paid")}
      />
    </View>
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
    statusGroup: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
  });
