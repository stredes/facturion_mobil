import { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ScreenContainer } from "@/components/ScreenContainer";
import { MonthlySummaryCard } from "@/components/summary/MonthlySummaryCard";
import { MonthlySummarySkeleton } from "@/components/summary/MonthlySummarySkeleton";
import { useMonthlySummary } from "@/hooks/useMonthlySummary";
import type { CombinedMonth } from "@/utils/monthlySummary";
import { useThemeColors, spacing } from "@/theme";

export default function SummaryScreen() {
  const { combined, isLoading, error, refresh } = useMonthlySummary();
  const colors = useThemeColors();
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(
    new Set(),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

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
    ({ item }: { item: CombinedMonth }) => (
      <MonthlySummaryCard
        summary={item}
        isExpanded={expandedPeriods.has(item.period)}
        isSmallScreen={isSmallScreen}
        onToggle={() => toggleExpand(item.period)}
      />
    ),
    [expandedPeriods, isSmallScreen, toggleExpand],
  );

  const keyExtractor = useCallback((item: CombinedMonth) => item.period, []);

  const ItemSeparatorComponent = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  if (error) {
    return (
      <ScreenContainer>
        <AppHeader title="Resumen" subtitle="Facturacion y pagos por mes" />
        <ErrorState message={error} onRetry={refresh} />
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer scrollable>
        <AppHeader title="Resumen" subtitle="Facturacion y pagos por mes" />
        <MonthlySummarySkeleton />
      </ScreenContainer>
    );
  }

  if (combined.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Resumen" subtitle="Facturacion y pagos por mes" />
        <EmptyState
          title="Sin resumen"
          message="Registra una factura para construir el resumen."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader title="Resumen" subtitle="Facturacion y pagos por mes" />
      <FlatList
        data={combined}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparatorComponent}
        refreshControl={
          <RefreshControl
            colors={[colors.primary.main]}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            tintColor={colors.primary.main}
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 120,
  },
  separator: {
    height: spacing.lg,
  },
});
