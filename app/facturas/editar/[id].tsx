import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "../../../src/components/EmptyState";
import { InvoiceForm } from "../../../src/components/InvoiceForm";
import type { CreateInvoiceInput, Invoice } from "../../../src/domain/Invoice";
import { SQLiteInvoiceRepository } from "../../../src/infrastructure/repositories/SQLiteInvoiceRepository";

export default function EditInvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoiceId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const repository = useMemo(() => new SQLiteInvoiceRepository(), []);
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
      setInvoice(await repository.findById(invoiceId));
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la factura",
      );
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId, repository]);

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
      const updatedInvoice = await repository.update(invoice.id, input);

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

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#0E7490" />
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.centered}>
        <EmptyState
          message={loadError ?? "La factura no existe o fue eliminada."}
          title="Factura no encontrada"
        />
      </View>
    );
  }

  return (
    <InvoiceForm
      initialValues={{
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        clientName: invoice.clientName,
        description: invoice.description ?? "",
        netAmount: invoice.netAmount,
        paymentDate: invoice.paymentDate ?? "",
        taxPayment: invoice.taxPayment,
        tagAmount: invoice.tagAmount,
        accountantAmount: invoice.accountantAmount,
        savingsAmount: invoice.savingsAmount,
      }}
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
    backgroundColor: "#F6F8FA",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
});
