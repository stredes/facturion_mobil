import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { InvoiceCard } from "@/components/InvoiceCard";
import { InvoiceCardSkeleton } from "@/components/LoadingSkeleton";
import { SectionTitle } from "@/components/SectionTitle";
import { SummaryCard } from "@/components/SummaryCard";
import { useInvoices } from "@/hooks/useInvoices";
import { usePaymentSummary } from "@/hooks/usePaymentSummary";
import { colors, radius, spacing, typography } from "@/theme";
import { formatCurrency } from "@/utils/currency";
import { formatDisplayDate } from "@/utils/dates";

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const {
    data,
    recentGeneralPayments,
    recentTaxPayments,
    isLoading,
    error: summaryError,
    refresh: refreshSummary,
  } = usePaymentSummary();
  const { invoices, isLoading: invoicesLoading, refresh: invoicesRefresh } = useInvoices();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshSummary(), invoicesRefresh()]);
    setRefreshing(false);
  }, [refreshSummary, invoicesRefresh]);

  if (summaryError) {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.centeredBody}>
          <Text style={styles.errorText}>{summaryError}</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={[styles.mainCard]}>
        <Text style={styles.mainLabel}>Total facturado</Text>
        {isLoading ? (
          <Text style={[styles.mainAmount, { fontSize: isSmallScreen ? 23 : 26 }]}>---</Text>
        ) : (
          <>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              numberOfLines={1}
              style={[styles.mainAmount, { fontSize: isSmallScreen ? 23 : 26 }]}
            >
              {formatCurrency(data.totalInvoiced)}
            </Text>
            <Text style={styles.mainSubtitle}>
              {data.invoiceCount} {data.invoiceCount === 1 ? "factura registrada" : "facturas registradas"}
            </Text>
          </>
        )}
      </View>

      <SectionTitle title="IVA y obligaciones tributarias" />
      <View style={styles.ivaSection}>
        <View style={styles.grid}>
          <SummaryCard label="IVA generado" value={isLoading ? "---" : formatCurrency(data.generatedTax)} secondary="Calculado desde las facturas" />
          <SummaryCard label="IVA pagado" value={isLoading ? "---" : formatCurrency(data.paidTax)} secondary="Registrado en Pagos de IVA" />
        </View>

        {!isLoading ? (
          <View style={[styles.reserveCard, data.vatReserveOverpaid && styles.reserveCardDanger]}>
            <Text style={styles.reserveLabel}>
              {data.vatReserveOverpaid ? "Deficit de IVA" : "Reserva de IVA"}
            </Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[styles.reserveValue, data.vatReserveOverpaid && styles.reserveValueDanger]}
            >
              {data.vatReserveOverpaid ? `-${formatCurrency(Math.abs(data.generatedTax - data.paidTax))}` : formatCurrency(data.vatReserve)}
            </Text>
            <Text style={styles.reserveHint}>
              {data.vatReserveOverpaid
                ? "Los pagos de IVA superan el IVA generado registrado."
                : "Disponible para futuros pagos de IVA."}
            </Text>
          </View>
        ) : null}
      </View>

      <SectionTitle title="Pagos generales exentos de IVA" />
      <View style={styles.gpSection}>
        <View style={styles.grid}>
          <SummaryCard label="TAG" value={isLoading ? "---" : formatCurrency(data.totalTag)} />
          <SummaryCard label="Contador" value={isLoading ? "---" : formatCurrency(data.totalAccountant)} />
          <SummaryCard label="Ahorro" value={isLoading ? "---" : formatCurrency(data.totalSavings)} />
          <SummaryCard label="Total general" value={isLoading ? "---" : formatCurrency(data.totalGeneralPayments)} tone="strong" />
        </View>
        <Text style={styles.gpNote}>Estos pagos no modifican el IVA generado ni la reserva de IVA.</Text>
      </View>

      <SectionTitle title="Ultimos pagos generales" />
      <View style={styles.recentBlock}>
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <InvoiceCardSkeleton key={i} />)
        ) : recentGeneralPayments.length === 0 ? (
          <Text style={styles.recentEmpty}>No hay pagos generales recientes.</Text>
        ) : (
          recentGeneralPayments.map((p) => (
            <View key={p.id} style={styles.recentRow}>
              <View style={styles.recentLeft}>
                <Text style={styles.recentCategory}>
                  {p.category === "tag" ? "TAG" : p.category === "accountant" ? "Contador" : "Ahorro"}
                </Text>
                <Text style={styles.recentDate}>{formatDisplayDate(p.paymentDate)}</Text>
              </View>
              <Text style={styles.recentAmount}>{formatCurrency(p.amount)}</Text>
            </View>
          ))
        )}
      </View>

      <SectionTitle title="Ultimos pagos de IVA" />
      <View style={styles.recentBlock}>
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <InvoiceCardSkeleton key={i} />)
        ) : recentTaxPayments.length === 0 ? (
          <Text style={styles.recentEmpty}>No hay pagos de IVA recientes.</Text>
        ) : (
          recentTaxPayments.map((p) => (
            <View key={p.id} style={styles.recentRow}>
              <View style={styles.recentLeft}>
                <Text style={styles.recentCategory}>Periodo {p.taxPeriod}</Text>
                <Text style={styles.recentDate}>Pagado el {formatDisplayDate(p.paymentDate)}</Text>
              </View>
              <Text style={styles.recentAmount}>{formatCurrency(p.amount)}</Text>
            </View>
          ))
        )}
      </View>

      <SectionTitle title="Facturas recientes" />
      <View style={styles.list}>
        {invoicesLoading
          ? Array.from({ length: 3 }).map((_, i) => <InvoiceCardSkeleton key={i} />)
          : invoices.slice(0, 5).map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onPress={() => router.push({ pathname: "/facturas/[id]", params: { id: invoice.id } })}
              />
            ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 120,
    gap: spacing.xl,
  },
  centeredBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.status.error,
    textAlign: "center",
  },
  mainCard: {
    backgroundColor: colors.primary.main,
    borderRadius: radius.mainCard,
    minHeight: 128,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  mainLabel: {
    ...typography.label,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  mainAmount: {
    ...typography.primaryAmount,
    color: colors.text.inverse,
    marginTop: spacing.xxs,
  },
  mainSubtitle: {
    ...typography.caption,
    color: colors.text.inverse,
    marginTop: spacing.xs,
    opacity: 0.8,
  },
  ivaSection: {
    gap: spacing.md,
  },
  gpSection: {
    gap: spacing.md,
  },
  gpNote: {
    ...typography.small,
    color: colors.text.tertiary,
    fontStyle: "italic",
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.gridGap,
  },
  reserveCard: {
    backgroundColor: colors.surface.primary,
    borderColor: colors.primary.main,
    borderRadius: radius.mainCard,
    borderWidth: 2,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  reserveCardDanger: {
    borderColor: colors.status.error,
    backgroundColor: colors.statusLight.error,
  },
  reserveLabel: {
    ...typography.sectionTitle,
    color: colors.primary.main,
  },
  reserveValue: {
    ...typography.primaryAmount,
    color: colors.primary.main,
    fontVariant: ["tabular-nums"],
  },
  reserveValueDanger: {
    color: colors.status.error,
  },
  reserveHint: {
    ...typography.small,
    color: colors.text.tertiary,
  },
  recentBlock: {
    gap: spacing.sm,
  },
  recentRow: {
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.light,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.cardPadding,
  },
  recentLeft: {
    gap: 2,
    minWidth: 0,
    flex: 1,
  },
  recentCategory: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: "600",
  },
  recentDate: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  recentAmount: {
    ...typography.cardAmount,
    color: colors.primary.main,
    fontVariant: ["tabular-nums"],
    marginLeft: spacing.md,
  },
  recentEmpty: {
    ...typography.body,
    color: colors.text.tertiary,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
  list: {
    gap: spacing.gridGap,
  },
});
