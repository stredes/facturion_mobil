import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Invoice } from "../domain/Invoice";
import { useClientDebts } from "../hooks/useClientDebts";
import { radius, spacing, typography, useTheme, type Colors } from "../theme";
import {
  filterClientDebts,
  getPendingInvoicesForClient,
  summarizeClientDebts,
} from "../utils/clientDebts";
import { formatCurrency, formatCurrencyCompact } from "../utils/currency";
import { ClientDebtCard } from "./ClientDebtCard";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { SearchInput } from "./SearchInput";
import { SectionTitle } from "./SectionTitle";

export function ClientDebtsSection() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { debts, pendingInvoices, isLoading, error, refresh } = useClientDebts();
  const [search, setSearch] = useState("");

  const filteredDebts = useMemo(
    () => filterClientDebts(debts, search),
    [debts, search],
  );
  const summary = useMemo(() => summarizeClientDebts(filteredDebts), [filteredDebts]);
  const pendingInvoicesByClient = useMemo(
    () => {
      const map = new Map<string, Invoice[]>();
      for (const clientName of new Set(
        pendingInvoices.map((invoice) => invoice.clientName),
      )) {
        map.set(
          clientName,
          getPendingInvoicesForClient(pendingInvoices, clientName),
        );
      }
      return map;
    },
    [pendingInvoices],
  );

  if (isLoading) {
    return (
      <View style={styles.section}>
        <SectionTitle
          title="Clientes que me deben"
          subtitle="Facturas pendientes de cobro"
        />
        <LoadingState message="Calculando deudas..." size="small" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <SectionTitle
          title="Clientes que me deben"
          subtitle="Facturas pendientes de cobro"
        />
        <ErrorState message={error} onRetry={refresh} />
      </View>
    );
  }

  if (debts.length === 0) {
    return (
      <View style={styles.section}>
        <SectionTitle
          title="Clientes que me deben"
          subtitle="Facturas pendientes de cobro"
        />
        <EmptyState
          iconName="infinite-outline"
          message="No hay facturas pendientes, todo esta pagado."
          title="Sin deudas"
        />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <SectionTitle
        title="Clientes que me deben"
        subtitle="Facturas pendientes de cobro"
      />

      <SearchInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por cliente"
      />

      {filteredDebts.length === 0 ? (
        <EmptyState
          iconName="search"
          title="Sin resultados"
          message="Ningun cliente coincide con tu busqueda"
          actionLabel="Limpiar busqueda"
          onAction={() => setSearch("")}
        />
      ) : (
        <>
          <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total por cobrar</Text>
        <Text
          adjustsFontSizeToFit
          ellipsizeMode="tail"
          minimumFontScale={0.55}
          numberOfLines={1}
          style={styles.summaryAmount}
        >
          {formatCurrency(summary.totalAmount)}
        </Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>{summary.totalClients}</Text>
            <Text style={styles.summaryStatLabel}>
              {summary.totalClients === 1 ? "cliente" : "clientes"}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>
              {summary.totalPendingInvoices}
            </Text>
            <Text style={styles.summaryStatLabel}>
              {summary.totalPendingInvoices === 1 ? "factura" : "facturas"}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>
              {formatCurrencyCompact(summary.totalNetAmount)}
            </Text>
            <Text style={styles.summaryStatLabel}>neto</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>
              {formatCurrencyCompact(summary.totalTaxAmount)}
            </Text>
            <Text style={styles.summaryStatLabel}>IVA</Text>
          </View>
        </View>
      </View>

      <View style={styles.debtList}>
        {filteredDebts.map((debt) => (
          <ClientDebtCard
            key={debt.clientName}
            debt={debt}
            invoices={pendingInvoicesByClient.get(debt.clientName) ?? []}
          />
        ))}
      </View>
        </>
      )}
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    section: {
      gap: spacing.md,
    },
    summaryCard: {
      backgroundColor: c.primary.dark,
      borderRadius: radius.mainCard,
      gap: spacing.xxs,
      padding: spacing.cardPadding,
    },
    summaryLabel: {
      ...typography.label,
      color: c.text.inverse,
      opacity: 0.9,
    },
    summaryAmount: {
      ...typography.primaryAmount,
      color: c.text.inverse,
      marginTop: spacing.xxs,
    },
    summaryStats: {
      borderTopColor: c.text.inverse,
      borderTopWidth: 1,
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: spacing.md,
      paddingTop: spacing.md,
    },
    summaryStat: {
      alignItems: "center",
      flex: 1,
    },
    summaryStatValue: {
      ...typography.cardAmount,
      color: c.text.inverse,
    },
    summaryStatLabel: {
      ...typography.caption,
      color: c.text.inverse,
      marginTop: spacing.xxs,
      opacity: 0.7,
    },
    summaryDivider: {
      backgroundColor: c.text.inverse,
      height: 30,
      opacity: 0.2,
      width: 1,
    },
    debtList: {
      gap: spacing.gridGap,
    },
  });
