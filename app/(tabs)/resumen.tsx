import { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ScreenContainer } from "@/components/ScreenContainer";
import { MonthlySummaryCard } from "@/components/summary/MonthlySummaryCard";
import { MonthlySummarySkeleton } from "@/components/summary/MonthlySummarySkeleton";
import { useMonthlySummary } from "@/hooks/useMonthlySummary";
import { spacing } from "@/theme";

export default function SummaryScreen() {
  const { combined, isLoading, error, refresh } = useMonthlySummary();
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(
    new Set(),
  );
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

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
        <MonthlySummarySkeleton />
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
        keyExtractor={(item) => item.period}
        renderItem={({ item }) => (
          <MonthlySummaryCard
            summary={item}
            isExpanded={expandedPeriods.has(item.period)}
            isSmallScreen={isSmallScreen}
            onToggle={() => toggleExpand(item.period)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
