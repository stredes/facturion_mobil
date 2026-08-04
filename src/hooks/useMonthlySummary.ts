import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import {
  useGeneralPaymentService,
  useInvoiceService,
  useRetentionService,
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
  const retentionService = useRetentionService();

  const [combined, setCombined] = useState<CombinedMonth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [invoiceMonths, generalMonths, taxMonths, retentionMonths] =
        await Promise.all([
          invoiceService.getMonthlySummary(),
          generalPaymentService.getMonthlySummary(),
          taxPaymentService.getMonthlySummary(),
          retentionService.getMonthlySummary(),
        ]);

      setCombined(
        combineMonthlySummaries(
          invoiceMonths,
          generalMonths,
          taxMonths,
          retentionMonths,
        ),
      );
    } catch (currentError) {
      setError(toErrorMessage(currentError, "No se pudo cargar el resumen"));
    } finally {
      setIsLoading(false);
    }
  }, [
    invoiceService,
    generalPaymentService,
    taxPaymentService,
    retentionService,
  ]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { combined, isLoading, error, refresh };
}
