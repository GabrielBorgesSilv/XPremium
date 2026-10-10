import { describe, expect, it } from "vitest";

import { CARTEIRAS_DEMO } from "./demo";
import { avaliarFGC } from "./fgc";
import { AtivoSchema, CotacaoSchema, PosicaoSchema } from "./schema";

// Garante que a demo continua mostrando os casos que o roteiro de apresentação usa.
describe("dados de demonstração", () => {
  it("seguem os schemas de entrada", () => {
    for (const ativo of CARTEIRAS_DEMO.ativos) expect(AtivoSchema.safeParse(ativo).success).toBe(true);
    for (const posicao of CARTEIRAS_DEMO.posicoes) expect(PosicaoSchema.safeParse(posicao).success).toBe(true);
    for (const cotacao of CARTEIRAS_DEMO.cotacoes) expect(CotacaoSchema.safeParse(cotacao).success).toBe(true);
  });

  it("têm um cliente acima do FGC (somando dois títulos) e um perto do limite", () => {
    const fgc = avaliarFGC(CARTEIRAS_DEMO);
    expect(fgc).toHaveLength(2);
    expect(fgc[0]).toMatchObject({
      clienteId: "cli-1",
      emissor: "Banco Alfa",
      situacao: "ACIMA",
      tickers: ["CDB-ALFA-2027", "LCI-ALFA-2026"],
    });
    expect(fgc[0].descoberto).toBeCloseTo(17_020);
    expect(fgc[1]).toMatchObject({ clienteId: "cli-2", emissor: "Banco Beta", situacao: "PERTO", descoberto: 0 });
    expect(fgc[1].valorCoberto).toBeCloseTo(229_792.5);
  });
});
