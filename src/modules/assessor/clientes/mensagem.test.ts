import { describe, expect, it } from "vitest";

import type { CarteiraCliente, PontoDeAtencao } from "../ativos/carteira-cliente";
import { BLOCOS_MENSAGEM, montarBlocos, montarMensagem } from "./mensagem";

const carteira = {
  total: 1_234_567.89,
  posicoes: [{}, {}, {}],
  composicao: [
    { categoria: "RENDA_FIXA", valor: 800_000, fracao: 0.65 },
    { categoria: "ACOES", valor: 434_567.89, fracao: 0.35 },
  ],
  semCotacao: [],
} as unknown as CarteiraCliente;

const pontos: PontoDeAtencao[] = [
  { tipo: "FGC", severidade: "ALTA", titulo: "Acima da garantia do FGC no Banco Fictício", detalhe: "R$ 300.000,00 em títulos cobertos: R$ 50.000,00 sem cobertura.", emissor: "Banco Fictício" },
  { tipo: "NOTICIA", severidade: "ALTA", titulo: "Notícia com possível impacto negativo em PETR4", detalhe: "PETR4 representa 35,2% da carteira · Petrobras revisa projeções", ticker: "PETR4", noticias: ["Petrobras revisa projeções"] },
  { tipo: "CONCENTRACAO", severidade: "MEDIA", titulo: "PETR4 concentra 35,2% da carteira", detalhe: "Acima de 30% em um único ativo.", ticker: "PETR4" },
  { tipo: "SEM_COTACAO", severidade: "INFO", titulo: "XPTO11 sem cotação no momento", detalhe: "Fica fora do patrimônio.", ticker: "XPTO11" },
];

const blocos = montarBlocos(carteira, pontos);
const tudo = montarMensagem("Ana Martins", "Fábio Alves", blocos, BLOCOS_MENSAGEM);

describe("mensagem de WhatsApp: só temas, sem valores", () => {
  it("não leva valores em reais nem percentuais", () => {
    expect(tudo).not.toMatch(/R\$/);
    expect(tudo).not.toMatch(/\d+([.,]\d+)?\s*%/);
    expect(tudo).not.toMatch(/\d{1,3}(\.\d{3})+(,\d{2})?/); // valores como 300.000,00
  });

  it("traz os temas: resumo por categoria, FGC, concentração e notícia", () => {
    expect(blocos.resumo).toBe("Sua carteira na XP tem 3 ativos, em renda fixa e ações.");
    expect(blocos.pontos).toContain("acima da garantia do FGC");
    expect(blocos.pontos).toContain("Banco Fictício");
    expect(blocos.pontos).toContain("concentração da carteira em PETR4");
    expect(blocos.noticias).toContain("PETR4: Petrobras revisa projeções");
  });

  it("assuntos internos (sem cotação) não vão para o cliente", () => {
    expect(tudo).not.toContain("XPTO11");
  });

  it("saúda pelo primeiro nome e assina com o primeiro nome do assessor", () => {
    expect(tudo.startsWith("Olá, Ana! Aqui é Fábio, da sua assessoria XP.")).toBe(true);
  });
});

describe("escolha dos blocos", () => {
  it("só entram os blocos escolhidos, na ordem fixa", () => {
    const m = montarMensagem("Ana Martins", "Fábio Alves", blocos, ["convite", "resumo"]);
    expect(m.indexOf("Sua carteira")).toBeLessThan(m.indexOf("Que tal marcarmos"));
    expect(m).not.toContain("pontos merecem atenção");
    expect(m).not.toContain("Notícias recentes");
  });

  it("blocos sem conteúdo ficam de fora", () => {
    const vazio = montarBlocos({ ...carteira, posicoes: [], composicao: [] }, []);
    expect(vazio).toMatchObject({ resumo: null, pontos: null, noticias: null });
    const m = montarMensagem("Ana Martins", "Fábio Alves", vazio, BLOCOS_MENSAGEM);
    expect(m.split("\n\n")).toHaveLength(3); // saudação, convite, encerramento
  });
});
