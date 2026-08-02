import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { PieChart3D } from "@/components/PieChart3D";

import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SummaryCard } from "@/components/SummaryCard";
import { SectionTitle } from "@/components/SectionTitle";
import { InvoiceCard } from "@/components/InvoiceCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { LoadingState } from "@/components/LoadingState";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { useInvoices } from "@/hooks/useInvoices";
import { useGeneralPayments } from "@/hooks/useGeneralPayments";
import { useRetentions } from "@/hooks/useRetentions";
import { colors } from "@/theme";
import { RETENTION_CATEGORIES } from "@/utils/retentionLabels";

export default function HomeScreen() {
  const router = useRouter();
  const { invoices, isLoading, error, refresh } = useInvoices();
  const { summary: generalSummary } = useGeneralPayments();
  const { summary: retentionSummary } = useRetentions();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

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
        <ErrorState message={error} onRetry={refresh} />
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
  const totalTax = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
  const totalRemaining = invoices.reduce((sum, inv) => {
    const remaining = inv.totalAmount - inv.taxPayment - inv.tagAmount - inv.accountantAmount - inv.savingsAmount;
    return sum + remaining;
  }, 0);
  const totalTag = invoices.reduce((sum, inv) => sum + inv.tagAmount, 0);
  const totalAccountant = invoices.reduce((sum, inv) => sum + inv.accountantAmount, 0);
  const totalSavings = invoices.reduce((sum, inv) => sum + inv.savingsAmount, 0);
  const totalTaxPayment = invoices.reduce((sum, inv) => sum + inv.taxPayment, 0);

  // Acumulaciones: facturado + retencion - pagos
  const sobranteIva =
    totalTax - totalTaxPayment + retentionSummary.totalTax;
  const tagBalance =
    totalTag + retentionSummary.totalTag - generalSummary.totalTag;
  const accountantBalance =
    totalAccountant +
    retentionSummary.totalAccountant -
    generalSummary.totalAccountant;
  const savingsBalance =
    totalSavings +
    retentionSummary.totalSavings -
    generalSummary.totalSavings;

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
        data: sortedMonths.map(([, data]) => data.tax / 1000000),
        color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ["IVA"],
  };

  // Datos para grafico de distribucion (una sola torta con las acumulaciones)
  const pieData = [
    { name: "Sobrante IVA", value: sobranteIva, color: colors.primary.main },
    { name: "Saldo TAG", value: tagBalance, color: colors.status.info },
    { name: "Saldo Contador", value: accountantBalance, color: colors.status.success },
    { name: "Saldo Ahorro", value: savingsBalance, color: colors.status.warning },
    { name: "Restante", value: invoices.reduce((s, i) => s + (i.totalAmount - i.taxPayment - i.tagAmount - i.accountantAmount - i.savingsAmount), 0), color: colors.status.error },
  ].filter((d) => d.value > 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const retentionValues: Record<string, number> = {
    tax: retentionSummary.totalTax,
    tag: retentionSummary.totalTag,
    accountant: retentionSummary.totalAccountant,
    savings: retentionSummary.totalSavings,
  };

  function formatMonthKey(dateStr: string) {
    const [year, month] = dateStr.split("-");
    return `${year}-${month}`;
  }

  function formatMonthLabel(monthKey: string) {
    const [year, month] = monthKey.split("-");
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
  }

  return (
    <ScreenContainer>
      <ScrollView
        refreshControl={
          <RefreshControl
            colors={[colors.primary.main]}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            tintColor={colors.primary.main}
          />
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
                backgroundColor: "#FFFFFF",
                backgroundGradientFrom: "#FFFFFF",
                backgroundGradientTo: "#FFFFFF",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: 6,
                  strokeWidth: 2,
                  stroke: "#000000",
                },
              }}
              style={styles.chart}
            />
          </View>
        </View>

        {/* Seccion IVA */}
        <SectionTitle title="IVA" />
        <View style={styles.summarySection}>
          <SummaryCard
            label="IVA Total"
            value={formatCurrency(totalTax)}
            icon="📋"
          />
          <SummaryCard
            label="IVA Pagado"
            value={formatCurrency(totalTaxPayment)}
            icon="✅"
            tone="warning"
          />
          <SummaryCard
            label="IVA Sobrante"
            value={formatCurrency(sobranteIva)}
            icon="💰"
            tone="strong"
          />
        </View>

        {/* Seccion Pagos extras */}
        <SectionTitle title="Pagos extras" />
        <View style={styles.summarySection}>
          <SummaryCard
            label="Saldo TAG"
            value={formatCurrency(tagBalance)}
            icon="🏷️"
          />
          <SummaryCard
            label="Saldo Contador"
            value={formatCurrency(accountantBalance)}
            icon="📊"
          />
        </View>

        {/* Seccion Ahorro */}
        <SectionTitle title="Ahorro" />
        <View style={styles.summarySection}>
          <SummaryCard
            label="Saldo Ahorro"
            value={formatCurrency(savingsBalance)}
            icon="💚"
          />
        </View>

        {/* Seccion Retencion */}
        <SectionTitle title="Retención" />
        <View style={styles.summarySection}>
          {RETENTION_CATEGORIES.map((category) => (
            <SummaryCard
              key={category.value}
              label={category.label}
              value={formatCurrency(retentionValues[category.value])}
              icon="🔖"
            />
          ))}
        </View>
        <AnimatedPressable
          accessibilityLabel="Ver todas las retenciones"
          accessibilityRole="button"
          onPress={() => router.push("/retenciones")}
          style={styles.retentionLink}
        >
          <Text style={styles.retentionLinkText}>Ver todas las retenciones</Text>
          <Text style={styles.retentionLinkArrow}>›</Text>
        </AnimatedPressable>

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
          <EmptyState
            actionLabel="Crear factura"
            message="Registra tu primera factura para comenzar"
            onAction={() => router.push("/facturas/nueva")}
            title="Aun no tienes facturas"
          />
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
  retentionLink: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  retentionLinkText: {
    color: colors.primary.main,
    fontSize: 15,
    fontWeight: "600",
  },
  retentionLinkArrow: {
    color: colors.text.tertiary,
    fontSize: 20,
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
});
