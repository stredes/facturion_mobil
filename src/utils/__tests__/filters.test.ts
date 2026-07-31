import { filtersToKey } from "../filters";

describe("filtersToKey", () => {
  it("retorna cadena vacia sin filtros", () => {
    expect(filtersToKey(undefined)).toBe("");
    expect(filtersToKey({})).toBe("");
  });

  it("ignora valores vacios", () => {
    expect(filtersToKey({ searchText: "" })).toBe("");
    expect(filtersToKey({ searchText: undefined })).toBe("");
  });

  it("serializa filtros sin depender del orden de las claves", () => {
    expect(filtersToKey({ month: "07", year: "2026" })).toBe(
      filtersToKey({ year: "2026", month: "07" }),
    );
  });

  it("cambia la clave cuando cambian los valores de filtro", () => {
    expect(filtersToKey({ searchText: "foo" })).not.toBe(
      filtersToKey({ searchText: "bar" }),
    );
    expect(filtersToKey({ category: "tag" })).not.toBe(
      filtersToKey({ category: "savings" }),
    );
    expect(filtersToKey({ searchText: "x" })).not.toBe(
      filtersToKey({ searchText: "x", month: "07" }),
    );
  });

  it("mantiene la clave estable para el mismo conjunto de filtros", () => {
    const first = filtersToKey({ searchText: "foo", month: "07" });
    const second = filtersToKey({ searchText: "foo", month: "07" });
    expect(first).toBe(second);
  });
});
