import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";

import type { CreateTaxPaymentInput } from "../domain/TaxPayment";
import { taxPaymentSchema } from "../schemas/taxPaymentSchema";
import type { TaxPaymentFormValues } from "../schemas/taxPaymentSchema";
import { toISODate } from "../utils/dates";
import { DateField } from "./form/DateField";
import { FormScaffold } from "./form/FormScaffold";
import { MoneyField } from "./form/MoneyField";
import { TextField } from "./form/TextField";
import { useFormWithReset } from "./form/useFormWithReset";

interface TaxPaymentFormProps {
  initialValues?: Partial<CreateTaxPaymentInput>;
  submitLabel: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (input: CreateTaxPaymentInput) => Promise<void>;
  title?: string;
  subtitle?: string;
  cancelLabel?: string;
  onCancel?: () => void;
}

function buildDefaultValues(
  initialValues?: Partial<CreateTaxPaymentInput>,
): TaxPaymentFormValues {
  const now = new Date();
  const currentPeriod = toISODate(now).slice(0, 7);

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
    trigger,
    formState: { isSubmitting: isFormSubmitting },
  } = useFormWithReset<TaxPaymentFormValues>(defaultValues, {
    resolver: zodResolver(taxPaymentSchema),
  });

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
    <FormScaffold
      control={control}
      isSubmitting={isBusy}
      onSubmit={submit}
      submitError={submitError}
      submitLabel={submitLabel}
      trigger={trigger}
    >
      <TextField
        control={control}
        keyboardType="numbers-and-punctuation"
        label="Periodo (AAAA-MM)"
        name="taxPeriod"
        placeholder="AAAA-MM"
      />
      <DateField control={control} name="paymentDate" label="Fecha de pago" />
      <MoneyField control={control} name="amount" label="Monto pagado" />
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
