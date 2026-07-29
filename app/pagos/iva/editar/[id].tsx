import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { MoneyInput } from "@/components/MoneyInput";
import { TextInputField } from "@/components/TextInputField";
import type { TaxPayment, UpdateTaxPaymentInput } from "@/domain/TaxPayment";
import { useTaxPaymentService } from "@/infrastructure/di/ServiceContext";
import { colors, radius, spacing, typography } from "@/theme";

export default function EditTaxPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const paymentId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const service = useTaxPaymentService();

  const [payment, setPayment] = useState<TaxPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taxPeriod, setTaxPeriod] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!paymentId) return;
      service
        .getById(paymentId)
        .then((p) => {
          if (p) {
            setPayment(p);
            setTaxPeriod(p.taxPeriod);
            setPaymentDate(p.paymentDate);
            setAmount(p.amount);
            setDescription(p.description ?? "");
            setReference(p.reference ?? "");
          }
        })
        .catch((e) => setError(e instanceof Error ? e.message : "Error"))
        .finally(() => setIsLoading(false));
    }, [paymentId, service]),
  );

  async function handleSubmit() {
    if (amount <= 0) {
      setError("El monto debe ser mayor que cero");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const input: UpdateTaxPaymentInput = {
        taxPeriod,
        paymentDate,
        amount,
        description: description.trim() || null,
        reference: reference.trim() || null,
      };
      await service.update(paymentId!, input);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !payment) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", default: undefined })}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TextInputField
          label="Periodo (AAAA-MM)"
          keyboardType="numbers-and-punctuation"
          placeholder="AAAA-MM"
          value={taxPeriod}
          onChangeText={setTaxPeriod}
        />

        <TextInputField
          label="Fecha de pago"
          keyboardType="numbers-and-punctuation"
          placeholder="AAAA-MM-DD"
          value={paymentDate}
          onChangeText={setPaymentDate}
        />

        <MoneyInput
          label="Monto pagado"
          value={amount}
          onChangeValue={setAmount}
        />

        <TextInputField
          label="Descripcion"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TextInputField
          label="Referencia"
          value={reference}
          onChangeText={setReference}
          placeholder="Opcional"
        />

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <AnimatedPressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={handleSubmit}
          style={[styles.submitButton, isSubmitting && styles.submitDisabled]}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? "Guardando..." : "Actualizar pago IVA"}
          </Text>
        </AnimatedPressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: spacing.lg, padding: spacing.lg },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { ...typography.body, color: colors.text.secondary },
  errorBox: { backgroundColor: colors.statusLight.error, borderRadius: radius.input, padding: spacing.md },
  errorText: { ...typography.bodyMedium, color: colors.status.error },
  spacer: { height: 40 },
  footer: { backgroundColor: colors.surface.primary, borderTopColor: colors.border.light, borderTopWidth: 1, padding: spacing.lg },
  submitButton: { alignItems: "center", backgroundColor: colors.primary.main, borderRadius: radius.button, minHeight: spacing.buttonHeight, justifyContent: "center" },
  submitDisabled: { backgroundColor: colors.text.disabled },
  submitText: { ...typography.bodyMedium, color: colors.text.inverse },
});
