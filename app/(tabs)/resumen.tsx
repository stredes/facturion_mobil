import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "../../src/components/EmptyState";
import { SummaryCard } from "../../src/components/SummaryCard";
import { useInvoiceSummary } from "../../src/hooks/useInvoiceSummary";
import { formatCurrency } from "../../src/utils/currency";
import { formatMonthPeriod } from "../../src/utils/dates";

export default function SummaryScreen() {
  const { monthlySummary, isLoading, error } = useInvoiceSummary();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Resumen mensual</Text>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#0E7490" />
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!isLoading && monthlySummary.length === 0 ? (
        <EmptyState
          message="Registra una factura para construir el resumen."
          title="Sin resumen"
        />
      ) : null}

      {monthlySummary.map((summary) => (
        <View key={summary.period} style={styles.monthBlock}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>
              {formatMonthPeriod(summary.period)}
            </Text>
            <Text style={styles.monthCount}>{summary.invoiceCount}</Text>
          </View>

          <View style={styles.grid}>
            <SummaryCard label="Neto" value={formatCurrency(summary.netAmount)} />
            <SummaryCard label="IVA" value={formatCurrency(summary.taxAmount)} />
            <SummaryCard
              label="Total factura"
              tone="strong"
              value={formatCurrency(summary.totalAmount)}
            />
            <SummaryCard
              label="Pago IVA"
              value={formatCurrency(summary.taxPayment)}
            />
            <SummaryCard label="TAG" value={formatCurrency(summary.tagAmount)} />
            <SummaryCard
              label="Contador"
              value={formatCurrency(summary.accountantAmount)}
            />
            <SummaryCard
              label="Ahorro"
              value={formatCurrency(summary.savingsAmount)}
            />
            <SummaryCard
              label="Restante"
              tone="strong"
              value={formatCurrency(summary.remainingAmount)}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    padding: 18,
    paddingBottom: 34,
  },
  title: {
    color: "#102A43",
    fontSize: 28,
    fontWeight: "900",
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
  monthBlock: {
    gap: 12,
  },
  monthHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  monthTitle: {
    color: "#102A43",
    flex: 1,
    fontSize: 19,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  monthCount: {
    backgroundColor: "#EAF6F8",
    borderRadius: 8,
    color: "#155E75",
    fontSize: 13,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
});
