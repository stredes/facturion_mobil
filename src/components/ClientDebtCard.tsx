import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import type { Invoice } from "../domain/Invoice";
import { usePdfShare } from "../hooks/usePdfShare";
import { radius, spacing, typography, useTheme, type Colors } from "../theme";
import {
  buildClientDebtReportFileName,
  buildClientDebtReportHtml,
  type ClientDebtReportData,
} from "../utils/clientDebtReport";
import type { ClientDebt } from "../utils/clientDebts";
import { formatCurrency, formatCurrencyCompact } from "../utils/currency";
import { toErrorMessage } from "../utils/errors";
import { SecondaryButton } from "./SecondaryButton";

interface ClientDebtCardProps {
  debt: ClientDebt;
  invoices: Invoice[];
}

export function ClientDebtCard({ debt, invoices }: ClientDebtCardProps) {
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isSharing, sharePdf } = usePdfShare();

  const handleShareReport = useCallback(async () => {
    if (isSharing) {
      return;
    }

    try {
      const report: ClientDebtReportData = {
        clientName: debt.clientName,
        invoices,
      };
      await sharePdf({
        html: buildClientDebtReportHtml(report),
        fileName: buildClientDebtReportFileName(debt.clientName),
        dialogTitle: `Compartir informe de ${debt.clientName}`,
      });
    } catch (currentError) {
      Alert.alert(
        "No se pudo compartir",
        toErrorMessage(
          currentError,
          "No se pudo generar el informe de deuda",
        ),
      );
    }
  }, [debt.clientName, invoices, isSharing, sharePdf]);

  return (
    <View style={[styles.card, shadows.card]}>
      <Pressable
        accessibilityHint="Toca para ver las facturas pendientes de este cliente"
        accessibilityLabel={`${debt.clientName}: ${debt.totalAmount}`}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        onPress={() => setIsExpanded((prev) => !prev)}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <View style={styles.headerLeft}>
          <Text numberOfLines={1} style={styles.clientName}>
            {debt.clientName}
          </Text>
          <Text style={styles.pendingCount}>
            {debt.pendingCount}{" "}
            {debt.pendingCount === 1 ? "factura" : "facturas"} pendiente
            {debt.pendingCount === 1 ? "" : "s"}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text
            adjustsFontSizeToFit
            ellipsizeMode="tail"
            minimumFontScale={0.6}
            numberOfLines={1}
            style={styles.totalValue}
          >
            {isExpanded
              ? formatCurrency(debt.totalAmount)
              : formatCurrencyCompact(debt.totalAmount)}
          </Text>
          <Text style={styles.expandIcon}>{isExpanded ? "\u25B2" : "\u25BC"}</Text>
        </View>
      </Pressable>

      {isExpanded ? (
        <View style={styles.invoiceList}>
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Neto</Text>
            <Text style={styles.subtotalValue}>{formatCurrency(debt.netAmount)}</Text>
          </View>
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>IVA</Text>
            <Text style={styles.subtotalValue}>{formatCurrency(debt.taxAmount)}</Text>
          </View>
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Total</Text>
            <Text style={styles.subtotalTotal}>{formatCurrency(debt.totalAmount)}</Text>
          </View>
          <View style={styles.shareButton}>
            <SecondaryButton
              disabled={isSharing}
              label={isSharing ? "Generando PDF..." : "Compartir informe"}
              onPress={handleShareReport}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.card,
      borderWidth: 1,
      overflow: "hidden",
    },
    header: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.sm,
      justifyContent: "space-between",
      minHeight: 72,
      paddingHorizontal: spacing.cardPadding,
      paddingVertical: spacing.md,
    },
    headerPressed: {
      opacity: 0.7,
    },
    headerLeft: {
      flex: 1,
      gap: spacing.xxs,
      minWidth: 0,
    },
    clientName: {
      ...typography.cardTitle,
      color: c.text.primary,
    },
    pendingCount: {
      ...typography.caption,
      color: c.status.warning,
      fontWeight: "600",
    },
    headerRight: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.sm,
    },
    totalValue: {
      ...typography.cardAmount,
      color: c.text.primary,
      maxWidth: 160,
    },
    expandIcon: {
      color: c.text.tertiary,
      fontSize: 12,
    },
    invoiceList: {
      backgroundColor: c.surface.secondary,
      borderTopColor: c.border.light,
      borderTopWidth: 1,
      gap: spacing.xs,
      padding: spacing.cardPadding,
    },
    subtotalRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    subtotalLabel: {
      ...typography.caption,
      color: c.text.secondary,
    },
    subtotalValue: {
      ...typography.bodyMedium,
      color: c.text.primary,
      fontVariant: ["tabular-nums"],
    },
    subtotalTotal: {
      ...typography.cardTitle,
      color: c.primary.main,
      fontVariant: ["tabular-nums"],
    },
    shareButton: {
      marginTop: spacing.sm,
    },
  });
