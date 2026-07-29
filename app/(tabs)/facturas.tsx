import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { EmptyState } from "../../src/components/EmptyState";
import { FloatingActionButton } from "../../src/components/FloatingActionButton";
import { InvoiceCard } from "../../src/components/InvoiceCard";
import type { PaymentStatusFilter } from "../../src/domain/Invoice";
import { useInvoices } from "../../src/hooks/useInvoices";

const PAYMENT_FILTERS: Array<{
  label: string;
  value: PaymentStatusFilter;
}> = [
  { label: "Todas", value: "all" },
  { label: "Pagadas", value: "paid" },
  { label: "Pendientes", value: "unpaid" },
];

export default function InvoicesScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatusFilter>("all");
  const { invoices, isLoading, error } = useInvoices({
    searchText,
    month,
    year,
    paymentStatus,
  });

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.container}
        data={invoices}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color="#0E7490" />
            </View>
          ) : (
            <EmptyState
              message="Ajusta la búsqueda o registra una nueva factura."
              title="Sin facturas"
            />
          )
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Facturas</Text>
            <TextInput
              accessibilityLabel="Buscar facturas"
              onChangeText={setSearchText}
              placeholder="Buscar por número, cliente o descripción"
              placeholderTextColor="#7C8794"
              style={styles.searchInput}
              value={searchText}
            />

            <View style={styles.filterRow}>
              <TextInput
                accessibilityLabel="Mes"
                keyboardType="number-pad"
                maxLength={2}
                onChangeText={(value) =>
                  setMonth(value.replace(/\D/g, "").slice(0, 2))
                }
                placeholder="Mes"
                placeholderTextColor="#7C8794"
                style={styles.filterInput}
                value={month}
              />
              <TextInput
                accessibilityLabel="Año"
                keyboardType="number-pad"
                maxLength={4}
                onChangeText={(value) =>
                  setYear(value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="Año"
                placeholderTextColor="#7C8794"
                style={styles.filterInput}
                value={year}
              />
            </View>

            <View style={styles.segmentedControl}>
              {PAYMENT_FILTERS.map((filter) => {
                const isActive = paymentStatus === filter.value;

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={filter.value}
                    onPress={() => setPaymentStatus(filter.value)}
                    style={[
                      styles.segment,
                      isActive ? styles.segmentActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        isActive ? styles.segmentTextActive : null,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        }
        renderItem={({ item }) => (
          <InvoiceCard
            invoice={item}
            onPress={() =>
              router.push({
                pathname: "/facturas/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <FloatingActionButton onPress={() => router.push("/facturas/nueva")} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F6F8FA",
    flex: 1,
  },
  container: {
    padding: 18,
    paddingBottom: 110,
  },
  header: {
    gap: 12,
    marginBottom: 16,
  },
  title: {
    color: "#102A43",
    fontSize: 28,
    fontWeight: "900",
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D9E2EC",
    borderRadius: 8,
    borderWidth: 1,
    color: "#102A43",
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
  },
  filterInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D9E2EC",
    borderRadius: 8,
    borderWidth: 1,
    color: "#102A43",
    flex: 1,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  segmentedControl: {
    backgroundColor: "#E9EFF5",
    borderRadius: 8,
    flexDirection: "row",
    padding: 4,
  },
  segment: {
    alignItems: "center",
    borderRadius: 6,
    flex: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  segmentActive: {
    backgroundColor: "#FFFFFF",
  },
  segmentText: {
    color: "#52606D",
    fontSize: 13,
    fontWeight: "800",
  },
  segmentTextActive: {
    color: "#0E7490",
  },
  separator: {
    height: 12,
  },
  loading: {
    paddingVertical: 32,
  },
  error: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FDBA74",
    borderRadius: 8,
    borderWidth: 1,
    color: "#C2410C",
    fontSize: 14,
    fontWeight: "700",
    padding: 14,
  },
});
