import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";

import type { TaxPayment, TaxPaymentFilters } from "../domain/TaxPayment";
import { useTaxPaymentService } from "../infrastructure/di/ServiceContext";
import { filtersToKey } from "../utils/filters";
import { hapticLight } from "../utils/haptics";

export function useTaxPayments(filters?: TaxPaymentFilters) {
  const service = useTaxPaymentService();
  const [payments, setPayments] = useState<TaxPayment[]>([]);
  const [totalPaidTax, setTotalPaidTax] = useState(0);
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
      const [rows, total] = await Promise.all([
        service.getAll(filtersRef.current),
        service.getTotalPaidTax(),
      ]);
      if (requestId !== requestIdRef.current) return;
      setPayments(rows);
      setTotalPaidTax(total);
    } catch (currentError) {
      if (requestId !== requestIdRef.current) return;
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudieron cargar los pagos",
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        hapticLight();
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

  return { payments, totalPaidTax, isLoading, error, refresh, remove };
}
