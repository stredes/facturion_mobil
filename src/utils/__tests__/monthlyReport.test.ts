import type { GeneralPayment } from "../../domain/GeneralPayment";
import type { Invoice } from "../../domain/Invoice";
import type { Retention } from "../../domain/Retention";
import type { TaxPayment } from "../../domain/TaxPayment";
import {
  DEFAULT_MONTHLY_REPORT_SECTIONS,
  buildMonthlyReport,
  buildMonthlyReportFileName,
  buildMonthlyReportHtml,
  hasSelectedMonthlyReportSection,
} from "../monthlyReport";

describe("buildMonthlyReport", () => {
  it("genera una vista previa de varios meses con totales", () => {
    const report = buildMonthlyReport({
      periods: [
        {
          period: "2026-08",
          invoices: [invoice()],
          taxPayments: [taxPayment()],
          generalPayments: [generalPayment()],
          retentions: [retention()],
        },
        {
          period: "2026-07",
          invoices: [{ ...invoice(), id: "inv-2", invoiceNumber: "F-099" }],
          taxPayments: [],
          generalPayments: [],
          retentions: [],
        },
      ],
      sections: DEFAULT_MONTHLY_REPORT_SECTIONS,
      generatedAt: "2026-08-04T10:00:00.000Z",
    });

    expect(report).toContain("INFORME MENSUAL FACTRION");
    expect(report).toContain("julio de 2026 (2026-07)");
    expect(report).toContain("agosto de 2026 (2026-08)");
    expect(report).toContain("Facturas: 2");
    expect(report).toContain("Pagos IVA: 1");
    expect(report).toContain("Retenciones: 1");
  });

  it("omite las secciones que no fueron seleccionadas", () => {
    const report = buildMonthlyReport({
      periods: [periodData()],
      sections: {
        invoices: true,
        taxPayments: false,
        generalPayments: false,
        retentions: false,
      },
      generatedAt: "2026-08-04T10:00:00.000Z",
    });

    expect(report).toContain("Facturas");
    expect(report).not.toContain("Pagos IVA");
    expect(report).not.toContain("Pagos generales");
    expect(report).not.toContain("Retenciones");
  });

  it("excluye las facturas pendientes de los totales pero las mantiene en el detalle", () => {
    const pending = {
      ...invoice(),
      id: "inv-pending",
      invoiceNumber: "F-200",
      status: "pending" as const,
      paymentDate: null,
    };
    const report = buildMonthlyReport({
      periods: [
        {
          period: "2026-08",
          invoices: [invoice(), pending],
          taxPayments: [],
          generalPayments: [],
          retentions: [],
        },
      ],
      sections: {
        invoices: true,
        taxPayments: false,
        generalPayments: false,
        retentions: false,
      },
      generatedAt: "2026-08-04T10:00:00.000Z",
    });

    expect(report).toContain("Facturas: 1");
    expect(report).toContain("Facturas: 2 | Total $238.000");
  });
});

describe("buildMonthlyReportHtml", () => {
  it("genera HTML profesional para PDF", () => {
    const html = buildMonthlyReportHtml({
      periods: [periodData()],
      sections: DEFAULT_MONTHLY_REPORT_SECTIONS,
      generatedAt: "2026-08-04T10:00:00.000Z",
    });

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Informe mensual");
    expect(html).toContain("Resumen general");
    expect(html).toContain("Facturas");
    expect(html).toContain("Cliente Demo");
    expect(html).toContain("Retenciones");
  });

  it("escapa texto de usuario para no romper el documento", () => {
    const html = buildMonthlyReportHtml({
      periods: [
        {
          ...periodData(),
          invoices: [
            {
              ...invoice(),
              clientName: "<Cliente & Demo>",
              description: 'Servicio "especial"',
            },
          ],
        },
      ],
      sections: DEFAULT_MONTHLY_REPORT_SECTIONS,
      generatedAt: "2026-08-04T10:00:00.000Z",
    });

    expect(html).toContain("&lt;Cliente &amp; Demo&gt;");
    expect(html).toContain("Servicio &quot;especial&quot;");
  });
});

describe("buildMonthlyReportFileName", () => {
  it("usa el rango de meses seleccionados", () => {
    expect(
      buildMonthlyReportFileName({
        periods: [
          { ...periodData(), period: "2026-08" },
          { ...periodData(), period: "2026-06" },
        ],
        sections: DEFAULT_MONTHLY_REPORT_SECTIONS,
      }),
    ).toBe("Factrion-Informe-2026-06-a-2026-08.pdf");
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

function periodData() {
  return {
    period: "2026-08",
    invoices: [invoice()],
    taxPayments: [taxPayment()],
    generalPayments: [generalPayment()],
    retentions: [retention()],
  };
}

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
    status: "paid",
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
