import type { Invoice } from "../../domain/Invoice";
import {
  buildClientDebtReport,
  buildClientDebtReportFileName,
  buildClientDebtReportHtml,
  calculateClientDebtTotals,
} from "../clientDebtReport";

function createInvoice(
  overrides: Partial<Invoice> & Pick<Invoice, "id" | "clientName" | "status">,
): Invoice {
  return {
    invoiceNumber: overrides.id,
    invoiceDate: "2026-01-10",
    description: null,
    netAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
    paymentDate: null,
    taxPayment: 0,
    tagAmount: 0,
    accountantAmount: 0,
    savingsAmount: 0,
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
    ...overrides,
  };
}

describe("calculateClientDebtTotals", () => {
  it("suma neto, IVA y total de las facturas", () => {
    const invoices = [
      createInvoice({
        id: "F1",
        clientName: "Insumopark",
        status: "pending",
        netAmount: 1000,
        taxAmount: 190,
        totalAmount: 1190,
      }),
      createInvoice({
        id: "F2",
        clientName: "Insumopark",
        status: "pending",
        netAmount: 2000,
        taxAmount: 380,
        totalAmount: 2380,
      }),
    ];

    expect(calculateClientDebtTotals(invoices)).toEqual({
      invoiceCount: 2,
      netAmount: 3000,
      taxAmount: 570,
      totalAmount: 3570,
    });
  });

  it("devuelve ceros sin facturas", () => {
    expect(calculateClientDebtTotals([])).toEqual({
      invoiceCount: 0,
      netAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
    });
  });
});

describe("buildClientDebtReportFileName", () => {
  it("genera nombre con el cliente saneado", () => {
    expect(buildClientDebtReportFileName("Insumopark Ltda.")).toBe(
      "Factrion-Deuda-Insumopark-Ltda..pdf",
    );
  });

  it("reemplaza espacios y caracteres invalidos", () => {
    expect(buildClientDebtReportFileName("Cliente: X/Y Z")).toBe(
      "Factrion-Deuda-Cliente-XY-Z.pdf",
    );
  });

  it("usa cliente por defecto cuando el nombre esta vacio", () => {
    expect(buildClientDebtReportFileName("   ")).toBe(
      "Factrion-Deuda-cliente.pdf",
    );
  });
});

describe("buildClientDebtReport", () => {
  it("incluye cliente, totales y cada factura", () => {
    const report = buildClientDebtReport({
      clientName: "Insumopark",
      invoices: [
        createInvoice({
          id: "F1",
          clientName: "Insumopark",
          status: "pending",
          invoiceDate: "2026-01-10",
          netAmount: 1000,
          taxAmount: 190,
          totalAmount: 1190,
        }),
      ],
      generatedAt: "2026-01-10T12:00:00.000Z",
    });

    expect(report).toContain("INFORME DE DEUDA FACTRION");
    expect(report).toContain("Cliente: Insumopark");
    expect(report).toContain("Facturas pendientes: 1");
    expect(report).toContain("Total a cobrar: $1.190");
    expect(report).toContain("F1 | 10-01-2026");
  });
});

describe("buildClientDebtReportHtml", () => {
  it("construye un documento HTML con el cliente y las facturas", () => {
    const html = buildClientDebtReportHtml({
      clientName: "Insumopark",
      invoices: [
        createInvoice({
          id: "F1",
          clientName: "Insumopark",
          status: "pending",
          invoiceDate: "2026-01-10",
          netAmount: 1000,
          taxAmount: 190,
          totalAmount: 1190,
        }),
      ],
    });

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Informe de deuda");
    expect(html).toContain("Insumopark");
    expect(html).toContain("F1");
    expect(html).toContain("Total a cobrar");
  });

  it("escapa caracteres peligrosos del nombre del cliente", () => {
    const html = buildClientDebtReportHtml({
      clientName: "Cliente <script> & amigos",
      invoices: [],
    });

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
  });
});
