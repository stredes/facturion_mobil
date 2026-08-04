import { formatCurrency } from "../currency";

const N = 10_000;

function genInvoices(n: number) {
  const years = ["2024", "2025", "2026"];
  const out: Array<{
    invoiceDate: string;
    totalAmount: number;
    taxAmount: number;
    tagAmount: number;
  }> = [];
  for (let i = 0; i < n; i++) {
    const year = years[i % 3];
    const month = String((i % 12) + 1).padStart(2, "0");
    const net = Math.round((i * 7919) % 80_000_000) + 100_000;
    out.push({
      invoiceDate: `${year}-${month}-01`,
      totalAmount: Math.round(net * 1.19),
      taxAmount: Math.round(net * 0.19),
      tagAmount: Math.round(net * 0.02),
    });
  }
  return out;
}

function time(label: string, work: () => void, budgetMs: number) {
  const t0 = performance.now();
  work();
  const elapsed = performance.now() - t0;
  console.log(`${label}: ${elapsed.toFixed(1)}ms`);
  expect(elapsed).toBeLessThanOrEqual(budgetMs);
}

describe("saturacion: smoke benchmarks (umbrales generosos)", () => {
  it("formatea 10k montos en menos de 200ms (formateador cacheado)", () => {
    const invoices = genInvoices(N);
    const amounts = invoices.map((i) => i.totalAmount);
    time("formatCurrency x10k", () => {
      amounts.forEach(formatCurrency);
    }, 200);
  });

  it("agrega 10k facturas (reduce + agrupacion mensual) en menos de 100ms", () => {
    const invoices = genInvoices(N);
    time("homeAggregation x10k", () => {
      let total = 0;
      const monthData: Record<string, { tax: number; tag: number }> = {};
      for (const inv of invoices) {
        total += inv.totalAmount;
        const m = inv.invoiceDate.slice(0, 7);
        monthData[m] = monthData[m] ?? { tax: 0, tag: 0 };
        monthData[m].tax += inv.taxAmount;
        monthData[m].tag += inv.tagAmount;
      }
      const months = Object.keys(monthData).length;
      expect(total + months).toBeGreaterThan(0);
    }, 100);
  });
});
