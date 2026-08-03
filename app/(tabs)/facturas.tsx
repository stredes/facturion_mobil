import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { InvoiceCard } from "@/components/InvoiceCard";
import { InvoiceCardSkeleton } from "@/components/LoadingSkeleton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SearchInput } from "@/components/SearchInput";
import { SectionTitle } from "@/components/SectionTitle";
import type { Invoice, InvoiceFilters } from "@/domain/Invoice";
import { useInvoices } from "@/hooks/useInvoices";
import { useThemeColors, spacing } from "@/theme";

export default function FacturasScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [search, setSearch] = useState("");
  const listRef = useRef<FlatList<Invoice>>(null);

  const filters: InvoiceFilters = useMemo(() => {
    return { searchText: search || undefined };
  }, [search]);

  const { invoices, isLoading, error, refresh } = useInvoices(filters);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  const handlePress = useCallback(
    (id: string) => {
      router.push({ pathname: "/facturas/[id]", params: { id } });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Invoice }) => (
      <InvoiceCard invoice={item} onPress={() => handlePress(item.id)} />
    ),
    [handlePress],
  );

  const keyExtractor = useCallback((item: Invoice) => item.id, []);

  const ListHeaderComponent = useMemo(
    () => (
      <View style={styles.headerSection}>
        <AppHeader title="Facturas" subtitle="Todas tus facturas registradas" />

        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por numero, cliente o descripcion"
        />

        <SectionTitle title={`Resultados (${invoices.length})`} />

        {isLoading ? (
          <View style={styles.skeletonList}>
            {Array.from({ length: 4 }).map((_, i) => (
              <InvoiceCardSkeleton key={i} />
            ))}
          </View>
        ) : null}
      </View>
    ),
    [search, invoices.length, isLoading],
  );

  if (error) {
    return (
      <View style={styles.wrapper}>
        <ScreenContainer>
          <AppHeader title="Facturas" subtitle="Todas tus facturas registradas" />
          <View style={styles.centeredBody}>
            <ErrorState message={error} onRetry={refresh} />
          </View>
        </ScreenContainer>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScreenContainer>
        {!isLoading && invoices.length === 0 ? (
          <View style={styles.centeredBody}>
            <AppHeader title="Facturas" subtitle="Todas tus facturas registradas" />
            {search ? (
              <>
                <SearchInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Buscar por numero, cliente o descripcion"
                />
                <EmptyState
                  title="Sin resultados"
                  message="No hay facturas que coincidan con tu busqueda"
                  actionLabel="Limpiar busqueda"
                  onAction={() => setSearch("")}
                />
              </>
            ) : (
              <EmptyState
                title="Sin facturas"
                message="No hay facturas registradas aun"
                actionLabel="Crear factura"
                onAction={() => router.push("/facturas/nueva")}
              />
            )}
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={isLoading ? [] : invoices}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListHeaderComponent={ListHeaderComponent}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                colors={[colors.primary.main]}
                onRefresh={onRefresh}
                refreshing={isRefreshing}
                tintColor={colors.primary.main}
              />
            }
          />
        )}
      </ScreenContainer>

      <FloatingActionButton
        onPress={() => router.push("/facturas/nueva")}
        accessibilityLabel="Crear factura"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  headerSection: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  listContent: {
    paddingBottom: 120,
  },
  separator: {
    height: spacing.gridGap,
  },
  skeletonList: {
    gap: spacing.gridGap,
  },
  centeredBody: {
    flex: 1,
    justifyContent: "center",
  },
});
