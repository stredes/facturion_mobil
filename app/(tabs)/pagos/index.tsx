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
import type {
  GeneralPayment,
  GeneralPaymentCategory,
} from "@/domain/GeneralPayment";
import type { TaxPayment } from "@/domain/TaxPayment";
import { useGeneralPayments } from "@/hooks/useGeneralPayments";
import { useTaxPayments } from "@/hooks/useTaxPayments";
import { colors, radius, spacing, typography } from "@/theme";
import { formatCurrency } from "@/utils/currency";
import { formatDisplayDate } from "@/utils/dates";

type Segment = "general" | "iva";
type GPFilter = "all" | GeneralPaymentCategory;

const CATEGORY_FILTERS: { value: GPFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "tag", label: "TAG" },
  { value: "accountant", label: "Contador" },
  { value: "savings", label: "Ahorro" },
];

function categoryLabel(category: GeneralPaymentCategory): string {
  switch (category) {
    case "tag":
      return "TAG";
    case "accountant":
      return "Contador";
    case "savings":
      return "Ahorro";
  }
}

export default function PagosScreen() {
  const [segment, setSegment] = useState<Segment>("general");
  const [categoryFilter, setCategoryFilter] = useState<GPFilter>("all");

  const generalFilters = useMemo(
    () => (categoryFilter === "all" ? undefined : { category: categoryFilter }),
    [categoryFilter],
  );

  const {
    payments: generalPayments,
    isLoading: generalLoading,
    error: generalError,
    refresh: generalRefresh,
  } = useGeneralPayments(generalFilters);

  const {
    payments: taxPayments,
    isLoading: taxLoading,
    error: taxError,
    refresh: taxRefresh,
  } = useTaxPayments();

  return (
    <ScreenContainer>
      <View style={styles.segmentRow}>
        <FilterChip
          label="Pagos generales"
          selected={segment === "general"}
          onPress={() => setSegment("general")}
        />
        <FilterChip
          label="IVA"
          selected={segment === "iva"}
          onPress={() => setSegment("iva")}
        />
      </View>

      {segment === "general" ? (
        <GeneralPaymentsView
          categoryFilter={categoryFilter}
          error={generalError}
          isLoading={generalLoading}
          onCategoryChange={setCategoryFilter}
          onRetry={generalRefresh}
          payments={generalPayments}
        />
      ) : (
        <TaxPaymentsView
          error={taxError}
          isLoading={taxLoading}
          onRetry={taxRefresh}
          payments={taxPayments}
        />
      )}
    </ScreenContainer>
  );
}

interface GeneralPaymentsViewProps {
  payments: GeneralPayment[];
  isLoading: boolean;
  error: string | null;
  categoryFilter: GPFilter;
  onCategoryChange: (filter: GPFilter) => void;
  onRetry: () => Promise<void>;
}

function GeneralPaymentsView({
  payments,
  isLoading,
  error,
  categoryFilter,
  onCategoryChange,
  onRetry,
}: GeneralPaymentsViewProps) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRetry();
    } finally {
      setRefreshing(false);
    }
  }, [onRetry]);

  const initialLoading = isLoading && payments.length === 0;

  if (initialLoading) {
    return (
      <View style={styles.flex}>
        <View style={styles.filters}>
          {CATEGORY_FILTERS.map((c) => (
            <FilterChip
              key={c.value}
              label={c.label}
              selected={categoryFilter === c.value}
              onPress={() => onCategoryChange(c.value)}
            />
          ))}
        </View>
        <View style={styles.skeletonList}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={80} />
          ))}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.flex}>
        <ErrorState message={error} onRetry={onRetry} />
      </View>
    );
  }

  if (payments.length === 0) {
    const isFiltered = categoryFilter !== "all";
    return (
      <View style={styles.flex}>
        <View style={styles.filters}>
          {CATEGORY_FILTERS.map((c) => (
            <FilterChip
              key={c.value}
              label={c.label}
              selected={categoryFilter === c.value}
              onPress={() => onCategoryChange(c.value)}
            />
          ))}
        </View>
        <View style={styles.centered}>
          <EmptyState
            title={isFiltered ? "Sin resultados" : "Aun no tienes pagos generales"}
            message={
              isFiltered
                ? "No hay pagos de esta categoria en el periodo seleccionado."
                : "Registra pagos de TAG, contador o ahorro."
            }
            actionLabel={isFiltered ? undefined : "Registrar pago general"}
            onAction={
              isFiltered
                ? undefined
                : () => router.push("/pagos/general/nueva")
            }
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.filters}>
        {CATEGORY_FILTERS.map((c) => (
          <FilterChip
            key={c.value}
            label={c.label}
            selected={categoryFilter === c.value}
            onPress={() => onCategoryChange(c.value)}
          />
        ))}
      </View>

      <FlatList<GeneralPayment>
        contentContainerStyle={styles.listContent}
        data={payments}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            colors={[colors.primary.main]}
            onRefresh={onRefresh}
            refreshing={refreshing}
            tintColor={colors.primary.main}
          />
        }
        renderItem={({ item }) => (
          <AnimatedPressable
            onPress={() =>
              router.push({
                pathname: "/pagos/general/editar/[id]",
                params: { id: item.id },
              })
            }
          >
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardCategory}>
                  {categoryLabel(item.category)}
                </Text>
                <Text style={styles.cardAmount}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
              <Text style={styles.cardDate}>
                {formatDisplayDate(item.paymentDate)}
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
        accessibilityLabel="Registrar pago general"
        onPress={() => router.push("/pagos/general/nueva")}
      />
    </View>
  );
}

interface TaxPaymentsViewProps {
  payments: TaxPayment[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => Promise<void>;
}

function TaxPaymentsView({
  payments,
  isLoading,
  error,
  onRetry,
}: TaxPaymentsViewProps) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRetry();
    } finally {
      setRefreshing(false);
    }
  }, [onRetry]);

  const initialLoading = isLoading && payments.length === 0;

  if (initialLoading) {
    return (
      <View style={styles.flex}>
        <View style={styles.skeletonList}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={80} />
          ))}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.flex}>
        <ErrorState message={error} onRetry={onRetry} />
      </View>
    );
  }

  if (payments.length === 0) {
    return (
      <View style={styles.flex}>
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Registrar pago de IVA"
            message="Registra el pago correspondiente a un periodo tributario."
            onAction={() => router.push("/pagos/iva/nueva")}
            title="Aun no tienes pagos de IVA"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <FlatList<TaxPayment>
        contentContainerStyle={styles.listContent}
        data={payments}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            colors={[colors.primary.main]}
            onRefresh={onRefresh}
            refreshing={refreshing}
            tintColor={colors.primary.main}
          />
        }
        renderItem={({ item }) => (
          <AnimatedPressable
            onPress={() =>
              router.push({
                pathname: "/pagos/iva/editar/[id]",
                params: { id: item.id },
              })
            }
          >
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardCategory}>Periodo {item.taxPeriod}</Text>
                <Text style={styles.cardAmount}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
              <Text style={styles.cardDate}>
                {formatDisplayDate(item.paymentDate)}
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
        accessibilityLabel="Registrar pago de IVA"
        onPress={() => router.push("/pagos/iva/nueva")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  segmentRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
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
