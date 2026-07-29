import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import type { TaxPayment, TaxPaymentFilters } from "../domain/TaxPayment";
import { useTaxPaymentService } from "../infrastructure/di/ServiceContext";

export function useTaxPayments(filters?: TaxPaymentFilters) {
  const service = useTaxPaymentService();
  const [payments, setPayments] = useState<TaxPayment[]>([]);
  const [totalPaidTax, setTotalPaidTax] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [rows, total] = await Promise.all([
        service.getAll(filtersRef.current),
        service.getTotalPaidTax(),
      ]);
      setPayments(rows);
      setTotalPaidTax(total);
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

  return { payments, totalPaidTax, isLoading, error, refresh, remove };
}
