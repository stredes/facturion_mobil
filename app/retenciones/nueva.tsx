import { useRouter } from "expo-router";
import { useState } from "react";

import { RetentionForm } from "@/components/RetentionForm";
import type { CreateRetentionInput } from "@/domain/Retention";
import { useRetentionService } from "@/infrastructure/di/ServiceContext";

export default function NewRetentionScreen() {
  const router = useRouter();
  const service = useRetentionService();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(input: CreateRetentionInput) {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await service.create(input);
      router.back();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo crear la retencion",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <RetentionForm
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      submitError={submitError}
      submitLabel="Guardar retencion"
    />
  );
}
