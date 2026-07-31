import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import {
  useGeneralPaymentService,
  useInvoiceService,
  useTaxPaymentService,
} from "../infrastructure/di/ServiceContext";
import { toErrorMessage } from "../utils/errors";
import {
  combineMonthlySummaries,
  type CombinedMonth,
} from "../utils/monthlySummary";

export function useMonthlySummary() {
  const invoiceService = useInvoiceService();
  const generalPaymentService = useGeneralPaymentService();
  const taxPaymentService = useTaxPaymentService();

  const [combined, setCombined] = useState<CombinedMonth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [invoiceMonths, generalMonths, taxMonths] = await Promise.all([
        invoiceService.getMonthlySummary(),
        generalPaymentService.getMonthlySummary(),
        taxPaymentService.getMonthlySummary(),
      ]);

      setCombined(
        combineMonthlySummaries(invoiceMonths, generalMonths, taxMonths),
      );
    } catch (currentError) {
      setError(toErrorMessage(currentError, "No se pudo cargar el resumen"));
    } finally {
      setIsLoading(false);
    }
  }, [invoiceService, generalPaymentService, taxPaymentService]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { combined, isLoading, error, refresh };
}
