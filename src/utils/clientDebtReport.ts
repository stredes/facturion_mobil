import type { Invoice } from "../domain/Invoice";
import { formatCurrency } from "./currency";
import { formatDisplayDate } from "./dates";
import {
  buildReportCss,
  emptySection,
  escapeHtml,
  summaryCard,
  tableRow,
} from "./monthlyReport";

export interface ClientDebtReportData {
  clientName: string;
  invoices: Invoice[];
  generatedAt?: string;
}

export interface ClientDebtReportTotals {
  invoiceCount: number;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
}

const generatedAtFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "long",
  timeStyle: "short",
});

export function buildClientDebtReportFileName(clientName: string): string {
  return `Factrion-Deuda-${sanitizeFileName(clientName)}.pdf`;
}

export function buildClientDebtReport(data: ClientDebtReportData): string {
  const totals = calculateClientDebtTotals(data.invoices);
  const lines = [
    "INFORME DE DEUDA FACTRION",
    `Cliente: ${data.clientName}`,
    `Generado: ${formatGeneratedAt(data.generatedAt)}`,
    "",
    `Facturas pendientes: ${totals.invoiceCount}`,
    `Neto: ${formatCurrency(totals.netAmount)}`,
    `IVA: ${formatCurrency(totals.taxAmount)}`,
    `Total a cobrar: ${formatCurrency(totals.totalAmount)}`,
    "",
  ];

  sortInvoicesDesc(data.invoices).forEach((invoice) => {
    lines.push(
      [
        `- ${invoice.invoiceNumber}`,
        formatDisplayDate(invoice.invoiceDate),
        formatCurrency(invoice.netAmount),
        formatCurrency(invoice.taxAmount),
        formatCurrency(invoice.totalAmount),
      ].join(" | "),
    );
  });

  return lines.join("\n").trimEnd();
}

export function buildClientDebtReportHtml(data: ClientDebtReportData): string {
  const invoices = sortInvoicesDesc(data.invoices);
  const totals = calculateClientDebtTotals(invoices);
  const generatedAt = formatGeneratedAt(data.generatedAt);

  return [
    "<!doctype html>",
    '<html lang="es">',
    "<head>",
    '<meta charset="utf-8" />',
    "<title>Informe de deuda Factrion</title>",
    "<style>",
    buildReportCss(),
    DEBT_REPORT_EXTRA_CSS,
    "</style>",
    "</head>",
    "<body>",
    '<header class="cover">',
    '<div class="brand">Factrion</div>',
    "<h1>Informe de deuda</h1>",
    `<p class="periods">Cliente: ${escapeHtml(data.clientName)}</p>`,
    `<p class="generated">Generado: ${escapeHtml(generatedAt)}</p>`,
    "</header>",
    buildClientDebtSummary(totals),
    buildPendingInvoicesSection(invoices),
    "</body>",
    "</html>",
  ].join("");
}

export function calculateClientDebtTotals(
  invoices: Invoice[],
): ClientDebtReportTotals {
  return {
    invoiceCount: invoices.length,
    netAmount: sumAmounts(invoices, (invoice) => invoice.netAmount),
    taxAmount: sumAmounts(invoices, (invoice) => invoice.taxAmount),
    totalAmount: sumAmounts(invoices, (invoice) => invoice.totalAmount),
  };
}

function buildClientDebtSummary(totals: ClientDebtReportTotals): string {
  const cards = [
    summaryCard(
      "Facturas pendientes",
      totals.invoiceCount.toString(),
      totals.invoiceCount === 1 ? "factura por cobrar" : "facturas por cobrar",
    ),
    summaryCard("Neto", formatCurrency(totals.netAmount)),
    summaryCard("IVA", formatCurrency(totals.taxAmount)),
  ];

  return `
    <section class="summary">
      <h2>Resumen de la deuda</h2>
      <div class="summary-grid">${cards.join("")}</div>
      <div class="debt-total">
        <span>Total a cobrar</span>
        <strong>${escapeHtml(formatCurrency(totals.totalAmount))}</strong>
      </div>
    </section>
  `;
}

function buildPendingInvoicesSection(invoices: Invoice[]): string {
  if (invoices.length === 0) {
    return emptySection("Facturas pendientes", "El cliente no tiene facturas pendientes.");
  }

  const rows = invoices
    .map((invoice) =>
      tableRow([
        invoice.invoiceNumber,
        formatDisplayDate(invoice.invoiceDate),
        invoice.description ?? "-",
        formatCurrency(invoice.netAmount),
        formatCurrency(invoice.taxAmount),
        formatCurrency(invoice.totalAmount),
      ]),
    )
    .join("");

  const totals = calculateClientDebtTotals(invoices);
  const totalsRow = tableRow([
    "TOTAL",
    "-",
    "-",
    formatCurrency(totals.netAmount),
    formatCurrency(totals.taxAmount),
    formatCurrency(totals.totalAmount),
  ]);

  return `
    <section class="period">
      <div class="table-block">
        <h3>Facturas pendientes</h3>
        <table>
          <thead>
            <tr>
              <th>Numero</th>
              <th>Fecha</th>
              <th>Detalle</th>
              <th>Neto</th>
              <th>IVA</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>${totalsRow}</tfoot>
        </table>
      </div>
    </section>
  `;
}

function sumAmounts(invoices: Invoice[], pickAmount: (item: Invoice) => number): number {
  return invoices.reduce((total, invoice) => total + pickAmount(invoice), 0);
}

function sortInvoicesDesc(invoices: Invoice[]): Invoice[] {
  return [...invoices].sort((left, right) =>
    right.invoiceDate.localeCompare(left.invoiceDate),
  );
}

function sanitizeFileName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "cliente";
  }

  return trimmed
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatGeneratedAt(value?: string): string {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return value ?? "";
  }

  return generatedAtFormatter.format(date);
}

const DEBT_REPORT_EXTRA_CSS = `
  .debt-total {
    align-items: baseline;
    background: #123b5d;
    border-radius: 8px;
    color: #ffffff;
    display: flex;
    justify-content: space-between;
    margin-top: 14px;
    padding: 12px 16px;
  }

  .debt-total span {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .debt-total strong {
    font-size: 18px;
  }

  tfoot td {
    background: #eef3f8;
    border-top: 2px solid #123b5d;
    font-weight: 800;
  }
`;
