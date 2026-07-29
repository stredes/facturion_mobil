import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ConfirmDialog } from "../../src/components/ConfirmDialog";
import { EmptyState } from "../../src/components/EmptyState";
import type { Invoice } from "../../src/domain/Invoice";
import { SQLiteInvoiceRepository } from "../../src/infrastructure/repositories/SQLiteInvoiceRepository";
import { calculateRemainingAmount } from "../../src/services/invoiceCalculations";
import { formatCurrency } from "../../src/utils/currency";
import { formatDisplayDate } from "../../src/utils/dates";

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoiceId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const repository = useMemo(() => new SQLiteInvoiceRepository(), []);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const loadInvoice = useCallback(async () => {
    if (!invoiceId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setInvoice(await repository.findById(invoiceId));
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudo cargar la factura",
      );
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId, repository]);

  useFocusEffect(
    useCallback(() => {
      void loadInvoice();
    }, [loadInvoice]),
  );

  async function deleteInvoice() {
    if (!invoice) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await repository.delete(invoice.id);
      setShowDeleteDialog(false);
      router.replace("/facturas");
    } catch (currentError) {
      setDeleteError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudo eliminar la factura",
      );
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#0E7490" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.centered}>
        <EmptyState
          message="La factura no existe o fue eliminada."
          title="Factura no encontrada"
        />
      </View>
    );
  }

  const remainingAmount = calculateRemainingAmount({
    totalAmount: invoice.totalAmount,
    taxPayment: invoice.taxPayment,
    tagAmount: invoice.tagAmount,
    accountantAmount: invoice.accountantAmount,
    savingsAmount: invoice.savingsAmount,
  });

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Factura N.º {invoice.invoiceNumber}</Text>
          <Text style={styles.client}>{invoice.clientName}</Text>
        </View>

        <View style={styles.detailList}>
          <DetailRow label="Fecha" value={formatDisplayDate(invoice.invoiceDate)} />
          <DetailRow
            label="Descripción"
            value={invoice.description || "Sin descripción"}
          />
          <DetailRow label="Neto" value={formatCurrency(invoice.netAmount)} />
          <DetailRow label="IVA" value={formatCurrency(invoice.taxAmount)} />
          <DetailRow
            label="Total factura"
            value={formatCurrency(invoice.totalAmount)}
          />
          <DetailRow
            label="Fecha de pago"
            value={formatDisplayDate(invoice.paymentDate)}
          />
          <DetailRow
            label="Pago IVA"
            value={formatCurrency(invoice.taxPayment)}
          />
          <DetailRow label="TAG" value={formatCurrency(invoice.tagAmount)} />
          <DetailRow
            label="Contador"
            value={formatCurrency(invoice.accountantAmount)}
          />
          <DetailRow
            label="Ahorro"
            value={formatCurrency(invoice.savingsAmount)}
          />
          <View style={styles.remainingRow}>
            <Text style={styles.remainingLabel}>Restante</Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.remainingValue}
            >
              {formatCurrency(remainingAmount)}
            </Text>
          </View>
        </View>

        {deleteError ? <Text style={styles.inlineError}>{deleteError}</Text> : null}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/facturas/editar/[id]",
                params: { id: invoice.id },
              })
            }
            style={({ pressed }) => [
              styles.actionButton,
              styles.editButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text style={styles.editButtonText}>Editar</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isDeleting}
            onPress={() => setShowDeleteDialog(true)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              isDeleting ? styles.disabledButton : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text style={styles.deleteButtonText}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <ConfirmDialog
        confirmLabel="Eliminar"
        message="Esta factura se eliminará de la base local."
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          void deleteInvoice();
        }}
        title="Eliminar factura"
        visible={showDeleteDialog}
      />
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F6F8FA",
    flex: 1,
  },
  container: {
    gap: 18,
    padding: 18,
    paddingBottom: 34,
  },
  centered: {
    alignItems: "center",
    backgroundColor: "#F6F8FA",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    gap: 6,
  },
  title: {
    color: "#102A43",
    fontSize: 27,
    fontWeight: "900",
  },
  client: {
    color: "#52606D",
    fontSize: 16,
    fontWeight: "800",
  },
  detailList: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D9E2EC",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  detailRow: {
    borderBottomColor: "#E9EFF5",
    borderBottomWidth: 1,
    gap: 4,
    padding: 15,
  },
  detailLabel: {
    color: "#627D98",
    fontSize: 12,
    fontWeight: "800",
  },
  detailValue: {
    color: "#102A43",
    fontSize: 16,
    fontWeight: "800",
  },
  remainingRow: {
    backgroundColor: "#ECFDF3",
    gap: 6,
    padding: 16,
  },
  remainingLabel: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "900",
  },
  remainingValue: {
    color: "#166534",
    fontSize: 24,
    fontWeight: "900",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  editButton: {
    backgroundColor: "#0E7490",
  },
  deleteButton: {
    backgroundColor: "#FFF1F2",
    borderColor: "#FECDD3",
    borderWidth: 1,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  deleteButtonText: {
    color: "#B91C1C",
    fontSize: 15,
    fontWeight: "900",
  },
  error: {
    color: "#B91C1C",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  inlineError: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FDBA74",
    borderRadius: 8,
    borderWidth: 1,
    color: "#C2410C",
    fontSize: 14,
    fontWeight: "700",
    padding: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.72,
  },
});
