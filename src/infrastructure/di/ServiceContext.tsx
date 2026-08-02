import { createContext, useContext, useMemo, type ReactNode } from "react";

import { GeneralPaymentService } from "../../application/GeneralPaymentService";
import { InvoiceService } from "../../application/InvoiceService";
import { RetentionService } from "../../application/RetentionService";
import { TaxPaymentService } from "../../application/TaxPaymentService";
import { SQLiteGeneralPaymentRepository } from "../repositories/SQLiteGeneralPaymentRepository";
import { SQLiteInvoiceRepository } from "../repositories/SQLiteInvoiceRepository";
import { SQLiteRetentionRepository } from "../repositories/SQLiteRetentionRepository";
import { SQLiteTaxPaymentRepository } from "../repositories/SQLiteTaxPaymentRepository";

interface Services {
  invoiceService: InvoiceService;
  generalPaymentService: GeneralPaymentService;
  taxPaymentService: TaxPaymentService;
  retentionService: RetentionService;
}

const ServiceContext = createContext<Services | null>(null);

export function ServiceProvider({ children }: { children: ReactNode }) {
  const services = useMemo(
    () => ({
      invoiceService: new InvoiceService(new SQLiteInvoiceRepository()),
      generalPaymentService: new GeneralPaymentService(
        new SQLiteGeneralPaymentRepository(),
      ),
      taxPaymentService: new TaxPaymentService(
        new SQLiteTaxPaymentRepository(),
      ),
      retentionService: new RetentionService(
        new SQLiteRetentionRepository(),
      ),
    }),
    [],
  );

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useInvoiceService(): InvoiceService {
  const ctx = useContext(ServiceContext);
  if (!ctx) {
    throw new Error(
      "useInvoiceService debe usarse dentro de un ServiceProvider",
    );
  }
  return ctx.invoiceService;
}

export function useGeneralPaymentService(): GeneralPaymentService {
  const ctx = useContext(ServiceContext);
  if (!ctx) {
    throw new Error(
      "useGeneralPaymentService debe usarse dentro de un ServiceProvider",
    );
  }
  return ctx.generalPaymentService;
}

export function useTaxPaymentService(): TaxPaymentService {
  const ctx = useContext(ServiceContext);
  if (!ctx) {
    throw new Error(
      "useTaxPaymentService debe usarse dentro de un ServiceProvider",
    );
  }
  return ctx.taxPaymentService;
}

export function useRetentionService(): RetentionService {
  const ctx = useContext(ServiceContext);
  if (!ctx) {
    throw new Error(
      "useRetentionService debe usarse dentro de un ServiceProvider",
    );
  }
  return ctx.retentionService;
}
