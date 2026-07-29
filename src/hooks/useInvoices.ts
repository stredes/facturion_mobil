import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import type { Invoice, InvoiceFilters } from "../domain/Invoice";
import { SQLiteInvoiceRepository } from "../infrastructure/repositories/SQLiteInvoiceRepository";

const repository = new SQLiteInvoiceRepository();

function matchesFilters(invoice: Invoice, filters: InvoiceFilters): boolean {
  const month = filters.month?.padStart(2, "0");
  const year = filters.year;

  if (month && invoice.invoiceDate.slice(5, 7) !== month) {
    return false;
  }

  if (year && invoice.invoiceDate.slice(0, 4) !== year) {
    return false;
  }

  if (filters.paymentStatus === "paid" && !invoice.paymentDate) {
    return false;
  }

  if (filters.paymentStatus === "unpaid" && invoice.paymentDate) {
    return false;
  }

  return true;
}

export function useInvoices(filters: InvoiceFilters = {}) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizedFilters = useMemo(
    () => ({
      searchText: filters.searchText?.trim() ?? "",
      month: filters.month?.replace(/\D/g, "").slice(0, 2) ?? "",
      year: filters.year?.replace(/\D/g, "").slice(0, 4) ?? "",
      paymentStatus: filters.paymentStatus ?? "all",
    }),
    [
      filters.month,
      filters.paymentStatus,
      filters.searchText,
      filters.year,
    ],
  );

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const rows = normalizedFilters.searchText
        ? await repository.search(normalizedFilters.searchText)
        : await repository.findAll();

      setInvoices(rows.filter((invoice) => matchesFilters(invoice, normalizedFilters)));
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudieron cargar las facturas",
      );
    } finally {
      setIsLoading(false);
    }
  }, [normalizedFilters]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const remove = useCallback(async (id: string) => {
    await repository.delete(id);
    await refresh();
  }, [refresh]);

  return {
    invoices,
    isLoading,
    error,
    refresh,
    remove,
  };
}
