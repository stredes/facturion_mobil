import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
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
import { useTaxPayments } from "@/hooks/useTaxPayments";
import { colors } from "@/theme";
import { RETENTION_CATEGORIES } from "@/utils/retentionLabels";

export default function HomeScreen() {
  const router = useRouter();
  const { invoices, isLoading: invoicesLoading, error: invoicesError, refresh: refreshInvoices } = useInvoices();
  const { payments: generalPayments, isLoading: gpLoading } = useGeneralPayments();
  const { retentions, isLoading: rLoading } = useRetentions();
  const { payments: taxPayments, isLoading: tpLoading } = useTaxPayments();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isLoading = invoicesLoading || gpLoading || rLoading || tpLoading;
  const error = invoicesError;

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshInvoices()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshInvoices]);

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
        <ErrorState message={error} onRetry={refreshInvoices} />
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

  const { summary: generalSummary } = useGeneralPayments();
  const { summary: retentionSummary } = useRetentions();

  // Acumulaciones globales
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

  // Serie acumulada de todos los balances (últimos 6 meses)
  const monthData: Record<string, Record<string, number>> = {};

  function add(date: string, key: string, value: number) {
    const month = formatMonthKey(date);
    if (!monthData[month]) monthData[month] = {};
    monthData[month][key] = (monthData[month][key] ?? 0) + value;
  }

  invoices.forEach((inv) => {
    add(inv.invoiceDate, "tax", inv.taxAmount);
    add(inv.invoiceDate, "tag", inv.tagAmount);
    add(inv.invoiceDate, "accountant", inv.accountantAmount);
    add(inv.invoiceDate, "savings", inv.savingsAmount);
  });
  taxPayments.forEach((p) => add(p.paymentDate, "taxPaid", p.amount));
  generalPayments.forEach((p) => add(p.paymentDate, `pay${p.category}`, p.amount));
  retentions.forEach((r) => add(r.retentionDate, `ret${r.category.charAt(0).toUpperCase() + r.category.slice(1)}`, r.amount));

  const months = Object.keys(monthData).sort();
  const series: Record<string, number[]> = {
    ivaGenerado: [],
    ivaPagado: [],
    sobrante: [],
    tag: [],
    accountant: [],
    savings: [],
  };
  let rTax = 0, rPaid = 0, rSobrante = 0, rTag = 0, rAcc = 0, rSav = 0;
  for (const key of months) {
    const d = monthData[key] ?? {};
    const tax = d.tax ?? 0;
    const paid = d.taxPaid ?? 0;
    const retTax = d.retTax ?? 0;
    const tag = (d.tag ?? 0) + (d.retTag ?? 0) - (d.payTag ?? 0);
    const acc = (d.accountant ?? 0) + (d.retAccountant ?? 0) - (d.payAccountant ?? 0);
    const sav = (d.savings ?? 0) + (d.retSavings ?? 0) - (d.paySavings ?? 0);
    rTax += tax;
    rPaid += paid;
    rSobrante += tax - paid + retTax;
    rTag += tag;
    rAcc += acc;
    rSav += sav;
    series.ivaGenerado.push(rTax);
    series.ivaPagado.push(rPaid);
    series.sobrante.push(rSobrante);
    series.tag.push(rTag);
    series.accountant.push(rAcc);
    series.savings.push(rSav);
  }

  const rgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const last6 = <T,>(arr: T[]) => arr.slice(-6);
  const inM = (v: number) => v / 1000000;

  const chartMonths = months.slice(-6);
  const chartData = {
    labels: chartMonths.map((m) => formatMonthLabel(m)),
    datasets: [
      { data: last6(series.ivaGenerado).map(inM), color: (o = 1) => rgba(colors.primary.main, o), strokeWidth: 2 },
      { data: last6(series.ivaPagado).map(inM), color: (o = 1) => rgba(colors.status.success, o), strokeWidth: 2 },
      { data: last6(series.sobrante).map(inM), color: (o = 1) => rgba(colors.status.warning, o), strokeWidth: 2 },
      { data: last6(series.tag).map(inM), color: (o = 1) => rgba(colors.status.info, o), strokeWidth: 2 },
      { data: last6(series.accountant).map(inM), color: (o = 1) => rgba("#8B5CF6", o), strokeWidth: 2 },
      { data: last6(series.savings).map(inM), color: (o = 1) => rgba("#10B981", o), strokeWidth: 2 },
    ],
    legend: ["IVA gen.", "IVA pag.", "Sobrante", "TAG", "Contador", "Ahorro"],
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

        {/* Grafico de acumulados */}
        <View style={styles.chartCard}>
          <SectionTitle title="Saldos acumulados" subtitle="Últimos 6 meses" />
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={350}
              height={260}
              yAxisSuffix="M"
              chartConfig={{
                backgroundColor: "#FFFFFF",
                backgroundGradientFrom: "#FFFFFF",
                backgroundGradientTo: "#FFFFFF",
                decimalPlaces: 0,
                color: (opacity = 1) => rgba(colors.text.tertiary, opacity),
                labelColor: (opacity = 1) => rgba("#334155", opacity),
                propsForDots: { r: "4" },
              }}
              style={styles.chart}
              bezier
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
