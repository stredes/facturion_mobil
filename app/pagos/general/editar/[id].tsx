import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { GeneralPaymentForm } from "@/components/GeneralPaymentForm";
import { FormSkeleton } from "@/components/LoadingSkeleton";
import type {
  CreateGeneralPaymentInput,
  GeneralPayment,
} from "@/domain/GeneralPayment";
import { useGeneralPaymentService } from "@/infrastructure/di/ServiceContext";
import { spacing, useThemeColors, type Colors } from "@/theme";

export default function EditGeneralPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const paymentId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const service = useGeneralPaymentService();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [payment, setPayment] = useState<GeneralPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPayment = useCallback(async () => {
    if (!paymentId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      setPayment(await service.getById(paymentId));
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "No se pudo cargar el pago",
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

  async function handleSubmit(input: CreateGeneralPaymentInput) {
    if (!payment) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await service.update(payment.id, input);
      router.back();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo actualizar el pago",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const formInitialValues = useMemo(
    () =>
      payment
        ? {
            category: payment.category,
            paymentDate: payment.paymentDate,
            amount: payment.amount,
            description: payment.description ?? "",
            reference: payment.reference ?? "",
          }
        : undefined,
    [payment],
  );

  if (isLoading) {
    return <FormSkeleton />;
  }

  if (loadError) {
    return (
      <View style={styles.centered}>
        <ErrorState message={loadError} onRetry={loadPayment} />
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
    <GeneralPaymentForm
      initialValues={formInitialValues}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      submitError={submitError}
      submitLabel="Actualizar pago"
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
