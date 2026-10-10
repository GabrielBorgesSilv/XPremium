import type { Categoria } from "../ativos/schema";
import type { CarteiraCliente, PontoDeAtencao } from "../ativos/carteira-cliente";

/**
 * Mensagem de WhatsApp do assessor para o cliente.
 * Regra (LGPD, minimização): só temas, **sem valores** (nem R$ nem percentuais).
 * Detalhes ficam para a conversa ou para o app.
 */

export const BLOCOS_MENSAGEM = ["resumo", "pontos", "noticias", "convite"] as const;
export type BlocoMensagem = (typeof BLOCOS_MENSAGEM)[number];

export const ROTULO_BLOCO: Record<BlocoMensagem, string> = {
  resumo: "Resumo do patrimônio",
  pontos: "Pontos de atenção",
  noticias: "Notícias que afetam a carteira",
  convite: "Convite para reunião",
};

const NOME_CATEGORIA: Record<Categoria, string> = {
  ACOES: "ações",
  FII_REIT: "fundos imobiliários",
  ETF: "ETFs",
  CRIPTO: "cripto",
  RENDA_FIXA: "renda fixa",
};

/** Texto de cada bloco; null quando não há o que dizer (ex.: nenhuma notícia). */
export type BlocosMensagem = Record<BlocoMensagem, string | null>;

const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0] ?? nome;

function lista(itens: string[]): string {
  if (itens.length <= 1) return itens.join("");
  return `${itens.slice(0, -1).join(", ")} e ${itens.at(-1)}`;
}

/** Tema do ponto de atenção, sem números. */
function temaDoPonto(p: PontoDeAtencao): string | null {
  switch (p.tipo) {
    case "FGC":
      return p.severidade === "ALTA"
        ? `parte dos seus títulos${p.emissor ? ` no ${p.emissor}` : ""} está acima da garantia do FGC`
        : `seus títulos${p.emissor ? ` no ${p.emissor}` : ""} estão perto do limite de garantia do FGC`;
    case "CONCENTRACAO":
      return p.ticker ? `concentração da carteira em ${p.ticker}` : "concentração da carteira em um único ativo";
    default:
      return null; // NOTICIA tem bloco próprio; SEM_COTACAO é assunto interno.
  }
}

export function montarBlocos(carteira: CarteiraCliente, pontos: PontoDeAtencao[]): BlocosMensagem {
  const categorias = carteira.composicao.map((c) => NOME_CATEGORIA[c.categoria]);
  const qtd = carteira.posicoes.length;
  const resumo =
    qtd === 0
      ? null
      : `Sua carteira na XP tem ${qtd === 1 ? "um ativo" : `${qtd} ativos`}` +
        (categorias.length > 0 ? `, em ${lista(categorias)}.` : ".");

  const temas = pontos.map(temaDoPonto).filter((t): t is string => t !== null);
  const pontosTexto =
    temas.length === 0 ? null : `Alguns pontos merecem atenção na sua carteira: ${lista(temas)}.`;

  const noticias = pontos
    .filter((p) => p.tipo === "NOTICIA" && p.ticker && p.noticias?.length)
    .map((p) => `${p.ticker}: ${p.noticias!.join("; ")}`);
  const noticiasTexto =
    noticias.length === 0 ? null : `Notícias recentes que podem afetar seus investimentos:\n${noticias.map((n) => `• ${n}`).join("\n")}`;

  return {
    resumo,
    pontos: pontosTexto,
    noticias: noticiasTexto,
    convite: "Que tal marcarmos uma conversa nesta semana para revisar sua carteira? Me diga o melhor dia e horário.",
  };
}

/** Junta saudação + blocos escolhidos (na ordem fixa) + assinatura. */
export function montarMensagem(
  nomeCliente: string,
  nomeAssessor: string,
  blocos: BlocosMensagem,
  escolhidos: readonly BlocoMensagem[],
): string {
  const corpo = BLOCOS_MENSAGEM.filter((b) => escolhidos.includes(b))
    .map((b) => blocos[b])
    .filter((t): t is string => Boolean(t));
  return [
    `Olá, ${primeiroNome(nomeCliente)}! Aqui é ${primeiroNome(nomeAssessor)}, da sua assessoria XP.`,
    ...corpo,
    "Os detalhes estão no app da XP. Qualquer dúvida, é só me chamar por aqui.",
  ].join("\n\n");
}
