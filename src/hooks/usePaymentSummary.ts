import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import type { GeneralPayment } from "../domain/GeneralPayment";
import type { TaxPayment } from "../domain/TaxPayment";
import { useGeneralPaymentService, useInvoiceService, useTaxPaymentService } from "../infrastructure/di/ServiceContext";

export interface PaymentSummaryData {
  invoiceCount: number;
  totalInvoiced: number;
  totalNetAmount: number;
  generatedTax: number;
  paidTax: number;
  vatReserve: number;
  vatReserveOverpaid: boolean;
  totalTag: number;
  totalAccountant: number;
  totalSavings: number;
  totalGeneralPayments: number;
}

export interface DashboardState {
  data: PaymentSummaryData;
  recentGeneralPayments: GeneralPayment[];
  recentTaxPayments: TaxPayment[];
  isLoading: boolean;
  error: string | null;
}

const EMPTY_DATA: PaymentSummaryData = {
  invoiceCount: 0,
  totalInvoiced: 0,
  totalNetAmount: 0,
  generatedTax: 0,
  paidTax: 0,
  vatReserve: 0,
  vatReserveOverpaid: false,
  totalTag: 0,
  totalAccountant: 0,
  totalSavings: 0,
  totalGeneralPayments: 0,
};

const INITIAL: DashboardState = {
  data: EMPTY_DATA,
  recentGeneralPayments: [],
  recentTaxPayments: [],
  isLoading: true,
  error: null,
};

export function usePaymentSummary() {
  const invoiceService = useInvoiceService();
  const gpService = useGeneralPaymentService();
  const tpService = useTaxPaymentService();

  const [state, setState] = useState<DashboardState>(INITIAL);

  const refresh = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const [invSummary, gpSummary, paidTax, recentGP, recentTP] = await Promise.all([
        invoiceService.getSummary(),
        gpService.getSummary(),
        tpService.getTotalPaidTax(),
        gpService.findRecent(3),
        tpService.findRecent(3),
      ]);

      const generatedTax = invSummary.totalTaxAmount;
      const vatDiff = generatedTax - paidTax;

      setState({
        data: {
          invoiceCount: invSummary.invoiceCount,
          totalInvoiced: invSummary.totalInvoiceAmount,
          totalNetAmount: invSummary.totalNetAmount,
          generatedTax,
          paidTax,
          vatReserve: vatDiff > 0 ? vatDiff : 0,
          vatReserveOverpaid: vatDiff < 0,
          totalTag: gpSummary.totalTag,
          totalAccountant: gpSummary.totalAccountant,
          totalSavings: gpSummary.totalSavings,
          totalGeneralPayments: gpSummary.totalGeneralPayments,
        },
        recentGeneralPayments: recentGP,
        recentTaxPayments: recentTP,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo cargar el resumen";
      if (__DEV__) {
        console.error("[Dashboard] refresh failed:", err);
      }
      setState((prev) => ({ ...prev, isLoading: false, error: msg }));
    }
  }, [invoiceService, gpService, tpService]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { ...state, refresh };
}
