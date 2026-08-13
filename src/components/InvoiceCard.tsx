import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Invoice } from "../domain/Invoice";
import { radius, spacing, typography, useTheme, type Colors } from "../theme";
import { formatCurrency } from "../utils/currency";
import { formatDisplayDate } from "../utils/dates";
import { AnimatedPressable } from "./AnimatedPressable";
import { StatusBadge } from "./StatusBadge";

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: () => void;
}

export function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <AnimatedPressable
      accessibilityLabel={`Factura ${invoice.invoiceNumber} de ${invoice.clientName}`}
      accessibilityRole="button"
      onPress={onPress}
    >
      <View style={[styles.card, shadows.card]}>
        <View style={styles.accent} />

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text numberOfLines={1} style={styles.title}>
              N. {invoice.invoiceNumber}
            </Text>
            <Text numberOfLines={1} style={styles.client}>
              {invoice.clientName}
            </Text>
          </View>
          <StatusBadge
            label={invoice.status === "paid" ? "Pagada" : "Pendiente"}
            status={invoice.status === "paid" ? "paid" : "pending"}
          />
        </View>

        <View style={styles.amountRow}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Neto</Text>
            <Text
              adjustsFontSizeToFit
              ellipsizeMode="tail"
              minimumFontScale={0.6}
              numberOfLines={1}
              style={styles.amountValue}
            >
              {formatCurrency(invoice.netAmount)}
            </Text>
          </View>
          <View style={styles.amountDivider} />
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>IVA</Text>
            <Text
              adjustsFontSizeToFit
              ellipsizeMode="tail"
              minimumFontScale={0.6}
              numberOfLines={1}
              style={styles.amountValue}
            >
              {formatCurrency(invoice.taxAmount)}
            </Text>
          </View>
          <View style={styles.amountDivider} />
          <View style={[styles.amountItem, styles.amountItemTotal]}>
            <Text style={styles.amountLabel}>Total</Text>
            <Text
              adjustsFontSizeToFit
              ellipsizeMode="tail"
              minimumFontScale={0.6}
              numberOfLines={1}
              style={styles.totalValue}
            >
              {formatCurrency(invoice.totalAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.date}>{formatDisplayDate(invoice.invoiceDate)}</Text>
          <Text style={styles.chevron}>{"\u203A"}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.card,
      borderWidth: 1,
      gap: spacing.md,
      minHeight: 150,
      overflow: "hidden",
      padding: spacing.cardPadding,
    },
    accent: {
      backgroundColor: c.primary.main,
      borderRadius: radius.inner,
      bottom: spacing.cardPadding,
      opacity: 0.3,
      position: "absolute",
      top: spacing.cardPadding,
      width: 3,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    headerLeft: {
      flex: 1,
      gap: spacing.xxs,
      minWidth: 0,
    },
    title: {
      ...typography.cardTitle,
      color: c.text.primary,
    },
    client: {
      ...typography.bodyMedium,
      color: c.text.secondary,
    },
    amountRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.surface.secondary,
      borderRadius: radius.inner,
      padding: spacing.sm,
      gap: 0,
    },
    amountItem: {
      flex: 1,
      gap: spacing.xxs,
      minWidth: 0,
    },
    amountItemTotal: {
      flex: 1.3,
    },
    amountDivider: {
      width: 1,
      height: 24,
      backgroundColor: c.border.light,
      marginHorizontal: spacing.xs,
    },
    amountLabel: {
      ...typography.small,
      color: c.text.tertiary,
    },
    amountValue: {
      ...typography.bodyMedium,
      color: c.text.primary,
      fontVariant: ["tabular-nums"],
      textAlign: "right",
    },
    totalValue: {
      ...typography.cardAmount,
      color: c.primary.main,
    },
    footer: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    date: {
      ...typography.caption,
      color: c.text.tertiary,
    },
    chevron: {
      color: c.text.tertiary,
      fontSize: 18,
      lineHeight: 20,
    },
  });
