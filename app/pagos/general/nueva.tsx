import { useRouter } from "expo-router";
import { useState } from "react";

import { GeneralPaymentForm } from "@/components/GeneralPaymentForm";
import type { CreateGeneralPaymentInput } from "@/domain/GeneralPayment";
import { useGeneralPaymentService } from "@/infrastructure/di/ServiceContext";

export default function NewGeneralPaymentScreen() {
  const router = useRouter();
  const service = useGeneralPaymentService();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(input: CreateGeneralPaymentInput) {
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
    <GeneralPaymentForm
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      submitError={submitError}
      submitLabel="Guardar pago"
    />
  );
}
