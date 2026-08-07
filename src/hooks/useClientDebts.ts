import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import type { Invoice } from "../domain/Invoice";
import { useInvoiceService } from "../infrastructure/di/ServiceContext";
import { toErrorMessage } from "../utils/errors";
import {
  calculateClientDebts,
  summarizeClientDebts,
  type ClientDebt,
} from "../utils/clientDebts";

export function useClientDebts() {
  const invoiceService = useInvoiceService();
  const [debts, setDebts] = useState<ClientDebt[]>([]);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const invoices = await invoiceService.getAll();
      setAllInvoices(invoices);
      setDebts(calculateClientDebts(invoices));
    } catch (currentError) {
      setError(
        toErrorMessage(
          currentError,
          "No se pudieron calcular las deudas de clientes",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [invoiceService]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const pendingInvoices = useMemo(
    () => allInvoices.filter((invoice) => invoice.status === "pending"),
    [allInvoices],
  );
  const summary = useMemo(() => summarizeClientDebts(debts), [debts]);

  return {
    debts,
    pendingInvoices,
    summary,
    isLoading,
    error,
    refresh,
  };
}
