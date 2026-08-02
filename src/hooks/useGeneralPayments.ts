import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";

import type {
  GeneralPayment,
  GeneralPaymentFilters,
  GeneralPaymentSummary,
} from "../domain/GeneralPayment";
import { useGeneralPaymentService } from "../infrastructure/di/ServiceContext";
import { filtersToKey } from "../utils/filters";
import { hapticLight } from "../utils/haptics";

export function useGeneralPayments(filters?: GeneralPaymentFilters) {
  const service = useGeneralPaymentService();
  const [payments, setPayments] = useState<GeneralPayment[]>([]);
  const [summary, setSummary] = useState<GeneralPaymentSummary>({
    totalTag: 0,
    totalAccountant: 0,
    totalSavings: 0,
    totalGeneralPayments: 0,
  });
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
      const [rows, summ] = await Promise.all([
        service.getAll(filtersRef.current),
        service.getSummary(),
      ]);
      if (requestId !== requestIdRef.current) return;
      setPayments(rows);
      setSummary(summ);
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

  return { payments, summary, isLoading, error, refresh, remove };
}
