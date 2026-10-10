import { describe, expect, it } from "vitest";

import { deslocarMes, diaEmBrasilia, gradeDoMes, mesValido, nomeDoMes } from "./calendario";

describe("calendario", () => {
  it("monta as semanas de domingo a sábado, completando com os meses vizinhos", () => {
    // Outubro/2026 começa numa quinta e termina num sábado.
    const grade = gradeDoMes("2026-10");
    expect(grade).toHaveLength(5);
    expect(grade[0][0]).toEqual({ data: "2026-09-27", doMes: false });
    expect(grade[0][4]).toEqual({ data: "2026-10-01", doMes: true });
    expect(grade.at(-1)?.at(-1)).toEqual({ data: "2026-10-31", doMes: true });
    expect(grade.flat().filter((d) => d.doMes)).toHaveLength(31);
  });

  it("navega entre meses, inclusive na virada do ano", () => {
    expect(deslocarMes("2026-12", 1)).toBe("2027-01");
    expect(deslocarMes("2026-01", -1)).toBe("2025-12");
  });

  it("usa o dia de Brasília (21h de Brasília já é o dia seguinte em UTC)", () => {
    expect(diaEmBrasilia("2026-10-16T00:30:00.000Z")).toBe("2026-10-15");
  });

  it("valida o mês da URL e escreve o nome", () => {
    expect(mesValido("2026-10")).toBe(true);
    expect(mesValido("2026-13")).toBe(false);
    expect(mesValido(undefined)).toBe(false);
    expect(nomeDoMes("2026-10")).toBe("Outubro de 2026");
  });
});
