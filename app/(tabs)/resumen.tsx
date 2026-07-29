import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Skeleton } from "@/components/LoadingSkeleton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SummaryCard } from "@/components/SummaryCard";
import { useGeneralPaymentService, useInvoiceService, useTaxPaymentService } from "@/infrastructure/di/ServiceContext";
import { colors, radius, spacing, typography } from "@/theme";
import { formatCurrency } from "@/utils/currency";
import { formatMonthPeriod } from "@/utils/dates";

interface CombinedMonth {
  period: string;
  invoiceCount: number;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  tagAmount: number;
  accountantAmount: number;
  savingsAmount: number;
  paidTax: number;
  vatReserve: number;
  vatReserveOverpaid: boolean;
}

export default function SummaryScreen() {
  const invoiceService = useInvoiceService();
  const gpService = useGeneralPaymentService();
  const tpService = useTaxPaymentService();
  const [combined, setCombined] = useState<CombinedMonth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(
    new Set(),
  );
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [invMonths, gpMonths, tpMonths] = await Promise.all([
        invoiceService.getMonthlySummary(),
        gpService.getMonthlySummary(),
        tpService.getMonthlySummary(),
      ]);

      const gpMap = new Map(gpMonths.map((m) => [m.period, m]));
      const tpMap = new Map(tpMonths.map((m) => [m.period, m]));

      const allPeriods = new Set<string>();
      invMonths.forEach((m) => allPeriods.add(m.period));
      gpMonths.forEach((m) => allPeriods.add(m.period));
      tpMonths.forEach((m) => allPeriods.add(m.period));

      const result: CombinedMonth[] = Array.from(allPeriods)
        .map((period) => {
          const inv = invMonths.find((m) => m.period === period);
          const gp = gpMap.get(period);
          const tp = tpMap.get(period);
          const generatedTax = inv?.taxAmount ?? 0;
          const paidTax = tp?.paidTax ?? 0;
          const vatDiff = generatedTax - paidTax;

          return {
            period,
            invoiceCount: inv?.invoiceCount ?? 0,
            netAmount: inv?.netAmount ?? 0,
            taxAmount: generatedTax,
            totalAmount: inv?.totalAmount ?? 0,
            tagAmount: gp?.tagAmount ?? 0,
            accountantAmount: gp?.accountantAmount ?? 0,
            savingsAmount: gp?.savingsAmount ?? 0,
            paidTax,
            vatReserve: vatDiff > 0 ? vatDiff : 0,
            vatReserveOverpaid: vatDiff < 0,
          };
        })
        .sort((a, b) => b.period.localeCompare(a.period));

      setCombined(result);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudo cargar el resumen",
      );
    } finally {
      setIsLoading(false);
    }
  }, [invoiceService, gpService, tpService]);

  const toggleExpand = useCallback((period: string) => {
    setExpandedPeriods((prev) => {
      const next = new Set(prev);
      if (next.has(period)) {
        next.delete(period);
      } else {
        next.add(period);
      }
      return next;
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CombinedMonth }) => {
      const isExpanded = expandedPeriods.has(item.period);
      return (
        <MonthlyCard
          summary={item}
          isExpanded={isExpanded}
          isSmallScreen={isSmallScreen}
          onToggle={() => toggleExpand(item.period)}
        />
      );
    },
    [expandedPeriods, toggleExpand, isSmallScreen],
  );

  const keyExtractor = useCallback((item: CombinedMonth) => item.period, []);

  const ListHeaderComponent = useMemo(
    () =>
      isLoading ? (
        <View style={styles.skeletonList}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={styles.skeletonMonth}>
              <Skeleton width="50%" height={20} />
              <View style={styles.skeletonGrid}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <View key={j} style={styles.skeletonCard}>
                    <Skeleton width={40} height={12} />
                    <Skeleton width="80%" height={22} />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : null,
    [isLoading],
  );

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  if (error) {
    return (
      <ScreenContainer>
        <ErrorState message={error} onRetry={refresh} />
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer scrollable>
        {ListHeaderComponent}
      </ScreenContainer>
    );
  }

  if (combined.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Sin resumen"
          message="Registra una factura para construir el resumen."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={combined}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </ScreenContainer>
  );
}

function MonthlyCard({
  summary,
  isExpanded,
  isSmallScreen,
  onToggle,
}: {
  summary: CombinedMonth;
  isExpanded: boolean;
  isSmallScreen: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.monthBlock}>
      <Pressable
        accessibilityRole="button"
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

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Facturado</Text>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          numberOfLines={1}
          style={[
            styles.summaryValue,
            { fontSize: isSmallScreen ? 23 : 26 },
          ]}
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
          <SummaryCard
            label="TAG"
            value={formatCurrency(summary.tagAmount)}
          />
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
  listContent: {
    paddingBottom: 120,
  },
  separator: {
    height: spacing.lg,
  },
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
    borderRadius: radius.mainCard,
    gap: spacing.xxs,
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 128,
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
  skeletonList: {
    gap: spacing.xl,
  },
  skeletonMonth: {
    gap: spacing.md,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.gridGap,
  },
  skeletonCard: {
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.light,
    borderRadius: radius.card,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    gap: spacing.xs,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
});
