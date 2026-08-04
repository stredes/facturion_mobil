import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
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
import { ScreenContainer } from "@/components/ScreenContainer";
import { SummaryCard } from "@/components/SummaryCard";
import { SectionTitle } from "@/components/SectionTitle";
import { InvoiceCard } from "@/components/InvoiceCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { LoadingState } from "@/components/LoadingState";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { ChartSkeleton } from "@/components/LoadingSkeleton";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { createLocalBackup } from "@/database/localBackup";
import { useInvoices } from "@/hooks/useInvoices";
import { useGeneralPayments } from "@/hooks/useGeneralPayments";
import { useRetentions } from "@/hooks/useRetentions";
import { useTaxPayments } from "@/hooks/useTaxPayments";
import { useThemeColors, radius, spacing, typography, type Colors } from "@/theme";
import { loadAppSettings, type BackupSettings } from "@/settings/appSettings";
import { RETENTION_CATEGORIES } from "@/utils/retentionLabels";
import { formatCurrency, formatCurrencyCompact } from "@/utils/currency";
import { toErrorMessage } from "@/utils/errors";

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

export default function HomeScreen() {
  const router = useRouter();
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
  const [totalExpanded, setTotalExpanded] = useState(false);
  const [lastBackup, setLastBackup] = useState<BackupSettings | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const isLoading = invoicesLoading || gpLoading || rLoading || tpLoading;
  const error = invoicesError || gpError || rError || tpError;

  useEffect(() => {
    let isMounted = true;

    loadAppSettings().then((settings) => {
      if (isMounted) {
        setLastBackup(settings.lastBackup);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleCreateBackup = useCallback(async () => {
    setIsBackingUp(true);
    try {
      const backup = await createLocalBackup();
      setLastBackup(backup);
      Alert.alert(
        "Backup local creado",
        `${backup.fileName}\n${formatBytes(backup.sizeBytes)}`,
      );
    } catch (currentError) {
      Alert.alert(
        "No se pudo crear el backup",
        toErrorMessage(currentError, "No se pudo crear el backup local"),
      );
    } finally {
      setIsBackingUp(false);
    }
  }, []);

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
        <ErrorState message={error} onRetry={onRefresh} />
      </ScreenContainer>
    );
  }

  // Calculos globales
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const paidAmount = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalTax = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
  const totalTag = invoices.reduce((sum, inv) => sum + inv.tagAmount, 0);
  const totalAccountant = invoices.reduce((sum, inv) => sum + inv.accountantAmount, 0);
  const totalSavings = invoices.reduce((sum, inv) => sum + inv.savingsAmount, 0);
  const totalTaxPayment = invoices.reduce((sum, inv) => sum + inv.taxPayment, 0);

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

  const last6 = <T,>(arr: T[]) => arr.slice(-6);
  const inM = (v: number) => v / 1000000;

  const chartMonths = months.slice(-6);
  const chartData = {
    labels: chartMonths.map((m) => formatMonthLabel(m)),
    datasets: [
      { data: last6(series.ivaGenerado).map(inM), color: (o = 1) => rgba(colors.series.ivaGenerado, o), strokeWidth: 2 },
      { data: last6(series.ivaPagado).map(inM), color: (o = 1) => rgba(colors.series.ivaPagado, o), strokeWidth: 2 },
      { data: last6(series.sobrante).map(inM), color: (o = 1) => rgba(colors.series.sobrante, o), strokeWidth: 2 },
      { data: last6(series.tag).map(inM), color: (o = 1) => rgba(colors.series.tac, o), strokeWidth: 2 },
      { data: last6(series.accountant).map(inM), color: (o = 1) => rgba(colors.series.contactos, o), strokeWidth: 2 },
      { data: last6(series.savings).map(inM), color: (o = 1) => rgba(colors.series.ahorro, o), strokeWidth: 2 },
    ],
  };

  // Datos para grafico de distribucion (una sola torta con las acumulaciones)
  const pieData = [
    { name: "Sobrante IVA", value: sobranteIva, color: colors.primary.main },
    { name: "Saldo TAG", value: tagBalance, color: colors.status.info },
    { name: "Saldo Contador", value: accountantBalance, color: colors.status.success },
    { name: "Saldo Ahorro", value: savingsBalance, color: colors.status.warning },
    { name: "Restante", value: invoices.reduce((s, i) => s + (i.totalAmount - i.taxPayment - i.tagAmount - i.accountantAmount - i.savingsAmount), 0), color: colors.status.error },
  ].filter((d) => d.value > 0);

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
    <View style={styles.screen}>
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

        <View style={styles.homeControls}>
          <ThemeToggleButton />
          <AnimatedPressable
            accessibilityLabel="Crear backup local"
            accessibilityRole="button"
            disabled={isBackingUp}
            onPress={handleCreateBackup}
            style={[
              styles.backupButton,
              isBackingUp && styles.backupButtonDisabled,
            ]}
          >
            <Text style={styles.backupTitle}>
              {isBackingUp ? "Generando..." : "Backup local"}
            </Text>
            <Text numberOfLines={1} style={styles.backupSubtitle}>
              {lastBackup
                ? `Ultimo ${formatBackupTime(lastBackup.createdAt)}`
                : "Guardar base completa"}
            </Text>
          </AnimatedPressable>
        </View>

        <QuickActions onPress={(route) => router.push(route as never)} />

        {/* Tarjeta principal - Total facturado */}
        <Pressable
          accessibilityHint="Toca para ampliar o contraer el monto"
          accessibilityLabel={`Total facturado: ${formatCurrency(totalInvoiced)}`}
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
              ? formatCurrency(totalInvoiced)
              : formatCurrencyCompact(totalInvoiced)}
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
                  ? formatCurrency(paidAmount)
                  : formatCurrencyCompact(paidAmount)}
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
                  ? formatCurrency(pendingAmount)
                  : formatCurrencyCompact(pendingAmount)}
              </Text>
              <Text style={styles.statLabel}>Pendiente</Text>
            </View>
          </View>
        </Pressable>

        {/* Grafico de acumulados */}
        <View style={styles.chartCard}>
          <SectionTitle title="Saldos acumulados" subtitle="Últimos 6 meses" />
          {isLoading ? (
            <ChartSkeleton height={300} width={chartWidth} />
          ) : (
            <View style={styles.chartContainer} accessibilityRole="image" accessibilityLabel="Gráfico de líneas: saldos acumulados de IVA, TAG, Contador y Ahorro en los últimos 6 meses">
              <LineChart
                data={chartData}
                width={chartWidth}
                height={300}
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
                  propsForDots: { r: "4" },
                }}
                style={styles.chart}
                bezier
              />
            </View>
          )}
        </View>

        {/* Leyenda del gráfico de líneas - en la parte inferior */}
        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            {[
              { name: 'IVA generado', color: colors.series.ivaGenerado },
              { name: 'IVA pagado', color: colors.series.ivaPagado },
              { name: 'Sobrante', color: colors.series.sobrante },
            ].map((item) => (
              <View key={item.name} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={[styles.legendText, { color: colors.text.primary }]}>{item.name}</Text>
              </View>
            ))}
          </View>
          <View style={styles.legendRow}>
            {[
              { name: 'TAG', color: colors.series.tac },
              { name: 'Contador', color: colors.series.contactos },
              { name: 'Ahorro', color: colors.series.ahorro },
            ].map((item) => (
              <View key={item.name} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={[styles.legendText, { color: colors.text.primary }]}>{item.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Seccion IVA */}
        <SectionTitle title="IVA" />
        <View style={styles.summarySection}>
          <SummaryCard
            label="IVA Total"
            value={totalTax}
            icon={ICON_GLYPHS.docs}
          />
          <SummaryCard
            label="IVA Pagado"
            value={totalTaxPayment}
            icon={ICON_GLYPHS.check}
            tone="warning"
          />
          <SummaryCard
            label="IVA Sobrante"
            value={sobranteIva}
            icon={ICON_GLYPHS.cash}
            tone="strong"
          />
        </View>

        {/* Seccion Pagos extras */}
        <SectionTitle title="Pagos extras" />
        <View style={styles.summarySection}>
          {RETENTION_CATEGORIES.slice(0, 3).map((category) => (
            <SummaryCard
              key={category.value}
              label={`Saldo ${category.label}`}
              value={
                category.value === "tag"
                  ? tagBalance
                  : category.value === "accountant"
                  ? accountantBalance
                  : savingsBalance
              }
              icon={ICON_GLYPHS[category.value === "tag" ? "tag" : category.value === "accountant" ? "chart" : "savings"]}
            />
          ))}
        </View>

        {/* Seccion Ahorro */}
        <SectionTitle title="Ahorro" />
        <View style={styles.summarySection}>
          <SummaryCard
            label={`Saldo ${RETENTION_CATEGORIES.find((c) => c.value === "savings")?.label}`}
            value={savingsBalance}
            icon={ICON_GLYPHS.savings}
          />
        </View>

        {/* Seccion Retencion */}
        <SectionTitle title="Retención" />
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
            {isLoading ? (
              <ChartSkeleton height={250} width={chartWidth} />
            ) : (
              <View style={styles.pieContainer} accessibilityRole="image" accessibilityLabel="Gráfico circular: distribución de fondos por categoría (IVA, TAG, Contador, Ahorro, Retenciones)">
                <PieChart3D data={pieData} size={350} innerRadius={90} depth={10} />
              </View>
            )}
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
      </ScrollView>
    </ScreenContainer>
    <FloatingActionButton
      onPress={() => router.push("/facturas/nueva")}
      accessibilityLabel="Crear factura"
    />
    </View>
  );
}

function formatBackupTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "reciente";
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 100,
    },
    homeControls: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    backupButton: {
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.button,
      borderWidth: 1,
      flex: 1,
      gap: spacing.xxs,
      justifyContent: "center",
      minHeight: 54,
      minWidth: 150,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    backupButtonDisabled: {
      opacity: 0.65,
    },
    backupTitle: {
      ...typography.label,
      color: c.text.primary,
    },
    backupSubtitle: {
      ...typography.caption,
      color: c.text.secondary,
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
      fontSize: 11,
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
      paddingBottom: 100,
    },
  });
