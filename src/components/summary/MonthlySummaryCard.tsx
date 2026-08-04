import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography, useTheme, type Colors } from "../../theme";
import { formatCurrency, formatCurrencyCompact } from "../../utils/currency";
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
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isTotalExpanded, setIsTotalExpanded] = useState(false);

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

      <Pressable
        accessibilityHint="Toca para ver el monto exacto o contraer"
        accessibilityLabel={`Facturado: ${formatCurrency(summary.totalAmount)}`}
        accessibilityRole="button"
        accessibilityState={{ expanded: isTotalExpanded }}
        onPress={() => setIsTotalExpanded((prev) => !prev)}
        style={({ pressed }) => [
          styles.summaryCard,
          shadows.card,
          isTotalExpanded && styles.summaryCardExpanded,
          pressed && styles.summaryCardPressed,
        ]}
      >
        <Text style={styles.summaryLabel}>Facturado</Text>
        <Text
          adjustsFontSizeToFit
          ellipsizeMode="tail"
          minimumFontScale={0.55}
          numberOfLines={1}
          style={[
            styles.summaryValue,
            isTotalExpanded
              ? styles.summaryValueExpanded
              : { fontSize: isSmallScreen ? 23 : 26 },
          ]}
        >
          {isTotalExpanded
            ? formatCurrency(summary.totalAmount)
            : formatCurrencyCompact(summary.totalAmount)}
        </Text>
      </Pressable>

      {isExpanded ? (
        <View style={styles.grid}>
          <SummaryCard label="Neto" value={summary.netAmount} />
          <SummaryCard
            label="IVA generado"
            value={summary.taxAmount}
          />
          <SummaryCard label="TAG" value={summary.tagAmount} />
          <SummaryCard
            label="Contador"
            value={summary.accountantAmount}
          />
          <SummaryCard
            label="Ahorro"
            value={summary.savingsAmount}
          />
          <SummaryCard
            label="IVA pagado"
            value={summary.paidTax}
          />
          <SummaryCard
            label={summary.vatReserveOverpaid ? "Exceso IVA" : "Reserva IVA"}
            value={Math.abs(summary.vatReserve)}
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
    summaryCardExpanded: {
      minHeight: 170,
    },
    summaryCardPressed: {
      transform: [{ scale: 0.99 }],
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
    summaryValueExpanded: {
      fontSize: 36,
      lineHeight: 44,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.gridGap,
    },
  });
