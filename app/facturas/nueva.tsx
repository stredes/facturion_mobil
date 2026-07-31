import { useRouter } from "expo-router";
import { useState } from "react";

import { InvoiceForm } from "../../src/components/InvoiceForm";
import type { CreateInvoiceInput } from "../../src/domain/Invoice";
import { useInvoiceService } from "../../src/infrastructure/di/ServiceContext";

export default function NewInvoiceScreen() {
  const router = useRouter();
  const service = useInvoiceService();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(input: CreateInvoiceInput) {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const invoice = await service.create(input);

      router.replace({
        pathname: "/facturas/[id]",
        params: { id: invoice.id },
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo crear la factura",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <InvoiceForm
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      submitError={submitError}
      submitLabel="Guardar factura"
    />
  );
}
