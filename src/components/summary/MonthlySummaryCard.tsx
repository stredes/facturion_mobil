import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, shadows, spacing, typography, useThemeColors, type Colors } from "../../theme";
import { formatCurrencyCompact } from "../../utils/currency";
import { formatMonthPeriod } from "../../utils/dates";
import type { CombinedMonth } from "../../utils/monthlySummary";
import { SummaryCard } from "../SummaryCard";

interface MonthlySummaryCardProps {
  summary: CombinedMonth;
  isExpanded: boolean;
  isSmallScreen: boolean;
  onToggle: () => void;
}

export function MonthlySummaryCard({
  summary,
  isExpanded,
  isSmallScreen,
  onToggle,
}: MonthlySummaryCardProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.monthBlock}>
      <Pressable
        accessibilityLabel={`${isExpanded ? "Contraer" : "Expandir"} resumen de ${formatMonthPeriod(summary.period)}`}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        onPress={onToggle}
        style={styles.monthHeader}
      >
        <Text style={styles.monthTitle}>
          {formatMonthPeriod(summary.period)}
        </Text>
        <View style={styles.monthRight}>
          {summary.invoiceCount > 0 ? (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {summary.invoiceCount}{" "}
                {summary.invoiceCount === 1 ? "factura" : "facturas"}
              </Text>
            </View>
          ) : null}
          <Text style={styles.expandIcon}>
            {isExpanded ? "\u25B2" : "\u25BC"}
          </Text>
        </View>
      </Pressable>

      <View style={[styles.summaryCard, shadows.card]}>
        <Text style={styles.summaryLabel}>Facturado</Text>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          numberOfLines={1}
          style={[styles.summaryValue, { fontSize: isSmallScreen ? 23 : 26 }]}
        >
          {formatCurrencyCompact(summary.totalAmount)}
        </Text>
      </View>

      {isExpanded ? (
        <View style={styles.grid}>
          <SummaryCard label="Neto" value={formatCurrencyCompact(summary.netAmount)} />
          <SummaryCard
            label="IVA generado"
            value={formatCurrencyCompact(summary.taxAmount)}
          />
          <SummaryCard label="TAG" value={formatCurrencyCompact(summary.tagAmount)} />
          <SummaryCard
            label="Contador"
            value={formatCurrencyCompact(summary.accountantAmount)}
          />
          <SummaryCard
            label="Ahorro"
            value={formatCurrencyCompact(summary.savingsAmount)}
          />
          <SummaryCard
            label="IVA pagado"
            value={formatCurrencyCompact(summary.paidTax)}
          />
          <SummaryCard
            label={summary.vatReserveOverpaid ? "Exceso IVA" : "Reserva IVA"}
            value={formatCurrencyCompact(Math.abs(summary.vatReserve))}
            tone={summary.vatReserveOverpaid ? "error" : "strong"}
          />
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    monthBlock: {
      gap: spacing.md,
    },
    monthHeader: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    monthTitle: {
      ...typography.sectionTitle,
      color: c.text.primary,
      textTransform: "capitalize",
      flex: 1,
      minWidth: 0,
    },
    monthRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      flexShrink: 0,
    },
    countBadge: {
      backgroundColor: c.primary.light,
      borderRadius: radius.badge,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
    },
    countText: {
      ...typography.small,
      fontWeight: "600",
      color: c.primary.main,
    },
    expandIcon: {
      fontSize: 12,
      color: c.text.tertiary,
    },
    summaryCard: {
      backgroundColor: c.primary.main,
      borderRadius: radius.card,
      gap: spacing.xxs,
      minHeight: 128,
      padding: spacing.cardPadding,
    },
    summaryLabel: {
      ...typography.label,
      color: c.text.inverse,
      opacity: 0.9,
    },
    summaryValue: {
      ...typography.primaryAmount,
      color: c.text.inverse,
      marginTop: spacing.xxs,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.gridGap,
    },
  });
