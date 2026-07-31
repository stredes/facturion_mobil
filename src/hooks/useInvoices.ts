import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";

import type { Invoice, InvoiceFilters } from "../domain/Invoice";
import { useInvoiceService } from "../infrastructure/di/ServiceContext";
import { filtersToKey } from "../utils/filters";

export function useInvoices(filters: InvoiceFilters = {}) {
  const service = useInvoiceService();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const filtersKey = useMemo(() => filtersToKey(filters), [filters]);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const rows = await service.getAll(filtersRef.current);
      if (requestId !== requestIdRef.current) return;
      setInvoices(rows);
    } catch (currentError) {
      if (requestId !== requestIdRef.current) return;
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudieron cargar las facturas",
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [service, filtersKey]);

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
