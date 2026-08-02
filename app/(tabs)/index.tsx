import { useRouter } from "expo-router";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { PieChart3D } from "@/components/PieChart3D";

import { AppHeader } from "@/components/AppHeader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SummaryCard } from "@/components/SummaryCard";
import { SectionTitle } from "@/components/SectionTitle";
import { InvoiceCard } from "@/components/InvoiceCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { LoadingState } from "@/components/LoadingState";
import { useInvoices } from "@/hooks/useInvoices";
import { colors } from "@/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { invoices, isLoading, error, refresh } = useInvoices();

  if (isLoading) {
    return (
      <ScreenContainer>
        <AppHeader title="Facturiion" subtitle="Control de tus facturas" />
        <LoadingState message="Cargando facturas..." />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <AppHeader title="Facturiion" subtitle="Control de tus facturas" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Calculos globales
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const pendingAmount = invoices
    .filter((inv) => !inv.paymentDate)
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const paidAmount = invoices
    .filter((inv) => inv.paymentDate)
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalNet = invoices.reduce((sum, inv) => sum + inv.netAmount, 0);
  const totalTax = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
  const totalRemaining = invoices.reduce((sum, inv) => {
    const remaining = inv.totalAmount - inv.taxPayment - inv.tagAmount - inv.accountantAmount - inv.savingsAmount;
    return sum + remaining;
  }, 0);
  const totalTag = invoices.reduce((sum, inv) => sum + inv.tagAmount, 0);
  const totalAccountant = invoices.reduce((sum, inv) => sum + inv.accountantAmount, 0);
  const totalSavings = invoices.reduce((sum, inv) => sum + inv.savingsAmount, 0);

  // Datos para grafico mensual (ultimos 6 meses)
  const monthlyData = invoices.reduce((acc, inv) => {
    const monthKey = formatMonthKey(inv.invoiceDate);
    if (!acc[monthKey]) {
      acc[monthKey] = { net: 0, tax: 0, total: 0, count: 0 };
    }
    acc[monthKey].net += inv.netAmount;
    acc[monthKey].tax += inv.taxAmount;
    acc[monthKey].total += inv.totalAmount;
    acc[monthKey].count += 1;
    return acc;
  }, {} as Record<string, { net: number; tax: number; total: number; count: number }>);

  const sortedMonths = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);

  const chartData = {
    labels: sortedMonths.map(([month]) => formatMonthLabel(month)),
    datasets: [
      {
        data: sortedMonths.map(([, data]) => data.total / 1000000),
        color: (opacity = 1) => `rgba(10, 76, 107, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: sortedMonths.map(([, data]) => data.net / 1000000),
        color: (opacity = 1) => `rgba(95, 180, 217, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ["Total", "Neto"],
  };

  // Datos para grafico de distribucion
  const totalDistributed = totalTag + totalAccountant + totalSavings;
  const pieData = totalDistributed > 0 ? [
    { name: "TAG", value: totalTag, color: colors.status.info },
    { name: "Contador", value: totalAccountant, color: colors.status.success },
    { name: "Ahorro", value: totalSavings, color: colors.status.warning },
    { name: "Pago IVA", value: invoices.reduce((s, i) => s + i.taxPayment, 0), color: colors.primary.main },
    { name: "Restante", value: invoices.reduce((s, i) => s + (i.totalAmount - i.taxPayment - i.tagAmount - i.accountantAmount - i.savingsAmount), 0), color: colors.status.error },
  ].filter(d => d.value > 0) : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonthKey = (dateStr: string) => {
    const [year, month] = dateStr.split("-");
    return `${year}-${month}`;
  };

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
  };

  return (
    <ScreenContainer>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => refresh()} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <AppHeader title="Facturiion" subtitle="Control de tus facturas" />

        {/* Tarjeta principal - Total facturado */}
        <View style={styles.mainCard}>
          <Text style={styles.mainLabel}>Total facturado</Text>
          <Text style={styles.mainAmount}>{formatCurrency(totalInvoiced)}</Text>
          <View style={styles.mainStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{invoices.length}</Text>
              <Text style={styles.statLabel}>Facturas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.status.success }]}>{formatCurrency(paidAmount)}</Text>
              <Text style={styles.statLabel}>Pagado</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.status.warning }]}>{formatCurrency(pendingAmount)}</Text>
              <Text style={styles.statLabel}>Pendiente</Text>
            </View>
          </View>
        </View>

        {/* Grafico mensual */}
        <View style={styles.chartCard}>
          <SectionTitle title="Evolución mensual" subtitle="Últimos 6 meses" />
          <View style={styles.chartContainer}>
            <BarChart
              data={chartData}
              width={350}
              height={220}
              yAxisLabel=""
              yAxisSuffix="M"
              chartConfig={{
                backgroundColor: "transparent",
                backgroundGradientFrom: "transparent",
                backgroundGradientTo: "transparent",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(10, 76, 107, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(102, 114, 126, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: 6,
                  strokeWidth: 2,
                  stroke: colors.primary.main,
                },
              }}
              style={styles.chart}
            />
          </View>
        </View>

        {/* Resumen principal - 4 tarjetas clave */}
        <View style={styles.summarySection}>
          <SummaryCard
            label="Neto"
            value={formatCurrency(totalNet)}
            icon="💰"
            tone="strong"
          />
          <SummaryCard
            label="IVA (19%)"
            value={formatCurrency(totalTax)}
            icon="📋"
          />
          <SummaryCard
            label="Restante"
            value={formatCurrency(
              invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.taxPayment - inv.tagAmount - inv.accountantAmount - inv.savingsAmount), 0)
            )}
            icon="💵"
            tone="strong"
          />
          <SummaryCard
            label="Pago IVA"
            value={formatCurrency(invoices.reduce((s, i) => s + i.taxPayment, 0))}
            icon="✅"
          />
        </View>

        {/* Distribuciones */}
        <View style={styles.distributionSection}>
          <SummaryCard
            label="TAG"
            value={formatCurrency(invoices.reduce((s, i) => s + i.tagAmount, 0))}
            icon="🏷️"
          />
          <SummaryCard
            label="Contador"
            value={formatCurrency(invoices.reduce((s, i) => s + i.accountantAmount, 0))}
            icon="📊"
          />
          <SummaryCard
            label="Ahorro"
            value={formatCurrency(invoices.reduce((s, i) => s + i.savingsAmount, 0))}
            icon="💚"
          />
        </View>

        {/* Grafico de distribucion */}
        {pieData.length > 0 && (
          <View style={styles.chartCard}>
            <SectionTitle title="Distribución de fondos" subtitle="Desglose de pagos y ahorros" />
            <View style={styles.pieContainer}>
              <PieChart3D data={pieData} size={350} innerRadius={90} depth={10} />
            </View>
          </View>
        )}

        <SectionTitle title="Facturas recientes" subtitle={`${invoices.length} facturas totales`} />

        {invoices.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aún no tienes facturas</Text>
            <Text style={styles.emptySubtext}>Registra tu primera factura para comenzar</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {invoices.slice(0, 5).map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onPress={() => router.push(`/facturas/${invoice.id}`)}
              />
            ))}
          </View>
        )}

        <FloatingActionButton
          onPress={() => router.push("/facturas/nueva")}
          accessibilityLabel="Crear factura"
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    textAlign: "center",
  },
  mainCard: {
    backgroundColor: "#0A4C6B",
    borderRadius: 16,
    marginBottom: 20,
    padding: 20,
  },
  mainLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.9,
  },
  mainAmount: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "700",
    marginTop: 4,
  },
  mainStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    padding: 16,
  },
  chartContainer: {
    alignItems: "center",
  },
  chart: {
    borderRadius: 16,
  },
  pieContainer: {
    alignItems: "center",
  },
  summarySection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  distributionSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  list: {
    gap: 12,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: "#1E293B",
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtext: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 8,
  },
});
