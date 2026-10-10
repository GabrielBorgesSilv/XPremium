import { describe, expect, it } from "vitest";

import { CENARIOS, DIVISAO_PATRIMONIO, projetar, rendimentoEsperado } from "./cenarios";

describe("cenários do cliente", () => {
  it("soma 100% de probabilidade", () => {
    const total = CENARIOS.reduce((soma, cenario) => soma + cenario.probabilidade, 0);
    expect(total).toBeCloseTo(1);
  });

  it("divide o patrimônio em partes que somam 100%", () => {
    const total = DIVISAO_PATRIMONIO.reduce((soma, parte) => soma + parte.fracao, 0);
    expect(total).toBeCloseTo(1);
    expect(DIVISAO_PATRIMONIO.map((parte) => parte.nome)).toContain("CDI");
    expect(DIVISAO_PATRIMONIO.map((parte) => parte.nome)).toContain("Imóvel");
  });

  it("projeta o patrimônio pelo rendimento do cenário", () => {
    expect(projetar(1_000, 0.1)).toBe(1_100);
    expect(rendimentoEsperado()).toBeGreaterThan(CENARIOS[0].rendimento);
    expect(rendimentoEsperado()).toBeLessThan(CENARIOS[2].rendimento);
  });
});
