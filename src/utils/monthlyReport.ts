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

export interface MonthlyReportData {
  period: string;
  sections: MonthlyReportSections;
  invoices: Invoice[];
  taxPayments: TaxPayment[];
  generalPayments: GeneralPayment[];
  retentions: Retention[];
  generatedAt?: string;
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

export function hasSelectedMonthlyReportSection(
  sections: MonthlyReportSections,
): boolean {
  return MONTHLY_REPORT_SECTION_OPTIONS.some(({ key }) => sections[key]);
}

export function buildMonthlyReport(data: MonthlyReportData): string {
  const generatedAt = data.generatedAt ?? new Date().toISOString();
  const lines = [
    "INFORME MENSUAL FACTRION",
    `Periodo: ${formatMonthPeriod(data.period)} (${data.period})`,
    `Generado: ${generatedAt}`,
    "",
  ];

  appendSummary(lines, data);

  if (data.sections.invoices) {
    appendInvoices(lines, data.invoices);
  }

  if (data.sections.taxPayments) {
    appendTaxPayments(lines, data.taxPayments);
  }

  if (data.sections.generalPayments) {
    appendGeneralPayments(lines, data.generalPayments);
  }

  if (data.sections.retentions) {
    appendRetentions(lines, data.retentions);
  }

  return lines.join("\n").trimEnd();
}

function appendSummary(lines: string[], data: MonthlyReportData): void {
  lines.push("Resumen");

  if (data.sections.invoices) {
    lines.push(
      [
        `- Facturas: ${data.invoices.length}`,
        `Neto ${formatCurrency(sum(data.invoices, (item) => item.netAmount))}`,
        `IVA ${formatCurrency(sum(data.invoices, (item) => item.taxAmount))}`,
        `Total ${formatCurrency(sum(data.invoices, (item) => item.totalAmount))}`,
      ].join(" | "),
    );
  }

  if (data.sections.taxPayments) {
    lines.push(
      [
        `- Pagos IVA: ${data.taxPayments.length}`,
        `Total ${formatCurrency(sum(data.taxPayments, (item) => item.amount))}`,
      ].join(" | "),
    );
  }

  if (data.sections.generalPayments) {
    lines.push(
      [
        `- Pagos generales: ${data.generalPayments.length}`,
        `TAG ${formatCurrency(sumGeneralPayments(data.generalPayments, "tag"))}`,
        `Contador ${formatCurrency(
          sumGeneralPayments(data.generalPayments, "accountant"),
        )}`,
        `Ahorro ${formatCurrency(
          sumGeneralPayments(data.generalPayments, "savings"),
        )}`,
        `Total ${formatCurrency(
          sum(data.generalPayments, (item) => item.amount),
        )}`,
      ].join(" | "),
    );
  }

  if (data.sections.retentions) {
    lines.push(
      [
        `- Retenciones: ${data.retentions.length}`,
        `IVA ${formatCurrency(sumRetentions(data.retentions, "tax"))}`,
        `TAG ${formatCurrency(sumRetentions(data.retentions, "tag"))}`,
        `Contador ${formatCurrency(
          sumRetentions(data.retentions, "accountant"),
        )}`,
        `Ahorro ${formatCurrency(sumRetentions(data.retentions, "savings"))}`,
        `Total ${formatCurrency(sum(data.retentions, (item) => item.amount))}`,
      ].join(" | "),
    );
  }

  lines.push("");
}

function appendInvoices(lines: string[], invoices: Invoice[]): void {
  lines.push("Facturas");

  if (invoices.length === 0) {
    lines.push("- Sin facturas en el periodo.", "");
    return;
  }

  sortByDateDesc(invoices, (invoice) => invoice.invoiceDate).forEach(
    (invoice, index) => {
      const details = [
        `${index + 1}. ${invoice.invoiceNumber}`,
        formatDisplayDate(invoice.invoiceDate),
        invoice.clientName,
        `Neto ${formatCurrency(invoice.netAmount)}`,
        `IVA ${formatCurrency(invoice.taxAmount)}`,
        `Total ${formatCurrency(invoice.totalAmount)}`,
      ];

      appendOptional(details, "Descripcion", invoice.description);
      appendOptional(
        details,
        "Pago",
        invoice.paymentDate ? formatDisplayDate(invoice.paymentDate) : null,
      );
      details.push(
        `Distribucion IVA ${formatCurrency(invoice.taxPayment)}`,
        `TAG ${formatCurrency(invoice.tagAmount)}`,
        `Contador ${formatCurrency(invoice.accountantAmount)}`,
        `Ahorro ${formatCurrency(invoice.savingsAmount)}`,
      );
      lines.push(details.join(" | "));
    },
  );

  lines.push("");
}

function appendTaxPayments(lines: string[], payments: TaxPayment[]): void {
  lines.push("Pagos IVA");

  if (payments.length === 0) {
    lines.push("- Sin pagos IVA en el periodo.", "");
    return;
  }

  sortByDateDesc(payments, (payment) => payment.paymentDate).forEach(
    (payment, index) => {
      const details = [
        `${index + 1}. Periodo ${payment.taxPeriod}`,
        `Pago ${formatDisplayDate(payment.paymentDate)}`,
        formatCurrency(payment.amount),
      ];

      appendOptional(details, "Descripcion", payment.description);
      appendOptional(details, "Referencia", payment.reference);
      details.push(`Origen ${formatSourceType(payment.sourceType)}`);
      lines.push(details.join(" | "));
    },
  );

  lines.push("");
}

function appendGeneralPayments(
  lines: string[],
  payments: GeneralPayment[],
): void {
  lines.push("Pagos generales");

  if (payments.length === 0) {
    lines.push("- Sin pagos generales en el periodo.", "");
    return;
  }

  sortByDateDesc(payments, (payment) => payment.paymentDate).forEach(
    (payment, index) => {
      const details = [
        `${index + 1}. ${formatGeneralPaymentCategoryLabel(payment.category)}`,
        formatDisplayDate(payment.paymentDate),
        formatCurrency(payment.amount),
      ];

      appendOptional(details, "Descripcion", payment.description);
      appendOptional(details, "Referencia", payment.reference);
      details.push(`Origen ${formatSourceType(payment.sourceType)}`);
      lines.push(details.join(" | "));
    },
  );

  lines.push("");
}

function appendRetentions(lines: string[], retentions: Retention[]): void {
  lines.push("Retenciones");

  if (retentions.length === 0) {
    lines.push("- Sin retenciones en el periodo.", "");
    return;
  }

  sortByDateDesc(retentions, (retention) => retention.retentionDate).forEach(
    (retention, index) => {
      const details = [
        `${index + 1}. ${formatRetentionCategoryLabel(retention.category)}`,
        formatDisplayDate(retention.retentionDate),
        formatCurrency(retention.amount),
      ];

      appendOptional(details, "Descripcion", retention.description);
      appendOptional(details, "Referencia", retention.reference);
      lines.push(details.join(" | "));
    },
  );

  lines.push("");
}

function appendOptional(
  parts: string[],
  label: string,
  value: string | null,
): void {
  if (value) {
    parts.push(`${label} ${value}`);
  }
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

function formatGeneralPaymentCategoryLabel(category: string): string {
  return GENERAL_PAYMENT_CATEGORY_LABELS[category] ?? category;
}

function formatRetentionCategoryLabel(category: RetentionCategory): string {
  return RETENTION_CATEGORY_LABELS[category];
}

function formatSourceType(sourceType: "manual" | "migrated"): string {
  return sourceType === "migrated" ? "migrado" : "manual";
}
