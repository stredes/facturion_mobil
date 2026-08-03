import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AmountRow } from "@/components/AmountRow";
import { DetailBlock, DetailRow, DetailScreen } from "@/components/DetailScreen";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { DetailSkeleton } from "@/components/LoadingSkeleton";
import type { TaxPayment } from "@/domain/TaxPayment";
import { useTaxPaymentService } from "@/infrastructure/di/ServiceContext";
import { colors, spacing } from "@/theme";
import { formatCurrency } from "@/utils/currency";
import { formatDisplayDate } from "@/utils/dates";

export default function TaxPaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const paymentId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const service = useTaxPaymentService();
  const [payment, setPayment] = useState<TaxPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPayment = useCallback(async () => {
    if (!paymentId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setPayment(await service.getById(paymentId));
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudo cargar el pago",
      );
    } finally {
      setIsLoading(false);
    }
  }, [paymentId, service]);

  useFocusEffect(
    useCallback(() => {
      void loadPayment();
    }, [loadPayment]),
  );

  async function deletePayment() {
    if (!payment) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await service.delete(payment.id);
      router.back();
    } catch (currentError) {
      setDeleteError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudo eliminar el pago",
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
        <ErrorState message={error} onRetry={loadPayment} />
      </View>
    );
  }

  if (!payment) {
    return (
      <View style={styles.centered}>
        <EmptyState
          message="El pago no existe o fue eliminado."
          title="Pago no encontrado"
        />
      </View>
    );
  }

  return (
    <DetailScreen
      deleteConfirmMessage={`Esta accion eliminara el pago de IVA del periodo ${payment.taxPeriod} por ${formatCurrency(payment.amount)}. Deseas continuar?`}
      deleteConfirmTitle="Eliminar pago"
      deleteError={deleteError}
      deleteLabel="Eliminar pago"
      deletingLabel="Eliminando..."
      editLabel="Editar pago"
      isDeleting={isDeleting}
      onDelete={deletePayment}
      onEdit={() =>
        router.push({
          pathname: "/pagos/iva/editar/[id]",
          params: { id: payment.id },
        })
      }
      subtitle={`Periodo ${payment.taxPeriod}`}
      title="Pago de IVA"
      totalLabel="Monto pagado"
      totalValue={formatCurrency(payment.amount)}
    >
      <DetailBlock title="Informacion">
        <DetailRow label="Periodo" value={payment.taxPeriod} />
        <DetailRow
          label="Fecha"
          value={formatDisplayDate(payment.paymentDate)}
        />
        <DetailRow
          label="Descripcion"
          value={payment.description || "Sin descripcion"}
        />
        <DetailRow
          label="Referencia"
          value={payment.reference || "Sin referencia"}
        />
      </DetailBlock>

      <DetailBlock title="Montos">
        <AmountRow
          label="Monto pagado"
          value={formatCurrency(payment.amount)}
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
