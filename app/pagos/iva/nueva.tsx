import { useRouter } from "expo-router";
import { useState } from "react";

import { TaxPaymentForm } from "@/components/TaxPaymentForm";
import type { CreateTaxPaymentInput } from "@/domain/TaxPayment";
import { useTaxPaymentService } from "@/infrastructure/di/ServiceContext";

export default function NewTaxPaymentScreen() {
  const router = useRouter();
  const service = useTaxPaymentService();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(input: CreateTaxPaymentInput) {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await service.create(input);
      router.back();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo crear el pago",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <TaxPaymentForm
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      submitError={submitError}
      submitLabel="Guardar pago IVA"
    />
  );
}
