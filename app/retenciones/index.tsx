import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { FilterChip } from "@/components/FilterChip";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Skeleton } from "@/components/LoadingSkeleton";
import type { RetentionCategory } from "@/domain/Retention";
import { useRetentions } from "@/hooks/useRetentions";
import { colors, radius, spacing, typography } from "@/theme";
import { formatCurrency } from "@/utils/currency";
import { formatDisplayDate } from "@/utils/dates";
import { formatRetentionCategoryLabel } from "@/utils/retentionLabels";

type RetentionFilter = "all" | RetentionCategory;

const CATEGORY_FILTERS: { value: RetentionFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "tax", label: "IVA" },
  { value: "tag", label: "TAG" },
  { value: "accountant", label: "Contador" },
  { value: "savings", label: "Ahorro" },
];

export default function RetentionsScreen() {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState<RetentionFilter>("all");

  const filters = useMemo(
    () => (categoryFilter === "all" ? undefined : { category: categoryFilter }),
    [categoryFilter],
  );

  const {
    retentions,
    isLoading,
    error,
    refresh,
    remove,
  } = useRetentions(filters);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  const isInitialLoading = isLoading && retentions.length === 0;

  if (isInitialLoading) {
    return (
      <ScreenContainer>
        <View style={styles.filters}>
          {CATEGORY_FILTERS.map((c) => (
            <FilterChip
              key={c.value}
              label={c.label}
              selected={categoryFilter === c.value}
              onPress={() => setCategoryFilter(c.value)}
            />
          ))}
        </View>
        <View style={styles.skeletonList}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={80} />
          ))}
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <ErrorState message={error} onRetry={refresh} />
      </ScreenContainer>
    );
  }

  if (retentions.length === 0) {
    const isFiltered = categoryFilter !== "all";
    return (
      <ScreenContainer>
        <View style={styles.filters}>
          {CATEGORY_FILTERS.map((c) => (
            <FilterChip
              key={c.value}
              label={c.label}
              selected={categoryFilter === c.value}
              onPress={() => setCategoryFilter(c.value)}
            />
          ))}
        </View>
        <View style={styles.centered}>
          <EmptyState
            title={isFiltered ? "Sin resultados" : "Aun no tienes retenciones"}
            message={
              isFiltered
                ? "No hay retenciones de esta categoria."
                : "Registra retenciones para sumar a tus acumulaciones."
            }
            actionLabel={isFiltered ? undefined : "Registrar retencion"}
            onAction={
              isFiltered ? undefined : () => router.push("/retenciones/nueva")
            }
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.filters}>
        {CATEGORY_FILTERS.map((c) => (
          <FilterChip
            key={c.value}
            label={c.label}
            selected={categoryFilter === c.value}
            onPress={() => setCategoryFilter(c.value)}
          />
        ))}
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={retentions}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            colors={[colors.primary.main]}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            tintColor={colors.primary.main}
          />
        }
        renderItem={({ item }) => (
          <AnimatedPressable
            onPress={() =>
              router.push({
                pathname: "/retenciones/editar/[id]",
                params: { id: item.id },
              })
            }
          >
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardCategory}>
                  {formatRetentionCategoryLabel(item.category)}
                </Text>
                <Text style={styles.cardAmount}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
              <Text style={styles.cardDate}>
                {formatDisplayDate(item.retentionDate)}
              </Text>
              {item.description ? (
                <Text numberOfLines={1} style={styles.cardDesc}>
                  {item.description}
                </Text>
              ) : null}
            </View>
          </AnimatedPressable>
        )}
        showsVerticalScrollIndicator={false}
      />

      <FloatingActionButton
        accessibilityLabel="Registrar retencion"
        onPress={() => router.push("/retenciones/nueva")}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: 120,
  },
  separator: {
    height: spacing.gridGap,
  },
  card: {
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.light,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.cardPadding,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardCategory: {
    ...typography.cardTitle,
    color: colors.text.primary,
  },
  cardAmount: {
    ...typography.cardAmount,
    color: colors.primary.main,
    fontVariant: ["tabular-nums"],
  },
  cardDate: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  cardDesc: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
  },
  skeletonList: {
    gap: spacing.gridGap,
  },
});
