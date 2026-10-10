import { describe, expect, it } from "vitest";

import { ALOCACAO_EXEMPLO, PARAMETROS_INICIAIS } from "./referencia";

describe("referência da tela de métricas", () => {
  it("soma 100% na carteira atual e na proposta ilustrativa", () => {
    const atual = ALOCACAO_EXEMPLO.reduce((soma, item) => soma + item.atual, 0);
    const proposta = ALOCACAO_EXEMPLO.reduce((soma, item) => soma + item.proposta, 0);
    expect(atual).toBe(100);
    expect(proposta).toBe(100);
  });

  it("mantém o limite de referência do FGC em 250 mil por instituição", () => {
    expect(PARAMETROS_INICIAIS.fgcPorInstituicao).toBe(250_000);
    expect(PARAMETROS_INICIAIS.fgcTetoQuatroAnos).toBe(1_000_000);
    expect(PARAMETROS_INICIAIS.creditoCriticoPercent).toBeGreaterThan(PARAMETROS_INICIAIS.creditoAtencaoPercent);
  });
});
