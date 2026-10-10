import { describe, expect, it } from "vitest";

import { filtrarImpactos, resumirAlertas } from "./impactos";
import type { ImpactoNoticia } from "./schema";

const permitidos = new Set(["PETR4", "VALE3"]);

function impacto(parcial: Partial<ImpactoNoticia> = {}): ImpactoNoticia {
  return {
    noticiaId: "n1",
    ticker: "PETR4",
    direcao: "POSITIVO",
    motivo: "Notícia fictícia sobre o setor",
    publicadoEm: "2026-10-09T10:00:00-03:00",
    geradoPorIA: true,
    ...parcial,
  };
}

describe("filtrarImpactos", () => {
  it("aceita impactos válidos de ativos da carteira", () => {
    const r = filtrarImpactos([impacto()], permitidos);
    expect(r).toEqual({ validos: [impacto()], descartados: 0 });
  });

  it("descarta ticker que os clientes não têm (ativo inventado pela IA)", () => {
    const r = filtrarImpactos([impacto({ ticker: "INVENTADO3" })], permitidos);
    expect(r).toEqual({ validos: [], descartados: 1 });
  });

  it("descarta itens mal formados ou sem o rótulo de IA", () => {
    const r = filtrarImpactos(
      [{ ticker: "PETR4" }, { ...impacto(), direcao: "COMPRAR" }, { ...impacto(), geradoPorIA: false }, "lixo"],
      permitidos,
    );
    expect(r).toEqual({ validos: [], descartados: 4 });
  });

  it("descarta a mesma notícia repetida no mesmo ativo", () => {
    const r = filtrarImpactos([impacto(), impacto({ motivo: "Outro texto" })], permitidos);
    expect(r.validos).toHaveLength(1);
    expect(r.descartados).toBe(1);
  });

  it("trata resposta que não é lista como vazia", () => {
    expect(filtrarImpactos({ erro: "timeout" }, permitidos)).toEqual({ validos: [], descartados: 0 });
    expect(filtrarImpactos(null, permitidos)).toEqual({ validos: [], descartados: 0 });
  });
});

describe("resumirAlertas", () => {
  it("conta as direções e põe a notícia mais recente primeiro", () => {
    const antiga = impacto({ noticiaId: "n1", publicadoEm: "2026-10-08T10:00:00-03:00" });
    const nova = impacto({ noticiaId: "n2", direcao: "INDEFINIDO", publicadoEm: "2026-10-09T15:00:00-03:00" });
    const alerta = resumirAlertas([antiga, nova]).get("PETR4");

    expect(alerta).toMatchObject({ positivos: 1, negativos: 0, indefinidos: 1, direcao: "POSITIVO" });
    expect(alerta?.maisRecente).toBe(nova.publicadoEm);
    expect(alerta?.impactos.map((i) => i.noticiaId)).toEqual(["n2", "n1"]);
  });

  it("marca como MISTA quando há notícia positiva e negativa", () => {
    const alerta = resumirAlertas([impacto(), impacto({ noticiaId: "n2", direcao: "NEGATIVO" })]).get("PETR4");
    expect(alerta?.direcao).toBe("MISTA");
  });

  it("usa INDEFINIDO quando nenhuma notícia tem direção clara", () => {
    const alerta = resumirAlertas([impacto({ direcao: "INDEFINIDO" })]).get("PETR4");
    expect(alerta?.direcao).toBe("INDEFINIDO");
  });

  it("separa os alertas por ativo", () => {
    const alertas = resumirAlertas([impacto(), impacto({ ticker: "VALE3", direcao: "NEGATIVO" })]);
    expect([...alertas.keys()].sort()).toEqual(["PETR4", "VALE3"]);
    expect(alertas.get("VALE3")?.direcao).toBe("NEGATIVO");
  });
});
