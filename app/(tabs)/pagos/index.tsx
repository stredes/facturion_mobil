import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { FilterChip } from "@/components/FilterChip";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Skeleton } from "@/components/LoadingSkeleton";
import { useGeneralPaymentService, useTaxPaymentService } from "@/infrastructure/di/ServiceContext";
import { colors, radius, spacing, typography } from "@/theme";
import { formatCurrency } from "@/utils/currency";
import { formatDisplayDate } from "@/utils/dates";

type Segment = "general" | "iva";
type ViewState = "loading" | "success" | "empty" | "error";

export default function PagosScreen() {
  const router = useRouter();
  const [segment, setSegment] = useState<Segment>("general");

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
        <GeneralPaymentsView />
      ) : (
        <IvaPaymentsView />
      )}
    </ScreenContainer>
  );
}

type GPFilter = "all" | "tag" | "accountant" | "savings";

function GeneralPaymentsView() {
  const router = useRouter();
  const service = useGeneralPaymentService();
  const [payments, setPayments] = useState<any[]>([]);
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<GPFilter>("all");

  const load = useCallback(async () => {
    try {
      setViewState("loading");
      setError(null);
      const filters = categoryFilter !== "all" ? { category: categoryFilter as any } : undefined;
      const rows = await service.getAll(filters);

      if (__DEV__) {
        console.log("[Pagos] general count:", rows.length, "filter:", categoryFilter);
      }

      setPayments(rows);
      setViewState(rows.length === 0 ? "empty" : "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar pagos generales";
      if (__DEV__) {
        console.error("[Pagos] general load failed:", err);
      }
      setError(msg);
      setViewState("error");
    }
  }, [service, categoryFilter]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const cats = useMemo(
    () => [
      { value: "all" as GPFilter, label: "Todas" },
      { value: "tag" as GPFilter, label: "TAG" },
      { value: "accountant" as GPFilter, label: "Contador" },
      { value: "savings" as GPFilter, label: "Ahorro" },
    ],
    [],
  );

  if (viewState === "loading") {
    return (
      <View style={styles.flex}>
        <View style={styles.filters}>
          {cats.map((c) => (
            <FilterChip key={c.value} label={c.label} selected={categoryFilter === c.value} onPress={() => {}} />
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

  if (viewState === "error") {
    return (
      <View style={styles.flex}>
        <ErrorState message={error ?? "Error desconocido"} onRetry={load} />
      </View>
    );
  }

  if (viewState === "empty") {
    return (
      <View style={styles.flex}>
        <View style={styles.filters}>
          {cats.map((c) => (
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
            title="Aun no tienes pagos generales"
            message="Registra pagos de TAG, contador o ahorro."
            actionLabel="Registrar pago general"
            onAction={() => router.push("/pagos/general/nueva")}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.filters}>
        {cats.map((c) => (
          <FilterChip
            key={c.value}
            label={c.label}
            selected={categoryFilter === c.value}
            onPress={() => setCategoryFilter(c.value)}
          />
        ))}
      </View>

      <FlatList
        data={payments}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
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
                  {item.category === "tag" ? "TAG" : item.category === "accountant" ? "Contador" : "Ahorro"}
                </Text>
                <Text style={styles.cardAmount}>{formatCurrency(item.amount)}</Text>
              </View>
              <Text style={styles.cardDate}>{formatDisplayDate(item.paymentDate)}</Text>
              {item.description ? (
                <Text numberOfLines={1} style={styles.cardDesc}>{item.description}</Text>
              ) : null}
            </View>
          </AnimatedPressable>
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={false}
        onRefresh={load}
      />

      <AnimatedPressable
        accessibilityRole="button"
        onPress={() => router.push("/pagos/general/nueva")}
        style={styles.fab}
      >
        <Text style={styles.fabText}>+</Text>
      </AnimatedPressable>
    </View>
  );
}

function IvaPaymentsView() {
  const router = useRouter();
  const service = useTaxPaymentService();
  const [payments, setPayments] = useState<any[]>([]);
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setViewState("loading");
      setError(null);
      const rows = await service.getAll();

      if (__DEV__) {
        console.log("[Pagos] IVA count:", rows.length);
      }

      setPayments(rows);
      setViewState(rows.length === 0 ? "empty" : "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar pagos de IVA";
      if (__DEV__) {
        console.error("[Pagos] IVA load failed:", err);
      }
      setError(msg);
      setViewState("error");
    }
  }, [service]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (viewState === "loading") {
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

  if (viewState === "error") {
    return (
      <View style={styles.flex}>
        <ErrorState message={error ?? "Error desconocido"} onRetry={load} />
      </View>
    );
  }

  if (viewState === "empty") {
    return (
      <View style={styles.flex}>
        <View style={styles.centered}>
          <EmptyState
            title="Aun no tienes pagos de IVA"
            message="Registra el pago correspondiente a un periodo tributario."
            actionLabel="Registrar pago de IVA"
            onAction={() => router.push("/pagos/iva/nueva")}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <FlatList
        data={payments}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
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
                <Text style={styles.cardCategory}>
                  Periodo {item.taxPeriod}
                </Text>
                <Text style={styles.cardAmount}>{formatCurrency(item.amount)}</Text>
              </View>
              <Text style={styles.cardDate}>{formatDisplayDate(item.paymentDate)}</Text>
              {item.description ? (
                <Text numberOfLines={1} style={styles.cardDesc}>{item.description}</Text>
              ) : null}
            </View>
          </AnimatedPressable>
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={false}
        onRefresh={load}
      />

      <AnimatedPressable
        accessibilityRole="button"
        onPress={() => router.push("/pagos/iva/nueva")}
        style={styles.fab}
      >
        <Text style={styles.fabText}>+</Text>
      </AnimatedPressable>
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
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 28,
    color: colors.text.inverse,
    lineHeight: 30,
  },
});
