import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import type {
  GeneralPayment,
  GeneralPaymentFilters,
  GeneralPaymentSummary,
} from "../domain/GeneralPayment";
import { useGeneralPaymentService } from "../infrastructure/di/ServiceContext";

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

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [rows, summ] = await Promise.all([
        service.getAll(filtersRef.current),
        service.getSummary(),
      ]);
      setPayments(rows);
      setSummary(summ);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudieron cargar los pagos",
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

  return { payments, summary, isLoading, error, refresh, remove };
}
