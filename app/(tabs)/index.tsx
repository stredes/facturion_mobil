import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { PieChart3D } from "@/components/PieChart3D";
import { QuickActions } from "@/components/QuickActions";

import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { HomeDashboardSkeleton } from "@/components/LoadingSkeleton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SummaryCard } from "@/components/SummaryCard";
import { SectionTitle } from "@/components/SectionTitle";
import { InvoiceCard } from "@/components/InvoiceCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { FilterChip } from "@/components/FilterChip";
import { useAuth } from "@/infrastructure/di/AuthContext";
import { useInvoices } from "@/hooks/useInvoices";
import { useGeneralPayments } from "@/hooks/useGeneralPayments";
import { useRetentions } from "@/hooks/useRetentions";
import { useTaxPayments } from "@/hooks/useTaxPayments";
import { useThemeColors, radius, spacing, typography, type Colors } from "@/theme";
import { RETENTION_CATEGORIES } from "@/utils/retentionLabels";
import { formatCurrency, formatCurrencyCompact } from "@/utils/currency";
import { buildMonthlyChartSummaries } from "@/utils/chartAnalytics";
import {
  calculateDashboardFundBalances,
  EXTRA_PAYMENT_BALANCE_CATEGORIES,
} from "@/utils/dashboardCategories";
import {
  buildMonthlyTaxBalances,
  calculateTaxBalance,
} from "@/utils/taxBalance";

const ICON_GLYPHS = {
  docs: "\u2A9A",
  check: "\u2714",
  cash: "\u29E9",
  tag: "\u29B6",
  chart: "\u29E8",
  savings: "\u2764",
  retention: "\u2A9B",
} as const;

const rgba = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

type ChartView = "invoicing" | "collections" | "tax";

const CHART_VIEWS: { key: ChartView; label: string; subtitle: string }[] = [
  { key: "invoicing", label: "Facturación", subtitle: "Neto, IVA y total" },
  { key: "collections", label: "Cobros", subtitle: "Facturado, pagado y pendiente" },
  { key: "tax", label: "IVA", subtitle: "Generado, pagado y saldo acumulado" },
];

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  return `${MONTH_LABELS[parseInt(month) - 1]} ${year.slice(2)}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(
    350,
    width - spacing.screenPadding * 2 - spacing.cardPadding * 2,
  );
  const {
    invoices,
    isLoading: invoicesLoading,
    error: invoicesError,
    refresh: refreshInvoices,
  } = useInvoices();
  const {
    payments: generalPayments,
    summary: generalSummary,
    isLoading: gpLoading,
    error: gpError,
    refresh: refreshGeneralPayments,
  } = useGeneralPayments();
  const {
    retentions,
    summary: retentionSummary,
    isLoading: rLoading,
    error: rError,
    refresh: refreshRetentions,
  } = useRetentions();
  const {
    payments: taxPayments,
    isLoading: tpLoading,
    error: tpError,
    refresh: refreshTaxPayments,
  } = useTaxPayments();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [totalExpanded, setTotalExpanded] = useState(false);
  const [chartView, setChartView] = useState<ChartView>("tax");

  const isLoading = invoicesLoading || gpLoading || rLoading || tpLoading;
  const error = invoicesError || gpError || rError || tpError;
  const hasAnyData =
    invoices.length > 0 ||
    generalPayments.length > 0 ||
    taxPayments.length > 0 ||
    retentions.length > 0;

  useEffect(() => {
    if (!isLoading && !error && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [error, isLoading, hasLoadedOnce]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshInvoices(),
        refreshGeneralPayments(),
        refreshRetentions(),
        refreshTaxPayments(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    refreshInvoices,
    refreshGeneralPayments,
    refreshRetentions,
    refreshTaxPayments,
  ]);

  const paidInvoices = useMemo(
    () => invoices.filter((inv) => inv.status === "paid"),
    [invoices],
  );

  const totals = useMemo(() => {
    const totalInvoiced = invoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0,
    );
    const pendingAmount = invoices
      .filter((inv) => inv.status !== "paid")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidAmount = paidInvoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0,
    );
    const totalTag = paidInvoices.reduce((sum, inv) => sum + inv.tagAmount, 0);
    const totalAccountant = paidInvoices.reduce(
      (sum, inv) => sum + inv.accountantAmount,
      0,
    );
    const totalSavings = paidInvoices.reduce(
      (sum, inv) => sum + inv.savingsAmount,
      0,
    );
    return {
      totalInvoiced,
      pendingAmount,
      paidAmount,
      totalTag,
      totalAccountant,
      totalSavings,
    };
  }, [invoices, paidInvoices]);

  const taxBalance = useMemo(
    () => calculateTaxBalance(invoices, taxPayments),
    [invoices, taxPayments],
  );
  const sobranteIva = taxBalance.balance;
  const ivaSobranteOverpaid = taxBalance.overpaid;

  const fundBalances = useMemo(
    () =>
      calculateDashboardFundBalances({
        invoiceTag: totals.totalTag,
        invoiceAccountant: totals.totalAccountant,
        invoiceSavings: totals.totalSavings,
        retentionTag: retentionSummary.totalTag,
        retentionAccountant: retentionSummary.totalAccountant,
        retentionSavings: retentionSummary.totalSavings,
        paidTag: generalSummary.totalTag,
        paidAccountant: generalSummary.totalAccountant,
        paidSavings: generalSummary.totalSavings,
      }),
    [totals, retentionSummary, generalSummary],
  );

  const monthlySummary = useMemo(
    () => buildMonthlyChartSummaries(invoices),
    [invoices],
  );
  const taxMonths = useMemo(
    () => buildMonthlyTaxBalances(invoices, taxPayments),
    [invoices, taxPayments],
  );
  const chartMonths = useMemo(
    () => (chartView === "tax" ? taxMonths : monthlySummary),
    [chartView, taxMonths, monthlySummary],
  );

  const chartData = useMemo(() => {
    const toMillions = (values: number[]) => values.map((v) => v / 1000000);
    const makeSeries = (data: number[], color: string) => ({
      data: toMillions(data),
      color: (opacity = 1) => rgba(color, opacity),
      strokeWidth: 2,
    });
    const labels = chartMonths.map((month) => formatMonthLabel(month.period));

    if (chartView === "invoicing") {
      return {
        labels,
        datasets: [
          makeSeries(monthlySummary.map((m) => m.netAmount), colors.primary.main),
          makeSeries(monthlySummary.map((m) => m.taxAmount), colors.status.warning),
          makeSeries(monthlySummary.map((m) => m.totalAmount), colors.status.success),
        ],
      };
    }
    if (chartView === "collections") {
      return {
        labels,
        datasets: [
          makeSeries(monthlySummary.map((m) => m.totalAmount), colors.primary.main),
          makeSeries(monthlySummary.map((m) => m.paidAmount), colors.status.success),
          makeSeries(monthlySummary.map((m) => m.pendingAmount), colors.status.warning),
        ],
      };
    }
    return {
      labels,
      datasets: [
        makeSeries(taxMonths.map((m) => m.generatedTax), colors.series.ivaGenerado),
        makeSeries(taxMonths.map((m) => m.paidTax), colors.series.ivaPagado),
        makeSeries(taxMonths.map((m) => m.balance), colors.series.sobrante),
      ],
    };
  }, [chartView, chartMonths, colors, monthlySummary, taxMonths]);

  const chartLegend = useMemo(() => {
    if (chartView === "invoicing") {
      return [
        { name: "Neto", color: colors.primary.main },
        { name: "IVA", color: colors.status.warning },
        { name: "Total", color: colors.status.success },
      ];
    }
    if (chartView === "collections") {
      return [
        { name: "Facturado", color: colors.primary.main },
        { name: "Pagado", color: colors.status.success },
        { name: "Pendiente", color: colors.status.warning },
      ];
    }
    return [
      { name: "IVA generado", color: colors.series.ivaGenerado },
      { name: "IVA pagado", color: colors.series.ivaPagado },
      { name: "Saldo IVA", color: colors.series.sobrante },
    ];
  }, [chartView, colors]);

  const pieData = useMemo(
    () =>
      [
        { name: "Sobrante IVA", value: sobranteIva, color: colors.primary.main },
        { name: "Saldo TAG", value: fundBalances.tag, color: colors.status.info },
        { name: "Saldo Contador", value: fundBalances.accountant, color: colors.status.success },
        { name: "Saldo Ahorro", value: fundBalances.savings, color: colors.status.warning },
        {
          name: "Restante",
          value: paidInvoices.reduce(
            (sum, inv) =>
              sum +
              (inv.totalAmount -
                inv.taxPayment -
                inv.tagAmount -
                inv.accountantAmount -
                inv.savingsAmount),
            0,
          ),
          color: colors.status.error,
        },
      ].filter((slice) => slice.value > 0),
    [sobranteIva, fundBalances, paidInvoices, colors],
  );

  const retentionValues = useMemo(
    () => ({
      tax: retentionSummary.totalTax,
      tag: retentionSummary.totalTag,
      accountant: retentionSummary.totalAccountant,
      savings: retentionSummary.totalSavings,
    }),
    [retentionSummary],
  );

  const activeChart =
    CHART_VIEWS.find((item) => item.key === chartView) ?? CHART_VIEWS[0];

  if (!hasLoadedOnce) {
    return (
      <View style={styles.screen}>
        <ScreenContainer scrollable>
          {error ? (
            <>
              <AppHeader title="Facturiion" subtitle="Control de tus facturas" />
              <ErrorState message={error} onRetry={onRefresh} />
            </>
          ) : (
            <HomeDashboardSkeleton chartWidth={chartWidth} />
          )}
        </ScreenContainer>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenContainer
        scrollable
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.scrollContent}
      >
        <AppHeader
          title="Facturiion"
          largeSubtitle
          subtitle={
            user?.name ? `Hola, ${user.name}` : "Control de tus facturas"
          }
        />

        <View style={styles.homeControls}>
          <ThemeToggleButton />
        </View>

        <View style={styles.quickActionsWrap}>
          <QuickActions onPress={(route) => router.push(route as never)} />
        </View>

        {!hasAnyData ? (
          <EmptyState
            actionLabel="Crear factura"
            iconName="document-text-outline"
            message="Crea tu primera factura para ver totales, graficos y el resumen mensual."
            onAction={() => router.push("/facturas/nueva")}
            title="Bienvenido a Facturiion"
          />
        ) : (
          <>
            {/* Tarjeta principal - Total facturado */}
            <Pressable
              accessibilityHint="Toca para ampliar o contraer el monto"
              accessibilityLabel={`Total facturado: ${formatCurrency(totals.totalInvoiced)}`}
              accessibilityRole="button"
              accessibilityState={{ expanded: totalExpanded }}
              onPress={() => setTotalExpanded((prev) => !prev)}
              style={({ pressed }) => [
                styles.mainCard,
                pressed && styles.mainCardPressed,
              ]}
            >
              <Text style={styles.mainLabel}>Total facturado</Text>
              <Text
                adjustsFontSizeToFit
                ellipsizeMode="tail"
                minimumFontScale={0.55}
                numberOfLines={1}
                style={[styles.mainAmount, totalExpanded && styles.mainAmountExpanded]}
              >
                {totalExpanded
                  ? formatCurrency(totals.totalInvoiced)
                  : formatCurrencyCompact(totals.totalInvoiced)}
              </Text>
              <View style={styles.mainStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{invoices.length}</Text>
                  <Text style={styles.statLabel}>Facturas</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text
                    adjustsFontSizeToFit
                    ellipsizeMode="tail"
                    minimumFontScale={0.5}
                    numberOfLines={1}
                    style={[styles.statValue, { color: colors.status.success }]}
                  >
                    {totalExpanded
                      ? formatCurrency(totals.paidAmount)
                      : formatCurrencyCompact(totals.paidAmount)}
                  </Text>
                  <Text style={styles.statLabel}>Pagado</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text
                    adjustsFontSizeToFit
                    ellipsizeMode="tail"
                    minimumFontScale={0.5}
                    numberOfLines={1}
                    style={[styles.statValue, { color: colors.status.warning }]}
                  >
                    {totalExpanded
                      ? formatCurrency(totals.pendingAmount)
                      : formatCurrencyCompact(totals.pendingAmount)}
                  </Text>
                  <Text style={styles.statLabel}>Pendiente</Text>
                </View>
              </View>
            </Pressable>

            {/* Grafico de lineas - evolucion mensual */}
            <View style={styles.chartCard}>
              <SectionTitle title={activeChart.label} subtitle={`${activeChart.subtitle} · Últimos 6 meses`} />
              <View style={styles.chartSelector}>
                {CHART_VIEWS.map((item) => (
                  <FilterChip
                    key={item.key}
                    label={item.label}
                    selected={chartView === item.key}
                    onPress={() => setChartView(item.key)}
                  />
                ))}
              </View>
              {chartMonths.length === 0 ? (
                <EmptyState
                  message="Registra facturas para ver la evolución mensual."
                  title="Sin datos para graficar"
                />
              ) : (
                <View style={styles.chartContainer}>
                  <LineChart
                    data={chartData}
                    width={chartWidth}
                    height={300}
                    withShadow={false}
                    yAxisSuffix="M"
                    yAxisLabel="CLP"
                    yLabelsOffset={-10}
                    xLabelsOffset={10}
                    chartConfig={{
                      backgroundColor: colors.surface.primary,
                      backgroundGradientFrom: colors.surface.primary,
                      backgroundGradientTo: colors.surface.primary,
                      decimalPlaces: 0,
                      color: (opacity = 1) => rgba(colors.chart.axis, opacity),
                      labelColor: (opacity = 1) => rgba(colors.text.primary, opacity),
                      formatXLabel: (label: string) => label,
                      propsForDots: { r: "4", strokeWidth: 0 },
                      propsForBackgroundLines: {
                        stroke: rgba(colors.chart.axis, 0.25),
                        strokeWidth: 1,
                      },
                      propsForLabels: {
                        fontSize: 10,
                        fontWeight: "600",
                        fill: colors.text.secondary,
                      },
                    }}
                    style={styles.chart}
                    bezier
                  />
                </View>
              )}
            </View>

            <View style={styles.legendContainer}>
              <View style={styles.legendRow}>
                {chartLegend.map((item) => (
                  <View key={item.name} style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: item.color }]}
                    />
                    <Text style={styles.legendText}>{item.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Seccion IVA */}
            <SectionTitle title="IVA" subtitle="Generado, pagado y saldo" />
            <View style={styles.summarySection}>
              <SummaryCard
                label="IVA Total"
                value={taxBalance.totalTax}
                icon={ICON_GLYPHS.docs}
                tone="strong"
              />
              <SummaryCard
                label="IVA Pagado"
                value={taxBalance.paidTax}
                icon={ICON_GLYPHS.check}
                tone="warning"
              />
              <SummaryCard
                label={ivaSobranteOverpaid ? "Exceso IVA" : "IVA Sobrante"}
                value={Math.abs(sobranteIva)}
                icon={ICON_GLYPHS.cash}
                tone={ivaSobranteOverpaid ? "error" : "default"}
              />
            </View>

            {/* Seccion Fondos */}
            <SectionTitle title="Fondos" subtitle="Pagos extras y ahorro" />
            <View style={styles.summarySection}>
              {EXTRA_PAYMENT_BALANCE_CATEGORIES.map((category) => (
                <SummaryCard
                  key={category.value}
                  label={`Saldo ${category.label}`}
                  value={
                    category.value === "tag"
                      ? fundBalances.tag
                      : fundBalances.accountant
                  }
                  icon={ICON_GLYPHS[category.value === "tag" ? "tag" : "chart"]}
                />
              ))}
              <SummaryCard
                label={`Saldo ${RETENTION_CATEGORIES.find((c) => c.value === "savings")?.label}`}
                value={fundBalances.savings}
                icon={ICON_GLYPHS.savings}
              />
            </View>

            {/* Seccion Retencion */}
            <SectionTitle title="Retención" subtitle="Acumulado por categoria" />
            <View style={styles.summarySection}>
              {RETENTION_CATEGORIES.map((category) => (
                <SummaryCard
                  key={category.value}
                  label={category.label}
                  value={retentionValues[category.value]}
                  icon={ICON_GLYPHS.retention}
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
                <View style={styles.pieContainer} accessibilityRole="image" accessibilityLabel="Gráfico circular: distribución de fondos por categoría (IVA, TAG, Contador, Ahorro, Retenciones)">
                  <PieChart3D data={pieData} size={350} />
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
          </>
        )}
      </ScreenContainer>
    <FloatingActionButton
      onPress={() => router.push("/facturas/nueva")}
      accessibilityLabel="Crear factura"
    />
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: spacing.xxl,
    },
    homeControls: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    quickActionsWrap: {
      marginBottom: spacing.lg,
    },
    mainCard: {
      backgroundColor: c.primary.dark,
      borderRadius: radius.mainCard,
      marginBottom: spacing.lg,
      padding: spacing.lg,
    },
    mainCardPressed: {
      transform: [{ scale: 0.99 }],
    },
    mainLabel: {
      ...typography.label,
      color: c.text.inverse,
      opacity: 0.9,
    },
    mainAmount: {
      ...typography.primaryAmount,
      color: c.text.inverse,
      marginTop: spacing.xxs,
    },
    mainAmountExpanded: {
      fontSize: 36,
      lineHeight: 44,
    },
    mainStats: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.text.inverse,
    },
    statItem: {
      alignItems: "center",
      flex: 1,
    },
    statValue: {
      ...typography.cardAmount,
      color: c.text.inverse,
    },
    statLabel: {
      ...typography.caption,
      color: c.text.inverse,
      marginTop: spacing.xxs,
      opacity: 0.7,
    },
    statDivider: {
      width: 1,
      height: 30,
      backgroundColor: c.text.inverse,
      opacity: 0.2,
    },
    chartCard: {
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.card,
      borderWidth: 1,
      marginBottom: spacing.lg,
      padding: spacing.cardPadding,
    },
    chartContainer: {
      alignItems: "center",
    },
    chartSelector: {
      flexDirection: "row",
      flexWrap: "wrap",
      columnGap: spacing.sm,
      marginBottom: spacing.md,
      marginHorizontal: -spacing.xxs,
      rowGap: spacing.sm,
    },
    chart: {
      borderRadius: radius.card,
    },
    legendContainer: {
      alignItems: "center",
      marginBottom: spacing.md,
      marginTop: spacing.sm,
    },
    legendRow: {
      alignItems: "center",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: spacing.md,
      marginBottom: spacing.xs,
    },
    legendItem: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.xs,
    },
    legendDot: {
      borderRadius: 5,
      height: 10,
      width: 10,
    },
    legendText: {
      ...typography.small,
      color: c.text.primary,
    },
    pieContainer: {
      alignItems: "center",
    },
    summarySection: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.gridGap,
      marginBottom: spacing.md,
    },
    retentionLink: {
      alignItems: "center",
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.card,
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.cardPadding,
      paddingVertical: spacing.md,
    },
    retentionLinkText: {
      ...typography.bodyMedium,
      color: c.primary.main,
      fontWeight: "600",
    },
    retentionLinkArrow: {
      color: c.text.tertiary,
      fontSize: typography.screenTitle.fontSize,
    },
    list: {
      gap: spacing.gridGap,
    },
  });
