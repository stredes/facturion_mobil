import { combineMonthlySummaries } from "../monthlySummary";

describe("combineMonthlySummaries", () => {
  it("une los tres resumenes por periodo", () => {
    const result = combineMonthlySummaries(
      [
        {
          period: "2026-07",
          invoiceCount: 2,
          netAmount: 100000,
          taxAmount: 19000,
          totalAmount: 119000,
        },
      ],
      [
        {
          period: "2026-07",
          tagAmount: 5000,
          accountantAmount: 4000,
          savingsAmount: 3000,
          totalGeneralPayments: 12000,
        },
      ],
      [{ period: "2026-07", paidTax: 10000 }],
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      period: "2026-07",
      invoiceCount: 2,
      netAmount: 100000,
      taxAmount: 19000,
      totalAmount: 119000,
      tagAmount: 5000,
      accountantAmount: 4000,
      savingsAmount: 3000,
      paidTax: 10000,
      vatReserve: 9000,
      vatReserveOverpaid: false,
    });
  });

  it("calcula la reserva de IVA solo cuando el IVA generado supera lo pagado", () => {
    const result = combineMonthlySummaries(
      [
        {
          period: "2026-06",
          invoiceCount: 1,
          netAmount: 100000,
          taxAmount: 19000,
          totalAmount: 119000,
        },
      ],
      [],
      [{ period: "2026-06", paidTax: 25000 }],
    );

    expect(result[0]).toMatchObject({
      vatReserve: 0,
      vatReserveOverpaid: true,
    });
  });

  it("ordena los periodos de forma descendente", () => {
    const result = combineMonthlySummaries(
      [
        {
          period: "2026-01",
          invoiceCount: 1,
          netAmount: 1000,
          taxAmount: 190,
          totalAmount: 1190,
        },
        {
          period: "2026-02",
          invoiceCount: 1,
          netAmount: 2000,
          taxAmount: 380,
          totalAmount: 2380,
        },
      ],
      [],
      [],
    );

    expect(result.map((month) => month.period)).toEqual([
      "2026-02",
      "2026-01",
    ]);
  });

  it("rellena con ceros los periodos sin datos en algun resumen", () => {
    const result = combineMonthlySummaries([], [], [{ period: "2026-05", paidTax: 100 }]);

    expect(result[0]).toMatchObject({
      period: "2026-05",
      invoiceCount: 0,
      netAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
      tagAmount: 0,
      accountantAmount: 0,
      savingsAmount: 0,
      paidTax: 100,
    });
  });
});
