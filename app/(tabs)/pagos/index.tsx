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
import { AppHeader } from "@/components/AppHeader";
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
import { useThemeColors, radius, spacing, typography, type Colors } from "@/theme";
import { formatCurrency } from "@/utils/currency";
import { formatDisplayDate } from "@/utils/dates";
import { formatGeneralPaymentCategoryLabel } from "../../utils/paymentLabels";

type Segment = "general" | "iva";
type GPFilter = "all" | GeneralPaymentCategory;

const CATEGORY_FILTERS: { value: GPFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "tag", label: "TAG" },
  { value: "accountant", label: "Contador" },
  { value: "savings", label: "Ahorro" },
];

export default function PagosScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
    <View style={styles.flex}>
      <ScreenContainer>
        <AppHeader title="Pagos" subtitle="Registros de pagos generales e IVA" />
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

      {segment === "general" ? (
        <FloatingActionButton
          accessibilityLabel="Registrar pago general"
          onPress={() => router.push("/pagos/general/nueva")}
        />
      ) : (
        <FloatingActionButton
          accessibilityLabel="Registrar pago de IVA"
          onPress={() => router.push("/pagos/iva/nueva")}
        />
      )}
    </View>
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
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRetry();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRetry]);

  const renderItem = useCallback(
    ({ item }: { item: GeneralPayment }) => (
      <AnimatedPressable
        accessibilityLabel={`Pago de ${formatGeneralPaymentCategoryLabel(item.category)} por ${formatCurrency(item.amount)}`}
        accessibilityRole="button"
        onPress={() =>
          router.push({
            pathname: "/pagos/general/[id]",
            params: { id: item.id },
          })
        }
      >
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.cardCategory}>
              {formatGeneralPaymentCategoryLabel(item.category)}
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
    ),
    [router],
  );

  const keyExtractor = useCallback((item: GeneralPayment) => item.id, []);

  const ItemSeparatorComponent = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const isInitialLoading = isLoading && payments.length === 0;

  if (isInitialLoading) {
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
        ItemSeparatorComponent={ItemSeparatorComponent}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            colors={[colors.primary.main]}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            tintColor={colors.primary.main}
          />
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
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
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRetry();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRetry]);

  const renderItem = useCallback(
    ({ item }: { item: TaxPayment }) => (
      <AnimatedPressable
        accessibilityLabel={`Pago de IVA periodo ${item.taxPeriod} por ${formatCurrency(item.amount)}`}
        accessibilityRole="button"
        onPress={() =>
          router.push({
            pathname: "/pagos/iva/[id]",
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
    ),
    [router],
  );

  const keyExtractor = useCallback((item: TaxPayment) => item.id, []);

  const ItemSeparatorComponent = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const isInitialLoading = isLoading && payments.length === 0;

  if (isInitialLoading) {
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
        ItemSeparatorComponent={ItemSeparatorComponent}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            colors={[colors.primary.main]}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            tintColor={colors.primary.main}
          />
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
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
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
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
      color: c.text.primary,
    },
    cardAmount: {
      ...typography.cardAmount,
      color: c.primary.main,
      fontVariant: ["tabular-nums"],
    },
    cardDate: {
      ...typography.caption,
      color: c.text.tertiary,
    },
    cardDesc: {
      ...typography.bodyMedium,
      color: c.text.secondary,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
    },
    skeletonList: {
      gap: spacing.gridGap,
    },
  });
