import { useRouter } from "expo-router";
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
import type { CreateTaxPaymentInput } from "@/domain/TaxPayment";
import { useInvoiceService, useTaxPaymentService } from "@/infrastructure/di/ServiceContext";
import { colors, radius, spacing, typography } from "@/theme";
import { toISODate } from "@/utils/dates";

export default function NewTaxPaymentScreen() {
  const router = useRouter();
  const service = useTaxPaymentService();
  const invoiceService = useInvoiceService();
  const [taxPeriod, setTaxPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [paymentDate, setPaymentDate] = useState(toISODate(new Date()));
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (amount <= 0) {
      setError("El monto debe ser mayor que cero");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const input: CreateTaxPaymentInput = {
        taxPeriod,
        paymentDate,
        amount,
        description: description.trim() || undefined,
        reference: reference.trim() || undefined,
      };
      await service.create(input);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear pago");
    } finally {
      setIsSubmitting(false);
    }
  }

  const generatedTax = 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", default: undefined })}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Periodo tributario</Text>
          <Text style={styles.infoValue}>{taxPeriod}</Text>
        </View>

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
            {isSubmitting ? "Guardando..." : "Guardar pago IVA"}
          </Text>
        </AnimatedPressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: spacing.lg, padding: spacing.lg },
  infoBox: {
    backgroundColor: colors.primary.light,
    borderRadius: radius.input,
    padding: spacing.lg,
    gap: spacing.xxs,
  },
  infoLabel: { ...typography.label, color: colors.primary.main },
  infoValue: { ...typography.cardAmount, color: colors.primary.main },
  errorBox: { backgroundColor: colors.statusLight.error, borderRadius: radius.input, padding: spacing.md },
  errorText: { ...typography.bodyMedium, color: colors.status.error },
  spacer: { height: 40 },
  footer: { backgroundColor: colors.surface.primary, borderTopColor: colors.border.light, borderTopWidth: 1, padding: spacing.lg },
  submitButton: { alignItems: "center", backgroundColor: colors.primary.main, borderRadius: radius.button, minHeight: spacing.buttonHeight, justifyContent: "center" },
  submitDisabled: { backgroundColor: colors.text.disabled },
  submitText: { ...typography.bodyMedium, color: colors.text.inverse },
});
