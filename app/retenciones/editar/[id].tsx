import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { FormSkeleton } from "@/components/LoadingSkeleton";
import { RetentionForm } from "@/components/RetentionForm";
import type { CreateRetentionInput, Retention } from "@/domain/Retention";
import { useRetentionService } from "@/infrastructure/di/ServiceContext";
import { spacing, useThemeColors, type Colors } from "@/theme";

export default function EditRetentionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const retentionId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const service = useRetentionService();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [retention, setRetention] = useState<Retention | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRetention = useCallback(async () => {
    if (!retentionId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      setRetention(await service.getById(retentionId));
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
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

  async function handleSubmit(input: CreateRetentionInput) {
    if (!retention) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await service.update(retention.id, input);
      router.back();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la retencion",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const formInitialValues = useMemo(
    () =>
      retention
        ? {
            category: retention.category,
            retentionDate: retention.retentionDate,
            amount: retention.amount,
            description: retention.description ?? "",
            reference: retention.reference ?? "",
          }
        : undefined,
    [retention],
  );

  if (isLoading) {
    return <FormSkeleton />;
  }

  if (loadError) {
    return (
      <View style={styles.centered}>
        <ErrorState message={loadError} onRetry={loadRetention} />
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

  return (
    <RetentionForm
      initialValues={formInitialValues}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      submitError={submitError}
      submitLabel="Actualizar retencion"
    />
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    centered: {
      alignItems: "center",
      backgroundColor: c.background.primary,
      flex: 1,
      justifyContent: "center",
      padding: spacing.xxl,
    },
  });
