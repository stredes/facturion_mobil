import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, shadows, spacing, typography } from "../../theme";
import { formatCurrency } from "../../utils/currency";
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
          {formatCurrency(summary.totalAmount)}
        </Text>
      </View>

      {isExpanded ? (
        <View style={styles.grid}>
          <SummaryCard label="Neto" value={formatCurrency(summary.netAmount)} />
          <SummaryCard
            label="IVA generado"
            value={formatCurrency(summary.taxAmount)}
          />
          <SummaryCard label="TAG" value={formatCurrency(summary.tagAmount)} />
          <SummaryCard
            label="Contador"
            value={formatCurrency(summary.accountantAmount)}
          />
          <SummaryCard
            label="Ahorro"
            value={formatCurrency(summary.savingsAmount)}
          />
          <SummaryCard
            label="IVA pagado"
            value={formatCurrency(summary.paidTax)}
          />
          <SummaryCard
            label={summary.vatReserveOverpaid ? "Exceso IVA" : "Reserva IVA"}
            value={formatCurrency(Math.abs(summary.vatReserve))}
            tone={summary.vatReserveOverpaid ? "error" : "strong"}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: colors.text.primary,
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
    backgroundColor: colors.primary.light,
    borderRadius: radius.badge,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  countText: {
    ...typography.small,
    fontWeight: "600",
    color: colors.primary.main,
  },
  expandIcon: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  summaryCard: {
    backgroundColor: colors.primary.main,
    borderRadius: radius.card,
    gap: spacing.xxs,
    minHeight: 128,
    padding: spacing.cardPadding,
  },
  summaryLabel: {
    ...typography.label,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  summaryValue: {
    ...typography.primaryAmount,
    color: colors.text.inverse,
    marginTop: spacing.xxs,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.gridGap,
  },
});
