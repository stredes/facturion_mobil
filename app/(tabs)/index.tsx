import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { EmptyState } from "../../src/components/EmptyState";
import { FloatingActionButton } from "../../src/components/FloatingActionButton";
import { SummaryCard } from "../../src/components/SummaryCard";
import { useInvoiceSummary } from "../../src/hooks/useInvoiceSummary";
import { formatCurrency } from "../../src/utils/currency";

export default function HomeScreen() {
  const router = useRouter();
  const { summary, isLoading, error } = useInvoiceSummary();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Factrion</Text>
          <Text style={styles.subtitle}>Facturas Don Pollo</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/facturas/nueva")}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={styles.primaryButtonText}>Nueva factura</Text>
        </Pressable>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#0E7490" />
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!isLoading && summary.invoiceCount === 0 ? (
          <EmptyState
            message="Crea una factura para ver totales y saldos."
            title="No hay facturas"
          />
        ) : (
          <View style={styles.grid}>
            <SummaryCard
              label="Total neto"
              value={formatCurrency(summary.totalNetAmount)}
            />
            <SummaryCard
              label="Total IVA"
              value={formatCurrency(summary.totalTaxAmount)}
            />
            <SummaryCard
              label="Total facturado"
              tone="strong"
              value={formatCurrency(summary.totalInvoiceAmount)}
            />
            <SummaryCard
              label="Pago IVA"
              value={formatCurrency(summary.totalTaxPayment)}
            />
            <SummaryCard
              label="TAG"
              value={formatCurrency(summary.totalTagAmount)}
            />
            <SummaryCard
              label="Contador"
              value={formatCurrency(summary.totalAccountantAmount)}
            />
            <SummaryCard
              label="Ahorro"
              value={formatCurrency(summary.totalSavingsAmount)}
            />
            <SummaryCard
              label="Restante"
              tone="strong"
              value={formatCurrency(summary.totalRemainingAmount)}
            />
            <SummaryCard
              label="Cantidad de facturas"
              value={String(summary.invoiceCount)}
            />
          </View>
        )}
      </ScrollView>

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
    gap: 18,
    padding: 18,
    paddingBottom: 110,
  },
  header: {
    gap: 4,
  },
  title: {
    color: "#102A43",
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    color: "#52606D",
    fontSize: 15,
    fontWeight: "700",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0E7490",
    borderRadius: 8,
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  loading: {
    paddingVertical: 20,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pressed: {
    opacity: 0.72,
  },
});
