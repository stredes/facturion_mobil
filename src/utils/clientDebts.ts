import type { Invoice } from "../domain/Invoice";

export interface ClientDebt {
  clientName: string;
  pendingCount: number;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface ClientDebtsSummary {
  totalClients: number;
  totalPendingInvoices: number;
  totalNetAmount: number;
  totalTaxAmount: number;
  totalAmount: number;
}

function createEmptyDebt(clientName: string): ClientDebt {
  return {
    clientName,
    pendingCount: 0,
    netAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
  };
}

export function calculateClientDebts(invoices: Invoice[]): ClientDebt[] {
  const grouped = new Map<string, ClientDebt>();

  for (const invoice of invoices) {
    if (invoice.status !== "pending") {
      continue;
    }

    const existing = grouped.get(invoice.clientName);
    const debt = existing ?? createEmptyDebt(invoice.clientName);
    debt.pendingCount += 1;
    debt.netAmount += invoice.netAmount;
    debt.taxAmount += invoice.taxAmount;
    debt.totalAmount += invoice.totalAmount;
    grouped.set(invoice.clientName, debt);
  }

  return Array.from(grouped.values()).sort(
    (left, right) => right.totalAmount - left.totalAmount,
  );
}

export function getPendingInvoicesForClient(
  invoices: Invoice[],
  clientName: string,
): Invoice[] {
  return invoices
    .filter(
      (invoice) => invoice.status === "pending" && invoice.clientName === clientName,
    )
    .sort((left, right) => right.invoiceDate.localeCompare(left.invoiceDate));
}

export function filterClientDebts(
  debts: ClientDebt[],
  query: string,
): ClientDebt[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return debts;
  }

  return debts.filter((debt) =>
    debt.clientName.toLowerCase().includes(normalizedQuery),
  );
}

export function summarizeClientDebts(debts: ClientDebt[]): ClientDebtsSummary {
  return debts.reduce<ClientDebtsSummary>(
    (summary, debt) => ({
      totalClients: summary.totalClients + 1,
      totalPendingInvoices: summary.totalPendingInvoices + debt.pendingCount,
      totalNetAmount: summary.totalNetAmount + debt.netAmount,
      totalTaxAmount: summary.totalTaxAmount + debt.taxAmount,
      totalAmount: summary.totalAmount + debt.totalAmount,
    }),
    {
      totalClients: 0,
      totalPendingInvoices: 0,
      totalNetAmount: 0,
      totalTaxAmount: 0,
      totalAmount: 0,
    },
  );
}
