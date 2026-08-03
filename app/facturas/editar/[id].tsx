import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { InvoiceForm } from "@/components/InvoiceForm";
import { FormSkeleton } from "@/components/LoadingSkeleton";
import type { CreateInvoiceInput, Invoice } from "../../../src/domain/Invoice";
import { useInvoiceService } from "../../../src/infrastructure/di/ServiceContext";
import { colors, spacing } from "../../../src/theme";

export default function EditInvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoiceId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const service = useInvoiceService();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadInvoice = useCallback(async () => {
    if (!invoiceId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      setInvoice(await service.getById(invoiceId));
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la factura",
      );
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId, service]);

  useFocusEffect(
    useCallback(() => {
      void loadInvoice();
    }, [loadInvoice]),
  );

  async function handleSubmit(input: CreateInvoiceInput) {
    if (!invoice) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const updatedInvoice = await service.update(invoice.id, input);

      router.replace({
        pathname: "/facturas/[id]",
        params: { id: updatedInvoice.id },
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la factura",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const formInitialValues = useMemo(
    () =>
      invoice
        ? {
            invoiceNumber: invoice.invoiceNumber,
            invoiceDate: invoice.invoiceDate,
            clientName: invoice.clientName,
            description: invoice.description ?? "",
            netAmount: invoice.netAmount,
          }
        : undefined,
    [invoice],
  );

  if (isLoading) {
    return <FormSkeleton />;
  }

  if (loadError) {
    return (
      <View style={styles.centered}>
        <ErrorState message={loadError} onRetry={loadInvoice} />
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.centered}>
        <EmptyState
          message="La factura no existe o fue eliminada."
          title="Factura no encontrada"
        />
      </View>
    );
  }

  return (
    <InvoiceForm
      initialValues={formInitialValues}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      submitError={submitError}
      submitLabel="Actualizar factura"
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    backgroundColor: colors.background.primary,
    flex: 1,
    justifyContent: "center",
    padding: spacing.xxl,
  },
});
