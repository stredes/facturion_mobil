import type { GeneralPayment } from "../domain/GeneralPayment";
import type { Invoice } from "../domain/Invoice";
import type { Retention, RetentionCategory } from "../domain/Retention";
import type { TaxPayment } from "../domain/TaxPayment";
import { formatCurrency } from "./currency";
import { formatDisplayDate, formatMonthPeriod } from "./dates";

export type MonthlyReportSectionKey =
  | "invoices"
  | "taxPayments"
  | "generalPayments"
  | "retentions";

export type MonthlyReportSections = Record<MonthlyReportSectionKey, boolean>;

export interface MonthlyReportSectionOption {
  key: MonthlyReportSectionKey;
  label: string;
}

export interface MonthlyReportPeriodData {
  period: string;
  invoices: Invoice[];
  taxPayments: TaxPayment[];
  generalPayments: GeneralPayment[];
  retentions: Retention[];
}

export interface MonthlyReportData {
  periods: MonthlyReportPeriodData[];
  sections: MonthlyReportSections;
  generatedAt?: string;
}

interface ReportTotals {
  invoiceCount: number;
  invoiceNet: number;
  invoiceTax: number;
  invoiceTotal: number;
  taxPaymentCount: number;
  taxPaymentTotal: number;
  generalPaymentCount: number;
  generalTag: number;
  generalAccountant: number;
  generalSavings: number;
  generalTotal: number;
  retentionCount: number;
  retentionTax: number;
  retentionTag: number;
  retentionAccountant: number;
  retentionSavings: number;
  retentionTotal: number;
}

export const DEFAULT_MONTHLY_REPORT_SECTIONS: MonthlyReportSections = {
  invoices: true,
  taxPayments: true,
  generalPayments: true,
  retentions: true,
};

export const MONTHLY_REPORT_SECTION_OPTIONS: MonthlyReportSectionOption[] = [
  { key: "invoices", label: "Facturas" },
  { key: "taxPayments", label: "Pagos IVA" },
  { key: "generalPayments", label: "Pagos generales" },
  { key: "retentions", label: "Retenciones" },
];

const GENERAL_PAYMENT_CATEGORY_LABELS: Record<string, string> = {
  tag: "TAG",
  accountant: "Contador",
  savings: "Ahorro",
};

const RETENTION_CATEGORY_LABELS: Record<RetentionCategory, string> = {
  tax: "IVA",
  tag: "TAG",
  accountant: "Contador",
  savings: "Ahorro",
};

const generatedAtFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "long",
  timeStyle: "short",
});

export function hasSelectedMonthlyReportSection(
  sections: MonthlyReportSections,
): boolean {
  return MONTHLY_REPORT_SECTION_OPTIONS.some(({ key }) => sections[key]);
}

export function buildMonthlyReportFileName(data: MonthlyReportData): string {
  const periods = sortPeriodsAsc(data.periods.map((period) => period.period));
  const suffix =
    periods.length <= 1
      ? periods[0] ?? "sin-periodo"
      : `${periods[0]}-a-${periods[periods.length - 1]}`;

  return `Factrion-Informe-${suffix}.pdf`;
}

export function buildMonthlyReport(data: MonthlyReportData): string {
  const totals = calculateTotals(data.periods);
  const lines = [
    "INFORME MENSUAL FACTRION",
    `Periodos: ${formatPeriodList(data.periods.map((period) => period.period))}`,
    `Generado: ${formatGeneratedAt(data.generatedAt)}`,
    "",
  ];

  appendTextSummary(lines, data.sections, totals);

  sortPeriodsDesc(data.periods).forEach((period) => {
    lines.push(formatMonthPeriod(period.period));
    appendTextPeriod(lines, period, data.sections);
    lines.push("");
  });

  return lines.join("\n").trimEnd();
}

export function buildMonthlyReportHtml(data: MonthlyReportData): string {
  const periods = sortPeriodsDesc(data.periods);
  const totals = calculateTotals(periods);
  const generatedAt = formatGeneratedAt(data.generatedAt);
  const periodLabel = formatPeriodList(periods.map((period) => period.period));

  return [
    "<!doctype html>",
    '<html lang="es">',
    "<head>",
    '<meta charset="utf-8" />',
    "<title>Informe mensual Factrion</title>",
    "<style>",
    buildReportCss(),
    "</style>",
    "</head>",
    "<body>",
    '<header class="cover">',
    '<div class="brand">Factrion</div>',
    "<h1>Informe mensual</h1>",
    `<p class="periods">${escapeHtml(periodLabel)}</p>`,
    `<p class="generated">Generado: ${escapeHtml(generatedAt)}</p>`,
    "</header>",
    buildExecutiveSummary(data.sections, totals),
    periods.map((period) => buildPeriodSection(period, data.sections)).join(""),
    "</body>",
    "</html>",
  ].join("");
}

function appendTextSummary(
  lines: string[],
  sections: MonthlyReportSections,
  totals: ReportTotals,
): void {
  lines.push("Resumen general");

  if (sections.invoices) {
    lines.push(
      [
        `- Facturas: ${totals.invoiceCount}`,
        `Neto ${formatCurrency(totals.invoiceNet)}`,
        `IVA ${formatCurrency(totals.invoiceTax)}`,
        `Total ${formatCurrency(totals.invoiceTotal)}`,
      ].join(" | "),
    );
  }

  if (sections.taxPayments) {
    lines.push(
      [
        `- Pagos IVA: ${totals.taxPaymentCount}`,
        `Total ${formatCurrency(totals.taxPaymentTotal)}`,
      ].join(" | "),
    );
  }

  if (sections.generalPayments) {
    lines.push(
      [
        `- Pagos generales: ${totals.generalPaymentCount}`,
        `TAG ${formatCurrency(totals.generalTag)}`,
        `Contador ${formatCurrency(totals.generalAccountant)}`,
        `Ahorro ${formatCurrency(totals.generalSavings)}`,
        `Total ${formatCurrency(totals.generalTotal)}`,
      ].join(" | "),
    );
  }

  if (sections.retentions) {
    lines.push(
      [
        `- Retenciones: ${totals.retentionCount}`,
        `IVA ${formatCurrency(totals.retentionTax)}`,
        `TAG ${formatCurrency(totals.retentionTag)}`,
        `Contador ${formatCurrency(totals.retentionAccountant)}`,
        `Ahorro ${formatCurrency(totals.retentionSavings)}`,
        `Total ${formatCurrency(totals.retentionTotal)}`,
      ].join(" | "),
    );
  }

  lines.push("");
}

function appendTextPeriod(
  lines: string[],
  period: MonthlyReportPeriodData,
  sections: MonthlyReportSections,
): void {
  if (sections.invoices) {
    lines.push(
      `Facturas: ${period.invoices.length} | Total ${formatCurrency(
        sum(period.invoices, (invoice) => invoice.totalAmount),
      )}`,
    );
  }

  if (sections.taxPayments) {
    lines.push(
      `Pagos IVA: ${period.taxPayments.length} | Total ${formatCurrency(
        sum(period.taxPayments, (payment) => payment.amount),
      )}`,
    );
  }

  if (sections.generalPayments) {
    lines.push(
      `Pagos generales: ${period.generalPayments.length} | Total ${formatCurrency(
        sum(period.generalPayments, (payment) => payment.amount),
      )}`,
    );
  }

  if (sections.retentions) {
    lines.push(
      `Retenciones: ${period.retentions.length} | Total ${formatCurrency(
        sum(period.retentions, (retention) => retention.amount),
      )}`,
    );
  }
}

function buildExecutiveSummary(
  sections: MonthlyReportSections,
  totals: ReportTotals,
): string {
  const cards: string[] = [];

  if (sections.invoices) {
    cards.push(
      summaryCard(
        "Facturas",
        totals.invoiceCount.toString(),
        `Total ${formatCurrency(totals.invoiceTotal)}`,
      ),
    );
    cards.push(summaryCard("Neto facturado", formatCurrency(totals.invoiceNet)));
    cards.push(summaryCard("IVA generado", formatCurrency(totals.invoiceTax)));
  }

  if (sections.taxPayments) {
    cards.push(
      summaryCard(
        "Pagos IVA",
        totals.taxPaymentCount.toString(),
        `Total ${formatCurrency(totals.taxPaymentTotal)}`,
      ),
    );
  }

  if (sections.generalPayments) {
    cards.push(
      summaryCard(
        "Pagos generales",
        totals.generalPaymentCount.toString(),
        `Total ${formatCurrency(totals.generalTotal)}`,
      ),
    );
  }

  if (sections.retentions) {
    cards.push(
      summaryCard(
        "Retenciones",
        totals.retentionCount.toString(),
        `Total ${formatCurrency(totals.retentionTotal)}`,
      ),
    );
  }

  return `
    <section class="summary">
      <h2>Resumen general</h2>
      <div class="summary-grid">${cards.join("")}</div>
      ${buildBreakdownTable(sections, totals)}
    </section>
  `;
}

function buildPeriodSection(
  period: MonthlyReportPeriodData,
  sections: MonthlyReportSections,
): string {
  return `
    <section class="period">
      <div class="period-heading">
        <h2>${escapeHtml(formatMonthPeriod(period.period))}</h2>
        <span>${escapeHtml(period.period)}</span>
      </div>
      ${sections.invoices ? buildInvoicesTable(period.invoices) : ""}
      ${sections.taxPayments ? buildTaxPaymentsTable(period.taxPayments) : ""}
      ${
        sections.generalPayments
          ? buildGeneralPaymentsTable(period.generalPayments)
          : ""
      }
      ${sections.retentions ? buildRetentionsTable(period.retentions) : ""}
    </section>
  `;
}

function buildBreakdownTable(
  sections: MonthlyReportSections,
  totals: ReportTotals,
): string {
  const rows: string[] = [];

  if (sections.invoices) {
    rows.push(
      tableRow([
        "Facturas",
        totals.invoiceCount.toString(),
        formatCurrency(totals.invoiceNet),
        formatCurrency(totals.invoiceTax),
        formatCurrency(totals.invoiceTotal),
      ]),
    );
  }

  if (sections.taxPayments) {
    rows.push(
      tableRow([
        "Pagos IVA",
        totals.taxPaymentCount.toString(),
        "-",
        "-",
        formatCurrency(totals.taxPaymentTotal),
      ]),
    );
  }

  if (sections.generalPayments) {
    rows.push(
      tableRow([
        "Pagos generales",
        totals.generalPaymentCount.toString(),
        formatCurrency(totals.generalTag),
        formatCurrency(totals.generalAccountant),
        formatCurrency(totals.generalTotal),
      ]),
    );
  }

  if (sections.retentions) {
    rows.push(
      tableRow([
        "Retenciones",
        totals.retentionCount.toString(),
        formatCurrency(totals.retentionTax),
        formatCurrency(totals.retentionTag + totals.retentionAccountant),
        formatCurrency(totals.retentionTotal),
      ]),
    );
  }

  return `
    <table class="summary-table">
      <thead>
        <tr>
          <th>Bloque</th>
          <th>Registros</th>
          <th>Neto / IVA / TAG</th>
          <th>IVA / Contador</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>${rows.join("")}</tbody>
    </table>
  `;
}

function buildInvoicesTable(invoices: Invoice[]): string {
  if (invoices.length === 0) {
    return emptySection("Facturas", "Sin facturas en el periodo.");
  }

  const rows = sortByDateDesc(invoices, (invoice) => invoice.invoiceDate)
    .map((invoice) =>
      tableRow([
        invoice.invoiceNumber,
        formatDisplayDate(invoice.invoiceDate),
        invoice.clientName,
        formatInvoiceStatus(invoice.status),
        invoice.paymentDate ? formatDisplayDate(invoice.paymentDate) : "-",
        formatCurrency(invoice.netAmount),
        formatCurrency(invoice.taxAmount),
        formatCurrency(invoice.totalAmount),
        invoice.description ?? "-",
      ]),
    )
    .join("");

  return reportTable("Facturas", [
    "Numero",
    "Fecha",
    "Cliente",
    "Estado",
    "Fecha pago",
    "Neto",
    "IVA",
    "Total",
    "Detalle",
  ], rows);
}

function buildTaxPaymentsTable(payments: TaxPayment[]): string {
  if (payments.length === 0) {
    return emptySection("Pagos IVA", "Sin pagos IVA en el periodo.");
  }

  const rows = sortByDateDesc(payments, (payment) => payment.paymentDate)
    .map((payment) =>
      tableRow([
        payment.taxPeriod,
        formatDisplayDate(payment.paymentDate),
        formatCurrency(payment.amount),
        payment.description ?? "-",
        payment.reference ?? "-",
        formatSourceType(payment.sourceType),
      ]),
    )
    .join("");

  return reportTable("Pagos IVA", [
    "Periodo",
    "Fecha pago",
    "Monto",
    "Descripcion",
    "Referencia",
    "Origen",
  ], rows);
}

function buildGeneralPaymentsTable(payments: GeneralPayment[]): string {
  if (payments.length === 0) {
    return emptySection("Pagos generales", "Sin pagos generales en el periodo.");
  }

  const rows = sortByDateDesc(payments, (payment) => payment.paymentDate)
    .map((payment) =>
      tableRow([
        formatGeneralPaymentCategoryLabel(payment.category),
        formatDisplayDate(payment.paymentDate),
        formatCurrency(payment.amount),
        payment.description ?? "-",
        payment.reference ?? "-",
        formatSourceType(payment.sourceType),
      ]),
    )
    .join("");

  return reportTable("Pagos generales", [
    "Categoria",
    "Fecha pago",
    "Monto",
    "Descripcion",
    "Referencia",
    "Origen",
  ], rows);
}

function buildRetentionsTable(retentions: Retention[]): string {
  if (retentions.length === 0) {
    return emptySection("Retenciones", "Sin retenciones en el periodo.");
  }

  const rows = sortByDateDesc(retentions, (retention) => retention.retentionDate)
    .map((retention) =>
      tableRow([
        formatRetentionCategoryLabel(retention.category),
        formatDisplayDate(retention.retentionDate),
        formatCurrency(retention.amount),
        retention.description ?? "-",
        retention.reference ?? "-",
      ]),
    )
    .join("");

  return reportTable("Retenciones", [
    "Categoria",
    "Fecha",
    "Monto",
    "Descripcion",
    "Referencia",
  ], rows);
}

export function reportTable(
  title: string,
  headers: string[],
  rows: string,
): string {
  return `
    <div class="table-block">
      <h3>${escapeHtml(title)}</h3>
      <table>
        <thead><tr>${headers
          .map((header) => `<th>${escapeHtml(header)}</th>`)
          .join("")}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

export function tableRow(values: string[]): string {
  return `<tr>${values
    .map((value) => `<td>${escapeHtml(value)}</td>`)
    .join("")}</tr>`;
}

export function emptySection(title: string, message: string): string {
  return `
    <div class="table-block empty-block">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

export function summaryCard(label: string, value: string, detail?: string): string {
  return `
    <div class="summary-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      ${detail ? `<small>${escapeHtml(detail)}</small>` : ""}
    </div>
  `;
}

function calculateTotals(periods: MonthlyReportPeriodData[]): ReportTotals {
  const invoices = periods.flatMap((period) => period.invoices);
  const taxPayments = periods.flatMap((period) => period.taxPayments);
  const generalPayments = periods.flatMap((period) => period.generalPayments);
  const retentions = periods.flatMap((period) => period.retentions);

  return {
    invoiceCount: invoices.length,
    invoiceNet: sum(invoices, (invoice) => invoice.netAmount),
    invoiceTax: sum(invoices, (invoice) => invoice.taxAmount),
    invoiceTotal: sum(invoices, (invoice) => invoice.totalAmount),
    taxPaymentCount: taxPayments.length,
    taxPaymentTotal: sum(taxPayments, (payment) => payment.amount),
    generalPaymentCount: generalPayments.length,
    generalTag: sumGeneralPayments(generalPayments, "tag"),
    generalAccountant: sumGeneralPayments(generalPayments, "accountant"),
    generalSavings: sumGeneralPayments(generalPayments, "savings"),
    generalTotal: sum(generalPayments, (payment) => payment.amount),
    retentionCount: retentions.length,
    retentionTax: sumRetentions(retentions, "tax"),
    retentionTag: sumRetentions(retentions, "tag"),
    retentionAccountant: sumRetentions(retentions, "accountant"),
    retentionSavings: sumRetentions(retentions, "savings"),
    retentionTotal: sum(retentions, (retention) => retention.amount),
  };
}

function sum<T>(items: T[], pickAmount: (item: T) => number): number {
  return items.reduce((total, item) => total + pickAmount(item), 0);
}

function sumGeneralPayments(
  payments: GeneralPayment[],
  category: GeneralPayment["category"],
): number {
  return sum(
    payments.filter((payment) => payment.category === category),
    (payment) => payment.amount,
  );
}

function sumRetentions(
  retentions: Retention[],
  category: RetentionCategory,
): number {
  return sum(
    retentions.filter((retention) => retention.category === category),
    (retention) => retention.amount,
  );
}

function sortByDateDesc<T>(
  items: T[],
  pickDate: (item: T) => string,
): T[] {
  return [...items].sort((a, b) => pickDate(b).localeCompare(pickDate(a)));
}

function sortPeriodsDesc(periods: MonthlyReportPeriodData[]): MonthlyReportPeriodData[] {
  return [...periods].sort((a, b) => b.period.localeCompare(a.period));
}

function sortPeriodsAsc(periods: string[]): string[] {
  return [...periods].sort((a, b) => a.localeCompare(b));
}

function formatPeriodList(periods: string[]): string {
  const uniquePeriods = Array.from(new Set(periods));
  const sortedPeriods = sortPeriodsAsc(uniquePeriods);

  if (sortedPeriods.length === 0) {
    return "Sin periodos";
  }

  return sortedPeriods
    .map((period) => `${formatMonthPeriod(period)} (${period})`)
    .join(", ");
}

function formatGeneratedAt(value?: string): string {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return value ?? "";
  }

  return generatedAtFormatter.format(date);
}

function formatGeneralPaymentCategoryLabel(category: string): string {
  return GENERAL_PAYMENT_CATEGORY_LABELS[category] ?? category;
}

function formatRetentionCategoryLabel(category: RetentionCategory): string {
  return RETENTION_CATEGORY_LABELS[category];
}

function formatSourceType(sourceType: "manual" | "migrated"): string {
  return sourceType === "migrated" ? "Migrado" : "Manual";
}

function formatInvoiceStatus(status: Invoice["status"]): string {
  return status === "paid" ? "Pagada" : "Pendiente";
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildReportCss(): string {
  return `
    @page {
      size: A4;
      margin: 22mm 16mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      color: #17212b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 11px;
      line-height: 1.45;
      margin: 0;
    }

    .cover {
      border-bottom: 2px solid #123b5d;
      margin-bottom: 22px;
      padding-bottom: 16px;
    }

    .brand {
      color: #123b5d;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1.6px;
      text-transform: uppercase;
    }

    h1 {
      color: #17212b;
      font-size: 30px;
      line-height: 1.1;
      margin: 8px 0 10px;
    }

    h2 {
      color: #123b5d;
      font-size: 17px;
      margin: 0 0 12px;
    }

    h3 {
      color: #17212b;
      font-size: 12px;
      margin: 0 0 8px;
    }

    .periods,
    .generated {
      color: #66727e;
      margin: 0;
    }

    .summary {
      margin-bottom: 24px;
    }

    .summary-grid {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(3, 1fr);
      margin-bottom: 14px;
    }

    .summary-card {
      background: #f6f8fa;
      border: 1px solid #dde3e8;
      border-radius: 8px;
      padding: 10px;
    }

    .summary-card span,
    .summary-card small {
      color: #66727e;
      display: block;
    }

    .summary-card strong {
      color: #123b5d;
      display: block;
      font-size: 15px;
      margin-top: 4px;
    }

    .period {
      break-inside: avoid;
      margin-top: 22px;
      page-break-inside: avoid;
    }

    .period-heading {
      align-items: baseline;
      border-bottom: 1px solid #dde3e8;
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 6px;
    }

    .period-heading span {
      color: #66727e;
      font-weight: 700;
    }

    .table-block {
      margin-bottom: 16px;
    }

    table {
      border-collapse: collapse;
      page-break-inside: auto;
      width: 100%;
    }

    tr {
      page-break-inside: avoid;
    }

    th {
      background: #123b5d;
      color: #ffffff;
      font-size: 9px;
      font-weight: 700;
      padding: 7px 6px;
      text-align: left;
      text-transform: uppercase;
    }

    td {
      border-bottom: 1px solid #dde3e8;
      color: #17212b;
      padding: 7px 6px;
      vertical-align: top;
    }

    tbody tr:nth-child(even) td {
      background: #f8fafc;
    }

    .summary-table {
      margin-top: 4px;
    }

    .empty-block {
      background: #f8fafc;
      border: 1px solid #dde3e8;
      border-radius: 8px;
      padding: 10px;
    }

    .empty-block p {
      color: #66727e;
      margin: 0;
    }
  `;
}
