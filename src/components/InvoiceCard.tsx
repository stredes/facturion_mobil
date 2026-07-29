import { StyleSheet, Text, View } from "react-native";

import type { Invoice } from "../domain/Invoice";
import { colors, radius, shadows, spacing, typography } from "../theme";
import { formatCurrency } from "../utils/currency";
import { formatDisplayDate } from "../utils/dates";
import { AnimatedPressable } from "./AnimatedPressable";

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: () => void;
}

export function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
  return (
    <AnimatedPressable onPress={onPress}>
      <View style={[styles.card, shadows.card]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text numberOfLines={1} style={styles.title}>
              N. {invoice.invoiceNumber}
            </Text>
            <Text numberOfLines={1} style={styles.client}>
              {invoice.clientName}
            </Text>
          </View>
        </View>

        <View style={styles.amountRow}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Neto</Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={styles.amountValue}
            >
              {formatCurrency(invoice.netAmount)}
            </Text>
          </View>
          <View style={styles.amountDivider} />
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>IVA</Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={styles.amountValue}
            >
              {formatCurrency(invoice.taxAmount)}
            </Text>
          </View>
          <View style={styles.amountDivider} />
          <View style={[styles.amountItem, styles.amountItemTotal]}>
            <Text style={styles.amountLabel}>Total</Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={styles.totalValue}
            >
              {formatCurrency(invoice.totalAmount)}
            </Text>
          </View>
        </View>

        <Text style={styles.date}>{formatDisplayDate(invoice.invoiceDate)}</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.light,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 150,
    padding: spacing.cardPadding,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  title: {
    ...typography.cardTitle,
    color: colors.text.primary,
  },
  client: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderRadius: radius.inner,
    padding: spacing.sm,
    gap: 0,
  },
  amountItem: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  amountItemTotal: {
    flex: 1.3,
  },
  amountDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.xs,
  },
  amountLabel: {
    ...typography.small,
    color: colors.text.tertiary,
  },
  amountValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontVariant: ["tabular-nums"],
    textAlign: "right",
  },
  totalValue: {
    ...typography.cardAmount,
    color: colors.primary.main,
  },
  date: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
});
