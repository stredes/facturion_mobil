import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import type { Invoice, InvoiceFilters } from "../domain/Invoice";
import { useInvoiceService } from "../infrastructure/di/ServiceContext";

export function useInvoices(filters: InvoiceFilters = {}) {
  const service = useInvoiceService();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const rows = await service.getAll(filtersRef.current);
      setInvoices(rows);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudieron cargar las facturas",
      );
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const remove = useCallback(
    async (id: string) => {
      await service.delete(id);
      await refresh();
    },
    [service, refresh],
  );

  return {
    invoices,
    isLoading,
    error,
    refresh,
    remove,
  };
}
