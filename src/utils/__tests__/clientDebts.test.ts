import type { Invoice } from "../../domain/Invoice";
import {
  calculateClientDebts,
  filterClientDebts,
  getPendingInvoicesForClient,
  summarizeClientDebts,
} from "../clientDebts";

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

describe("calculateClientDebts", () => {
  it("agrupa facturas pendientes por cliente y suma sus montos", () => {
    const invoices = [
      createInvoice({
        id: "1",
        clientName: "Insumopark",
        status: "pending",
        netAmount: 1000,
        taxAmount: 190,
        totalAmount: 1190,
      }),
      createInvoice({
        id: "2",
        clientName: "Insumopark",
        status: "pending",
        netAmount: 2000,
        taxAmount: 380,
        totalAmount: 2380,
      }),
    ];

    const debts = calculateClientDebts(invoices);

    expect(debts).toEqual([
      {
        clientName: "Insumopark",
        pendingCount: 2,
        netAmount: 3000,
        taxAmount: 570,
        totalAmount: 3570,
      },
    ]);
  });

  it("ignora facturas pagadas y canceladas no consideradas pendientes", () => {
    const invoices = [
      createInvoice({
        id: "1",
        clientName: "Amilab",
        status: "pending",
        netAmount: 1000,
        taxAmount: 190,
        totalAmount: 1190,
      }),
      createInvoice({
        id: "2",
        clientName: "Amilab",
        status: "paid",
        netAmount: 5000,
        taxAmount: 950,
        totalAmount: 5950,
      }),
    ];

    const debts = calculateClientDebts(invoices);

    expect(debts).toEqual([
      {
        clientName: "Amilab",
        pendingCount: 1,
        netAmount: 1000,
        taxAmount: 190,
        totalAmount: 1190,
      },
    ]);
  });

  it("ordena los clientes por deuda total descendente", () => {
    const invoices = [
      createInvoice({
        id: "1",
        clientName: "Menor",
        status: "pending",
        netAmount: 500,
        taxAmount: 95,
        totalAmount: 595,
      }),
      createInvoice({
        id: "2",
        clientName: "Mayor",
        status: "pending",
        netAmount: 9000,
        taxAmount: 1710,
        totalAmount: 10710,
      }),
    ];

    const debts = calculateClientDebts(invoices);

    expect(debts.map((debt) => debt.clientName)).toEqual(["Mayor", "Menor"]);
  });

  it("devuelve lista vacia cuando no hay facturas pendientes", () => {
    const invoices = [
      createInvoice({ id: "1", clientName: "Amilab", status: "paid" }),
    ];

    expect(calculateClientDebts(invoices)).toEqual([]);
  });
});

describe("filterClientDebts", () => {
  const debts = [
    {
      clientName: "Insumopark",
      pendingCount: 2,
      netAmount: 3000,
      taxAmount: 570,
      totalAmount: 3570,
    },
    {
      clientName: "Amilab",
      pendingCount: 1,
      netAmount: 1000,
      taxAmount: 190,
      totalAmount: 1190,
    },
  ];

  it("filtra por nombre de cliente sin distinguir mayusculas/minusculas", () => {
    expect(filterClientDebts(debts, "insumo")).toEqual([debts[0]]);
    expect(filterClientDebts(debts, "AMILAB")).toEqual([debts[1]]);
  });

  it("ignora espacios al inicio y final de la busqueda", () => {
    expect(filterClientDebts(debts, "  amilab  ")).toEqual([debts[1]]);
  });

  it("devuelve la lista completa con busqueda vacia", () => {
    expect(filterClientDebts(debts, "")).toEqual(debts);
    expect(filterClientDebts(debts, "   ")).toEqual(debts);
  });

  it("devuelve lista vacia cuando ningun cliente coincide", () => {
    expect(filterClientDebts(debts, "inexistente")).toEqual([]);
  });
});

describe("getPendingInvoicesForClient", () => {
  it("devuelve solo las facturas pendientes del cliente", () => {
    const invoices = [
      createInvoice({
        id: "1",
        clientName: "Insumopark",
        status: "pending",
        invoiceDate: "2026-01-10",
      }),
      createInvoice({
        id: "2",
        clientName: "Insumopark",
        status: "paid",
        invoiceDate: "2026-02-10",
      }),
      createInvoice({
        id: "3",
        clientName: "Amilab",
        status: "pending",
        invoiceDate: "2026-03-10",
      }),
    ];

    const result = getPendingInvoicesForClient(invoices, "Insumopark");

    expect(result.map((invoice) => invoice.id)).toEqual(["1"]);
  });

  it("ordena las facturas por fecha descendente", () => {
    const invoices = [
      createInvoice({
        id: "1",
        clientName: "Insumopark",
        status: "pending",
        invoiceDate: "2026-01-10",
      }),
      createInvoice({
        id: "2",
        clientName: "Insumopark",
        status: "pending",
        invoiceDate: "2026-03-10",
      }),
      createInvoice({
        id: "3",
        clientName: "Insumopark",
        status: "pending",
        invoiceDate: "2026-02-10",
      }),
    ];

    const result = getPendingInvoicesForClient(invoices, "Insumopark");

    expect(result.map((invoice) => invoice.id)).toEqual(["2", "3", "1"]);
  });

  it("devuelve lista vacia cuando el cliente no tiene pendientes", () => {
    const invoices = [
      createInvoice({ id: "1", clientName: "Insumopark", status: "paid" }),
    ];

    expect(getPendingInvoicesForClient(invoices, "Insumopark")).toEqual([]);
  });
});

describe("summarizeClientDebts", () => {
  it("acumula clientes, facturas y montos", () => {
    const summary = summarizeClientDebts([
      {
        clientName: "A",
        pendingCount: 2,
        netAmount: 3000,
        taxAmount: 570,
        totalAmount: 3570,
      },
      {
        clientName: "B",
        pendingCount: 1,
        netAmount: 1000,
        taxAmount: 190,
        totalAmount: 1190,
      },
    ]);

    expect(summary).toEqual({
      totalClients: 2,
      totalPendingInvoices: 3,
      totalNetAmount: 4000,
      totalTaxAmount: 760,
      totalAmount: 4760,
    });
  });

  it("devuelve ceros sin deudas", () => {
    expect(summarizeClientDebts([])).toEqual({
      totalClients: 0,
      totalPendingInvoices: 0,
      totalNetAmount: 0,
      totalTaxAmount: 0,
      totalAmount: 0,
    });
  });
});
