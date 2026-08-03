import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AmountRow } from "@/components/AmountRow";
import { DetailBlock, DetailRow, DetailScreen } from "@/components/DetailScreen";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { DetailSkeleton } from "@/components/LoadingSkeleton";
import type { Invoice } from "@/domain/Invoice";
import { useInvoiceService } from "@/infrastructure/di/ServiceContext";
import { colors, spacing } from "@/theme";
import { formatCurrency } from "@/utils/currency";
import { formatDisplayDate } from "@/utils/dates";

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoiceId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const service = useInvoiceService();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadInvoice = useCallback(async () => {
    if (!invoiceId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setInvoice(await service.getById(invoiceId));
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
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

  async function deleteInvoice() {
    if (!invoice) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await service.delete(invoice.id);
      router.back();
    } catch (currentError) {
      setDeleteError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudo eliminar la factura",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ErrorState message={error} onRetry={loadInvoice} />
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
    <DetailScreen
      deleteConfirmMessage={`Esta accion eliminara la factura N. ${invoice.invoiceNumber}. Deseas continuar?`}
      deleteConfirmTitle="Eliminar factura"
      deleteError={deleteError}
      deleteLabel="Eliminar factura"
      deletingLabel="Eliminando..."
      editLabel="Editar factura"
      isDeleting={isDeleting}
      onDelete={deleteInvoice}
      onEdit={() =>
        router.push({
          pathname: "/facturas/editar/[id]",
          params: { id: invoice.id },
        })
      }
      subtitle={invoice.clientName}
      title={`Factura N. ${invoice.invoiceNumber}`}
      totalLabel="Total factura"
      totalValue={formatCurrency(invoice.totalAmount)}
    >
      <DetailBlock title="Informacion">
        <DetailRow label="Fecha" value={formatDisplayDate(invoice.invoiceDate)} />
        <DetailRow
          label="Descripcion"
          value={invoice.description || "Sin descripcion"}
        />
      </DetailBlock>

      <DetailBlock title="Montos">
        <AmountRow
          label="Neto"
          value={formatCurrency(invoice.netAmount)}
        />
        <AmountRow
          label="IVA"
          value={formatCurrency(invoice.taxAmount)}
        />
        <AmountRow
          label="Total"
          value={formatCurrency(invoice.totalAmount)}
          tone="success"
        />
      </DetailBlock>
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    backgroundColor: colors.background.primary,
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
});
