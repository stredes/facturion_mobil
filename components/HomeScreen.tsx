import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useColorScheme } from 'react-native';

const COLORS = {
  light: {
    bg: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    series: {
      ivaGenerado: '#0EA5E9',
      ivaPagado: '#22C55E',
      sobrante: '#F97316',
      tac: '#3B82F6',
      contactos: '#A855F7',
      ahorro: '#84CC16',
    },
    axis: '#94A3B8',
    grid: '#E2E8F0',
  },
  dark: {
    bg: '#0F172A',
    card: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#334155',
    series: {
      ivaGenerado: '#38BDF8',
      ivaPagado: '#4ADE80',
      sobrante: '#FB923C',
      tac: '#60A5FA',
      contactos: '#C084FC',
      ahorro: '#A3E635',
    },
    axis: '#64748B',
    grid: '#1E293B',
  },
};

const CHART_DATA = [
  { month: 'Mar 26', ivaGenerado: 1819449, ivaPagado: 1159860, sobrante: 659589, tac: 245000, contactos: 180000, ahorro: 320000 },
  { month: 'Abr 26', ivaGenerado: 1920100, ivaPagado: 1205400, sobrante: 714700, tac: 260000, contactos: 195000, ahorro: 340000 },
  { month: 'May 26', ivaGenerado: 1875300, ivaPagado: 1180200, sobrante: 695100, tac: 255000, contactos: 210000, ahorro: 365000 },
  { month: 'Jun 26', ivaGenerado: 2010500, ivaPagado: 1250800, sobrante: 759700, tac: 270000, contactos: 225000, ahorro: 380000 },
  { month: 'Jul 26', ivaGenerado: 2150000, ivaPagado: 1320500, sobrante: 829500, tac: 285000, contactos: 240000, ahorro: 410000 },
];

const LEGEND_ITEMS = [
  { name: 'IVA generado', colorKey: 'ivaGenerado' },
  { name: 'IVA pagado', colorKey: 'ivaPagado' },
  { name: 'Sobrante', colorKey: 'sobrante' },
  { name: 'TAC', colorKey: 'tac' },
  { name: 'Contactos', colorKey: 'contactos' },
  { name: 'Ahorro', colorKey: 'ahorro' },
];

const NAV_ITEMS = [
  { name: 'Inicio', icon: '🏠', active: true },
  { name: 'Facturas', icon: '📄' },
  { name: 'Pagos/Ingresos', icon: '💰' },
  { name: 'Reportes', icon: '📊' },
  { name: 'Ajustes', icon: '⚙️' },
];

const TICK_VALUES = [0, 500000, 1000000, 1500000, 2000000];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatAxisValue = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

const getYDomain = () => {
  const maxValue = Math.max(...CHART_DATA.flatMap(d => Object.values(d).filter(v => typeof v === 'number')));
  const ceiling = Math.ceil(maxValue / 500000) * 500000;
  return [0, ceiling];
};

const rgba = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default function HomeScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? COLORS.dark : COLORS.light;
  const [layoutWidth, setLayoutWidth] = useState(Dimensions.get('window').width);

  const yDomain = useMemo(() => getYDomain(), []);

  const handleOrientationChange = useCallback(() => {
    setLayoutWidth(Dimensions.get('window').width);
  }, []);

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', handleOrientationChange);
    return () => sub?.remove?.();
  }, [handleOrientationChange]);

  const chartWidth = Math.min(layoutWidth - 32, 380);
  const chartHeight = 300;

  const chartConfig = useMemo(() => {
    const axisColor = (opacity: number) => rgba(colors.axis, opacity);
    const textColor = (opacity: number) => rgba(colors.text, opacity);
    return {
      backgroundColor: colors.card,
      backgroundGradientFrom: colors.card,
      backgroundGradientTo: colors.card,
      decimalPlaces: 0,
      color: axisColor,
      labelColor: textColor,
      propsForDots: { r: '4' },
      yAxisLabel: 'CLP',
      yLabelsOffset: -10,
      xLabelsOffset: 10,
    };
  }, [colors]);

  const chartDatasets = useMemo(() => LEGEND_ITEMS.map(item => ({
    data: CHART_DATA.map(d => d[item.colorKey as keyof typeof CHART_DATA[0]]) as number[],
    color: (opacity: number) => rgba(colors.series[item.colorKey as keyof typeof colors.series], opacity),
    strokeWidth: 2.5,
  })), [colors]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onLayout={e => setLayoutWidth(e.nativeEvent.layout.width)}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.text }]}>Inicio</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Resumen contable</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.badge, { backgroundColor: isDark ? '#1E3A5F' : '#DBEAFE', color: isDark ? '#93C5FD' : '#1D4ED8' }]}>
              🇨🇱 CLP
            </Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.cardsRow}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>IVA Total</Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>{formatCurrency(1819449)}</Text>
            <View style={styles.cardTrend}>
              <Text style={[styles.trendUp, { color: '#22C55E' }]}>+12.3%</Text>
              <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>vs mes anterior</Text>
            </View>
          </View>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>IVA Pagado</Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>{formatCurrency(1159860)}</Text>
            <View style={styles.cardTrend}>
              <Text style={[styles.trendUp, { color: '#22C55E' }]}>+8.7%</Text>
              <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>vs mes anterior</Text>
            </View>
          </View>
        </View>

        {/* Chart Card */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Saldos acumulados</Text>
            <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>Últimos 5 meses</Text>
          </View>

          <View style={{ width: '100%', alignItems: 'center' }}>
            <LineChart
              data={{
                labels: CHART_DATA.map(d => d.month),
                datasets: chartDatasets,
                legend: LEGEND_ITEMS.map(item => item.name),
              }}
              width={chartWidth}
              height={chartHeight}
              chartConfig={chartConfig}
              style={styles.chart}
              bezier
            />

            {/* Custom Legend below chart */}
            <View style={styles.legendContainer}>
              <View style={styles.legendRow}>
                {LEGEND_ITEMS.slice(0, 3).map((item, i) => (
                  <View key={item.name} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.series[item.colorKey as keyof typeof colors.series] }]} />
                    <Text style={[styles.legendText, { color: colors.text }]}>{item.name}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.legendRow}>
                {LEGEND_ITEMS.slice(3).map((item, i) => (
                  <View key={item.name} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.series[item.colorKey as keyof typeof colors.series] }]} />
                    <Text style={[styles.legendText, { color: colors.text }]}>{item.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Accesos rápidos</Text>
        </View>
        <View style={styles.actionsGrid}>
          {[
            { label: 'Nueva factura', icon: '➕', color: colors.series.ivaGenerado },
            { label: 'Registrar pago', icon: '💳', color: colors.series.ivaPagado },
            { label: 'Ver reportes', icon: '📈', color: colors.series.tac },
            { label: 'Configurar', icon: '⚙️', color: colors.series.contactos },
          ].map((action, i) => (
            <View key={i} style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                <Text style={styles.actionIconText}>{action.icon}</Text>
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Actividad reciente</Text>
        </View>
        <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { type: 'Factura emitida', detail: 'Factura #F-2026-0452', amount: '$ 145.890', time: 'Hace 2h', color: colors.series.ivaGenerado },
            { type: 'Pago recibido', detail: 'Cliente: Constructora Andes', amount: '$ 89.500', time: 'Hace 5h', color: colors.series.ivaPagado },
            { type: 'Retención TAC', detail: 'Declaración mensual', amount: '$ 12.350', time: 'Ayer', color: colors.series.tac },
          ].map((activity, i) => (
            <View key={i} style={[styles.activityRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.activityDot, { backgroundColor: activity.color }]} />
              <View style={styles.activityContent}>
                <Text style={[styles.activityType, { color: colors.text }]}>{activity.type}</Text>
                <Text style={[styles.activityDetail, { color: colors.textSecondary }]}>{activity.detail}</Text>
              </View>
              <View style={styles.activityMeta}>
                <Text style={[styles.activityAmount, { color: colors.text }]}>{activity.amount}</Text>
                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {NAV_ITEMS.map((item, index) => (
          <View
            key={item.name}
            style={[
              styles.navItem,
              item.active && styles.navItemActive,
            ]}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.navLabel,
                item.active
                  ? { color: colors.series.ivaGenerado, fontWeight: '700' }
                  : { color: colors.textSecondary },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 110 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: { flex: 1 },
  headerRight: { marginLeft: 12 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 2, fontWeight: '400' },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    minWidth: 0,
  },
  cardLabel: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValue: { fontSize: 22, fontWeight: '700', marginTop: 4, marginBottom: 8 },
  cardTrend: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  trendUp: { fontSize: 13, fontWeight: '600' },
  trendLabel: { fontSize: 11 },
  chartCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  chartHeader: { marginBottom: 12 },
  chartTitle: { fontSize: 16, fontWeight: '700' },
  chartSubtitle: { fontSize: 12, marginTop: 2 },
  legendContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: { fontSize: 11, fontWeight: '500' },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    width: '48%',
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionIconText: { fontSize: 22 },
  actionLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  activityCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  activityDot: { width: 8, height: 8, borderRadius: 4 },
  activityContent: { flex: 1, minWidth: 0 },
  activityType: { fontSize: 14, fontWeight: '600' },
  activityDetail: { fontSize: 12, marginTop: 2 },
  activityMeta: { alignItems: 'flex-end', minWidth: 80 },
  activityAmount: { fontSize: 14, fontWeight: '700' },
  activityTime: { fontSize: 11, marginTop: 2 },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    paddingBottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    minWidth: 0,
  },
  navItemActive: {},
  navIcon: { fontSize: 22, marginBottom: 2 },
  navLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center', lineHeight: 12 },
  chart: {
    borderRadius: 12,
  },
});