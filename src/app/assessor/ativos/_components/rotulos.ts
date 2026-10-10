import type { AlertaAtivo, Categoria, FiltrosVisao, ImpactoNoticia, OrigemDado } from "@/modules/assessor";

export const ROTULO_CATEGORIA: Record<Categoria, string> = {
  ACOES: "Ações",
  FII_REIT: "FIIs/REITs",
  ETF: "ETFs",
  CRIPTO: "Cripto",
  RENDA_FIXA: "Renda fixa",
};

export const ROTULO_ORIGEM: Record<OrigemDado, string> = {
  REAL: "Dado real",
  ULTIMO_REAL: "Último dado real",
  SIMULADO: "Dados simulados",
};

type Direcao = AlertaAtivo["direcao"] | ImpactoNoticia["direcao"];

export const SELO_DIRECAO: Record<Direcao, { texto: string; classe: string }> = {
  POSITIVO: { texto: "Possível impacto positivo", classe: "pos" },
  NEGATIVO: { texto: "Possível impacto negativo", classe: "neg" },
  MISTA: { texto: "Impactos mistos", classe: "mix" },
  INDEFINIDO: { texto: "Impacto indefinido", classe: "ind" },
};

/** Monta a URL da tela mantendo os filtros atuais e aplicando `mudancas` (undefined remove). */
export function hrefAtivos(filtros: FiltrosVisao, mudancas: Partial<FiltrosVisao>): string {
  const proximos = { ...filtros, ...mudancas };
  const params = new URLSearchParams();
  if (proximos.categoria) params.set("categoria", proximos.categoria);
  if (proximos.alerta) params.set("alerta", proximos.alerta);
  if (proximos.ativo) params.set("ativo", proximos.ativo);
  const query = params.toString();
  return query ? `/assessor/ativos?${query}` : "/assessor/ativos";
}
