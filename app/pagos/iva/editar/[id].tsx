import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { TaxPaymentForm } from "@/components/TaxPaymentForm";
import type {
  CreateTaxPaymentInput,
  TaxPayment,
} from "@/domain/TaxPayment";
import { useTaxPaymentService } from "@/infrastructure/di/ServiceContext";
import { colors, spacing } from "@/theme";

export default function EditTaxPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const paymentId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const service = useTaxPaymentService();
  const [payment, setPayment] = useState<TaxPayment | null>(null);
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

  async function handleSubmit(input: CreateTaxPaymentInput) {
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

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary.main} />
      </View>
    );
  }

  if (!payment) {
    return (
      <View style={styles.centered}>
        <EmptyState
          message={loadError ?? "El pago no existe o fue eliminado."}
          title="Pago no encontrado"
        />
      </View>
    );
  }

  return (
    <TaxPaymentForm
      initialValues={{
        taxPeriod: payment.taxPeriod,
        paymentDate: payment.paymentDate,
        amount: payment.amount,
        description: payment.description ?? "",
        reference: payment.reference ?? "",
      }}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      submitError={submitError}
      submitLabel="Actualizar pago IVA"
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
