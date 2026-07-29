import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Invoice } from "../domain/Invoice";
import { colors, radius, shadows, spacing, typography } from "../theme";
import { formatCurrency } from "../utils/currency";
import { formatDisplayDate } from "../utils/dates";
import { StatusBadge } from "./StatusBadge";

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: () => void;
}

export function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
  const hasPaymentDate = Boolean(invoice.paymentDate);
  const status = invoice.paymentDate
    ? "paid"
    : "pending";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadows.card,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Factura N.º {invoice.invoiceNumber}</Text>
        <Text style={styles.date}>{formatDisplayDate(invoice.invoiceDate)}</Text>
      </View>

      <Text numberOfLines={1} style={styles.client}>
        {invoice.clientName}
      </Text>

      <Text style={styles.total}>{formatCurrency(invoice.totalAmount)}</Text>

      <View style={styles.amountRow}>
        <Text style={styles.amountItem}>
          Neto {formatCurrency(invoice.netAmount)}
        </Text>
        <Text style={styles.amountItem}>
          IVA {formatCurrency(invoice.taxAmount)}
        </Text>
      </View>

      <View style={styles.footer}>
        {hasPaymentDate ? (
          <StatusBadge status="paid" />
        ) : (
          <StatusBadge status="pending" />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  title: {
    ...typography.cardTitle,
    color: colors.textPrimary,
    flex: 1,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingTop: 2,
  },
  client: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  total: {
    ...typography.cardAmount,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  amountRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  amountItem: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: "row",
    marginTop: spacing.xs,
  },
});
