import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { AnimatedPressable } from "../../src/components/AnimatedPressable";
import { AmountRow } from "../../src/components/AmountRow";
import { ConfirmModal } from "../../src/components/ConfirmModal";
import { EmptyState } from "../../src/components/EmptyState";
import { ErrorState } from "../../src/components/ErrorState";
import { LoadingState } from "../../src/components/LoadingState";
import type { Retention } from "../../src/domain/Retention";
import { useRetentionService } from "../../src/infrastructure/di/ServiceContext";
import { colors, radius, shadows, spacing, typography } from "../../src/theme";
import { formatCurrency } from "../../src/utils/currency";
import { formatDisplayDate } from "../../src/utils/dates";
import { formatRetentionCategoryLabel } from "../../src/utils/retentionLabels";

export default function RetentionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const retentionId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const service = useRetentionService();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;
  const [retention, setRetention] = useState<Retention | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);

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
      setIsDeleteDialogVisible(false);
      router.back();
    } catch (currentError) {
      setDeleteError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudo eliminar la retencion",
      );
      setIsDeleteDialogVisible(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <LoadingState message="Cargando retencion..." />
      </View>
    );
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
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Retencion</Text>
          <Text style={styles.subtitle}>{categoryLabel}</Text>
        </View>

        <View style={[styles.totalCard, shadows.card]}>
          <Text style={styles.totalLabel}>Monto</Text>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            numberOfLines={1}
            style={[
              styles.totalValue,
              { fontSize: isSmallScreen ? 23 : 26 },
            ]}
          >
            {formatCurrency(retention.amount)}
          </Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Informacion</Text>
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
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Montos</Text>
          <AmountRow
            label="Monto"
            value={formatCurrency(retention.amount)}
            tone="success"
          />
        </View>

        {deleteError ? (
          <View style={styles.inlineError}>
            <Text style={styles.inlineErrorText}>{deleteError}</Text>
          </View>
        ) : null}

        <AnimatedPressable
          accessibilityLabel="Editar retencion"
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: "/retenciones/editar/[id]",
              params: { id: retention.id },
            })
          }
          style={[styles.actionButton, styles.editButton]}
        >
          <Text style={styles.editButtonText}>Editar retencion</Text>
        </AnimatedPressable>

        <AnimatedPressable
          accessibilityLabel="Eliminar retencion"
          accessibilityRole="button"
          disabled={isDeleting}
          onPress={() => setIsDeleteDialogVisible(true)}
          style={[
            styles.actionButton,
            styles.deleteButton,
            isDeleting && styles.disabledButton,
          ]}
        >
          <Text style={styles.deleteButtonText}>
            {isDeleting ? "Eliminando..." : "Eliminar retencion"}
          </Text>
        </AnimatedPressable>
      </ScrollView>

      <ConfirmModal
        cancelLabel="Cancelar"
        confirmLabel="Eliminar"
        destructive
        message={`Esta accion eliminara la retencion de ${categoryLabel} por ${formatCurrency(retention.amount)}. Deseas continuar?`}
        onCancel={() => setIsDeleteDialogVisible(false)}
        onConfirm={() => {
          void deleteRetention();
        }}
        title="Eliminar retencion"
        visible={isDeleteDialogVisible}
      />
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        numberOfLines={1}
        style={styles.detailValue}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background.primary,
    flex: 1,
  },
  container: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  centered: {
    alignItems: "center",
    backgroundColor: colors.background.primary,
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  headerSection: {
    gap: spacing.sm,
  },
  title: {
    ...typography.screenTitle,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  totalCard: {
    backgroundColor: colors.primary.main,
    borderRadius: radius.mainCard,
    gap: spacing.xxs,
    minHeight: 128,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  totalLabel: {
    ...typography.label,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  totalValue: {
    ...typography.primaryAmount,
    color: colors.text.inverse,
    marginTop: spacing.xxs,
  },
  block: {
    gap: spacing.sm,
  },
  blockTitle: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  detailRow: {
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  detailLabel: {
    ...typography.label,
    color: colors.text.secondary,
    flexShrink: 0,
  },
  detailValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    flex: 1,
    textAlign: "right",
    marginLeft: spacing.md,
    minWidth: 0,
  },
  actionButton: {
    alignItems: "center",
    borderRadius: radius.button,
    minHeight: spacing.buttonHeight,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  editButton: {
    backgroundColor: colors.primary.main,
  },
  editButtonText: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
  deleteButton: {
    backgroundColor: colors.statusLight.error,
    borderColor: colors.status.error + "40",
    borderWidth: 1,
  },
  deleteButtonText: {
    ...typography.bodyMedium,
    color: colors.status.error,
  },
  inlineError: {
    backgroundColor: colors.statusLight.error,
    borderColor: colors.status.error + "40",
    borderRadius: radius.input,
    borderWidth: 1,
    padding: spacing.md,
  },
  inlineErrorText: {
    ...typography.bodyMedium,
    color: colors.status.error,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
