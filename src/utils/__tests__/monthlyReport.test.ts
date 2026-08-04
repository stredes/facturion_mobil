import type { GeneralPayment } from "../../domain/GeneralPayment";
import type { Invoice } from "../../domain/Invoice";
import type { Retention } from "../../domain/Retention";
import type { TaxPayment } from "../../domain/TaxPayment";
import {
  DEFAULT_MONTHLY_REPORT_SECTIONS,
  buildMonthlyReport,
  hasSelectedMonthlyReportSection,
} from "../monthlyReport";

describe("buildMonthlyReport", () => {
  it("genera un informe mensual completo con totales y registros", () => {
    const report = buildMonthlyReport({
      period: "2026-08",
      sections: DEFAULT_MONTHLY_REPORT_SECTIONS,
      generatedAt: "2026-08-04T10:00:00.000Z",
      invoices: [invoice()],
      taxPayments: [taxPayment()],
      generalPayments: [generalPayment()],
      retentions: [retention()],
    });

    expect(report).toContain("INFORME MENSUAL FACTRION");
    expect(report).toContain("Periodo: agosto de 2026 (2026-08)");
    expect(report).toContain("Facturas: 1");
    expect(report).toContain("Pagos IVA: 1");
    expect(report).toContain("Pagos generales: 1");
    expect(report).toContain("Retenciones: 1");
    expect(report).toContain("F-100");
    expect(report).toContain("Cliente Demo");
    expect(report).toContain("Referencia RET-1");
  });

  it("omite las secciones que no fueron seleccionadas", () => {
    const report = buildMonthlyReport({
      period: "2026-08",
      sections: {
        invoices: true,
        taxPayments: false,
        generalPayments: false,
        retentions: false,
      },
      generatedAt: "2026-08-04T10:00:00.000Z",
      invoices: [invoice()],
      taxPayments: [taxPayment()],
      generalPayments: [generalPayment()],
      retentions: [retention()],
    });

    expect(report).toContain("Facturas");
    expect(report).not.toContain("Pagos IVA");
    expect(report).not.toContain("Pagos generales");
    expect(report).not.toContain("Retenciones");
  });

  it("informa cuando una seccion seleccionada no tiene registros", () => {
    const report = buildMonthlyReport({
      period: "2026-08",
      sections: {
        invoices: false,
        taxPayments: false,
        generalPayments: false,
        retentions: true,
      },
      generatedAt: "2026-08-04T10:00:00.000Z",
      invoices: [],
      taxPayments: [],
      generalPayments: [],
      retentions: [],
    });

    expect(report).toContain("- Sin retenciones en el periodo.");
  });
});

describe("hasSelectedMonthlyReportSection", () => {
  it("detecta si al menos una seccion esta activa", () => {
    expect(
      hasSelectedMonthlyReportSection({
        invoices: false,
        taxPayments: false,
        generalPayments: false,
        retentions: false,
      }),
    ).toBe(false);

    expect(
      hasSelectedMonthlyReportSection({
        invoices: false,
        taxPayments: true,
        generalPayments: false,
        retentions: false,
      }),
    ).toBe(true);
  });
});

function invoice(): Invoice {
  return {
    id: "inv-1",
    invoiceNumber: "F-100",
    invoiceDate: "2026-08-03",
    clientName: "Cliente Demo",
    description: "Servicio mensual",
    netAmount: 100000,
    taxAmount: 19000,
    totalAmount: 119000,
    paymentDate: "2026-08-10",
    taxPayment: 19000,
    tagAmount: 5000,
    accountantAmount: 4000,
    savingsAmount: 3000,
    createdAt: "2026-08-03T10:00:00.000Z",
    updatedAt: "2026-08-03T10:00:00.000Z",
  };
}

function taxPayment(): TaxPayment {
  return {
    id: "tax-1",
    taxPeriod: "2026-08",
    paymentDate: "2026-08-12",
    amount: 19000,
    description: "Pago F29",
    reference: "IVA-1",
    sourceInvoiceId: null,
    sourceType: "manual",
    createdAt: "2026-08-12T10:00:00.000Z",
    updatedAt: "2026-08-12T10:00:00.000Z",
  };
}

function generalPayment(): GeneralPayment {
  return {
    id: "gp-1",
    category: "tag",
    paymentDate: "2026-08-08",
    amount: 5000,
    description: "Pago TAG",
    reference: "TAG-1",
    sourceInvoiceId: null,
    sourceType: "manual",
    createdAt: "2026-08-08T10:00:00.000Z",
    updatedAt: "2026-08-08T10:00:00.000Z",
  };
}

function retention(): Retention {
  return {
    id: "ret-1",
    category: "tax",
    retentionDate: "2026-08-09",
    amount: 7000,
    description: "Retencion IVA",
    reference: "RET-1",
    createdAt: "2026-08-09T10:00:00.000Z",
    updatedAt: "2026-08-09T10:00:00.000Z",
  };
}
