import React, { useState } from "react";
import { Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SearchInput } from "@/components/SearchInput";
import { FilterChip } from "@/components/FilterChip";
import { InvoiceCard } from "@/components/InvoiceCard";
import { EmptyState } from "@/components/EmptyState";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { SectionTitle } from "@/components/SectionTitle";
import { colors, spacing } from "@/theme";

type InvoiceStatus = "paid" | "pending" | "unpaid";

interface Invoice {
  id: string;
  clientName: string;
  invoiceNumber: string;
  invoiceDate: string;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentDate?: string;
  taxPayment: number;
  tagAmount: number;
  accountantAmount: number;
  savingsAmount: number;
  description?: string;
}

const statusOptions: { value: InvoiceStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "paid", label: "Pagadas" },
  { value: "pending", label: "Pendientes" },
  { value: "unpaid", label: "Sin pago" },
];

export default function FacturasScreen() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");

  // Using mock data for now - replace with useInvoices hook
  const mockInvoices: Invoice[] = [
    { id: "1", clientName: "Empresa ABC", invoiceNumber: "001", invoiceDate: "2024-01-15", netAmount: 1500000, taxAmount: 285000, totalAmount: 1785000, paymentDate: "2024-01-20", taxPayment: 285000, tagAmount: 50000, accountantAmount: 30000, savingsAmount: 20000, description: "Servicios profesionales" },
    { id: "2", clientName: "Tech Solutions", invoiceNumber: "002", invoiceDate: "2024-01-20", netAmount: 850000, taxAmount: 161500, totalAmount: 1011500, paymentDate: undefined, taxPayment: 0, tagAmount: 0, accountantAmount: 0, savingsAmount: 0, description: "Desarrollo web" },
    { id: "3", clientName: "Comercial XYZ", invoiceNumber: "003", invoiceDate: "2024-01-10", netAmount: 2200000, taxAmount: 418000, totalAmount: 2618000, paymentDate: undefined, taxPayment: 200000, tagAmount: 100000, accountantAmount: 50000, savingsAmount: 30000, description: "Consultoría" },
    { id: "4", clientName: "Startup Inc", invoiceNumber: "004", invoiceDate: "2024-01-25", netAmount: 450000, taxAmount: 85500, totalAmount: 535500, paymentDate: "2024-02-01", taxPayment: 85500, tagAmount: 20000, accountantAmount: 10000, savingsAmount: 5000, description: "Diseño" },
    { id: "5", clientName: "Corporación DEF", invoiceNumber: "005", invoiceDate: "2024-01-18", netAmount: 3100000, taxAmount: 589000, totalAmount: 3689000, paymentDate: undefined, taxPayment: 0, tagAmount: 0, accountantAmount: 0, savingsAmount: 0, description: "Mantenimiento" },
  ];

  const getStatus = (invoice: Invoice): InvoiceStatus => {
    if (invoice.paymentDate) return "paid";
    if (invoice.taxPayment > 0) return "pending";
    return "unpaid";
  };

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const status = getStatus(invoice);
    const matchesSearch =
      invoice.clientName.toLowerCase().includes(search.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (invoice.description && invoice.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ScreenContainer>
      <AppHeader title="Facturas" subtitle={`${mockInvoices.length} facturas`} />

      <View style={styles.searchSection}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por número, cliente o descripción"
        />
      </View>

      <View style={styles.filters}>
        {statusOptions.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            selected={statusFilter === option.value}
            onPress={() => setStatusFilter(option.value)}
          />
        ))}
      </View>

      <SectionTitle title={`Resultados (${filteredInvoices.length})`} />

      {filteredInvoices.length === 0 ? (
        <EmptyState
          title="Sin facturas"
          message={
            search || statusFilter !== "all"
              ? "No hay facturas que coincidan con tu búsqueda"
              : "No hay facturas registradas aún"
          }
          actionLabel="Crear factura"
          onAction={() => console.log("Nueva factura")}
          icon="🔍"
        />
      ) : (
        <View style={styles.list}>
          {filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice as any}
              onPress={() => console.log("Detalle", invoice.id)}
            />
          ))}
        </View>
      )}

      <FloatingActionButton
        onPress={() => console.log("Nueva factura")}
        accessibilityLabel="Crear factura"
      />
    </ScreenContainer>
  );
}

const styles: any = {
  searchSection: {
    marginBottom: spacing.md,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.md,
    paddingBottom: 100,
  },
};
