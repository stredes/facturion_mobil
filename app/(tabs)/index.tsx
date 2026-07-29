import React from "react";
import { Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SummaryCard } from "@/components/SummaryCard";
import { SectionTitle } from "@/components/SectionTitle";
import { InvoiceCard } from "@/components/InvoiceCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { colors, spacing } from "@/theme";

const mockInvoices = [
  { id: "1", clientName: "Empresa ABC", invoiceNumber: "001", invoiceDate: "2024-01-15", netAmount: 1500000, taxAmount: 285000, totalAmount: 1785000, paymentDate: "2024-01-20", taxPayment: 285000, tagAmount: 50000, accountantAmount: 30000, savingsAmount: 20000, description: "Servicios profesionales" },
  { id: "2", clientName: "Tech Solutions", invoiceNumber: "002", invoiceDate: "2024-01-20", netAmount: 850000, taxAmount: 161500, totalAmount: 1011500, paymentDate: undefined, taxPayment: 0, tagAmount: 0, accountantAmount: 0, savingsAmount: 0, description: "Desarrollo web" },
  { id: "3", clientName: "Comercial XYZ", invoiceNumber: "003", invoiceDate: "2024-01-10", netAmount: 2200000, taxAmount: 418000, totalAmount: 2618000, paymentDate: undefined, taxPayment: 200000, tagAmount: 100000, accountantAmount: 50000, savingsAmount: 30000, description: "Consultoría" },
];

const totalInvoiced = mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
const pendingAmount = mockInvoices
  .filter((inv) => !inv.paymentDate)
  .reduce((sum, inv) => sum + inv.totalAmount, 0);
const paidAmount = mockInvoices
  .filter((inv) => inv.paymentDate)
  .reduce((sum, inv) => sum + inv.totalAmount, 0);
const totalNet = mockInvoices.reduce((sum, inv) => sum + inv.netAmount, 0);
const totalTax = mockInvoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
const totalRemaining = mockInvoices.reduce((sum, inv) => {
  const remaining = inv.totalAmount - inv.taxPayment - inv.tagAmount - inv.accountantAmount - inv.savingsAmount;
  return sum + remaining;
}, 0);
const totalTag = mockInvoices.reduce((sum, inv) => sum + inv.tagAmount, 0);
const totalAccountant = mockInvoices.reduce((sum, inv) => sum + inv.accountantAmount, 0);
const totalSavings = mockInvoices.reduce((sum, inv) => sum + inv.savingsAmount, 0);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function HomeScreen() {
  return (
    <ScreenContainer>
      <AppHeader title="Facturiion" subtitle="Control de tus facturas" />

      <View style={styles.mainCard}>
        <Text style={styles.mainLabel}>Total facturado</Text>
        <Text style={styles.mainAmount}>{formatCurrency(totalInvoiced)}</Text>
        <Text style={styles.mainSubtitle}>{mockInvoices.length} facturas registradas</Text>
      </View>

      <View style={styles.summarySection}>
        <SummaryCard
          label="Neto"
          value={formatCurrency(totalNet)}
          icon="💰"
          tone="strong"
        />
        <SummaryCard
          label="IVA"
          value={formatCurrency(totalTax)}
          icon="📋"
        />
        <SummaryCard
          label="Restante"
          value={formatCurrency(totalRemaining)}
          icon="💵"
          tone="strong"
        />
        <SummaryCard
          label="Pago IVA"
          value={formatCurrency(mockInvoices.reduce((s, i) => s + i.taxPayment, 0))}
          icon="✅"
        />
      </View>

      <View style={styles.distributionSection}>
        <SummaryCard
          label="TAG"
          value={formatCurrency(mockInvoices.reduce((s, i) => s + i.tagAmount, 0))}
          icon="🏷️"
        />
        <SummaryCard
          label="Contador"
          value={formatCurrency(mockInvoices.reduce((s, i) => s + i.accountantAmount, 0))}
          icon="📊"
        />
        <SummaryCard
          label="Ahorro"
          value={formatCurrency(mockInvoices.reduce((s, i) => s + i.savingsAmount, 0))}
          icon="💚"
        />
      </View>

      <SectionTitle title="Facturas recientes" />

      <View style={styles.list}>
        {mockInvoices.map((invoice) => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice as any}
            onPress={() => console.log("Detalle", invoice.id)}
          />
        ))}
      </View>

      <FloatingActionButton
        onPress={() => console.log("Nueva factura")}
        accessibilityLabel="Crear factura"
      />
    </ScreenContainer>
  );
}

const styles: any = {
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
  mainSubtitle: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
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
    marginBottom: 20,
  },
  list: {
    gap: 12,
    paddingBottom: 100,
  },
};
