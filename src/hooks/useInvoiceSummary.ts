import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import type {
  InvoiceSummary,
  MonthlyInvoiceSummary,
} from "../domain/Invoice";
import { SQLiteInvoiceRepository } from "../infrastructure/repositories/SQLiteInvoiceRepository";

const repository = new SQLiteInvoiceRepository();

const EMPTY_SUMMARY: InvoiceSummary = {
  invoiceCount: 0,
  totalNetAmount: 0,
  totalTaxAmount: 0,
  totalInvoiceAmount: 0,
  totalTaxPayment: 0,
  totalTagAmount: 0,
  totalAccountantAmount: 0,
  totalSavingsAmount: 0,
  totalRemainingAmount: 0,
};

export function useInvoiceSummary() {
  const [summary, setSummary] = useState<InvoiceSummary>(EMPTY_SUMMARY);
  const [monthlySummary, setMonthlySummary] = useState<MonthlyInvoiceSummary[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [nextSummary, nextMonthlySummary] = await Promise.all([
        repository.getSummary(),
        repository.getMonthlySummary(),
      ]);

      setSummary(nextSummary);
      setMonthlySummary(nextMonthlySummary);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No se pudo cargar el resumen",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return {
    summary,
    monthlySummary,
    isLoading,
    error,
    refresh,
  };
}
