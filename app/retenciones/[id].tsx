import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AmountRow } from "@/components/AmountRow";
import { DetailBlock, DetailRow, DetailScreen } from "@/components/DetailScreen";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { DetailSkeleton } from "@/components/LoadingSkeleton";
import type { Retention } from "@/domain/Retention";
import { useRetentionService } from "@/infrastructure/di/ServiceContext";
import { spacing, useThemeColors, type Colors } from "@/theme";
import { formatCurrency } from "@/utils/currency";
import { formatDisplayDate } from "@/utils/dates";
import { formatRetentionCategoryLabel } from "@/utils/retentionLabels";

export default function RetentionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const retentionId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const service = useRetentionService();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [retention, setRetention] = useState<Retention | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadRetention = useCallback(async () => {
    if (!retentionId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setRetention(await service.getById(retentionId));
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudo cargar la retencion",
      );
    } finally {
      setIsLoading(false);
    }
  }, [retentionId, service]);

  useFocusEffect(
    useCallback(() => {
      void loadRetention();
    }, [loadRetention]),
  );

  async function deleteRetention() {
    if (!retention) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await service.delete(retention.id);
      router.back();
    } catch (currentError) {
      setDeleteError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudo eliminar la retencion",
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
        <ErrorState message={error} onRetry={loadRetention} />
      </View>
    );
  }

  if (!retention) {
    return (
      <View style={styles.centered}>
        <EmptyState
          message="La retencion no existe o fue eliminada."
          title="Retencion no encontrada"
        />
      </View>
    );
  }

  const categoryLabel = formatRetentionCategoryLabel(retention.category);

  return (
    <DetailScreen
      deleteConfirmMessage={`Esta accion eliminara la retencion de ${categoryLabel} por ${formatCurrency(retention.amount)}. Deseas continuar?`}
      deleteConfirmTitle="Eliminar retencion"
      deleteError={deleteError}
      deleteLabel="Eliminar retencion"
      deletingLabel="Eliminando..."
      editLabel="Editar retencion"
      isDeleting={isDeleting}
      onDelete={deleteRetention}
      onEdit={() =>
        router.push({
          pathname: "/retenciones/editar/[id]",
          params: { id: retention.id },
        })
      }
      subtitle={categoryLabel}
      title="Retencion"
      totalLabel="Monto"
      totalValue={formatCurrency(retention.amount)}
    >
      <DetailBlock title="Informacion">
        <DetailRow label="Categoria" value={categoryLabel} />
        <DetailRow
          label="Fecha"
          value={formatDisplayDate(retention.retentionDate)}
        />
        <DetailRow
          label="Descripcion"
          value={retention.description || "Sin descripcion"}
        />
        <DetailRow
          label="Referencia"
          value={retention.reference || "Sin referencia"}
        />
      </DetailBlock>

      <DetailBlock title="Montos">
        <AmountRow
          label="Monto"
          value={formatCurrency(retention.amount)}
          tone="success"
        />
      </DetailBlock>
    </DetailScreen>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    centered: {
      alignItems: "center",
      backgroundColor: c.background.primary,
      flex: 1,
      justifyContent: "center",
      padding: spacing.xl,
    },
  });
