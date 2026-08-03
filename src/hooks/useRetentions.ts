import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";

import type {
  Retention,
  RetentionFilters,
  RetentionSummary,
} from "../domain/Retention";
import { useRetentionService } from "../infrastructure/di/ServiceContext";
import { filtersToKey } from "../utils/filters";
import { hapticLight } from "../utils/haptics";

export function useRetentions(filters?: RetentionFilters) {
  const service = useRetentionService();
  const [retentions, setRetentions] = useState<Retention[]>([]);
  const [summary, setSummary] = useState<RetentionSummary>({
    totalTax: 0,
    totalTag: 0,
    totalAccountant: 0,
    totalSavings: 0,
    totalRetentions: 0,
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
      setRetentions(rows);
      setSummary(summ);
    } catch (currentError) {
      if (requestId !== requestIdRef.current) return;
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudieron cargar las retenciones",
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

  return { retentions, summary, isLoading, error, refresh, remove };
}
