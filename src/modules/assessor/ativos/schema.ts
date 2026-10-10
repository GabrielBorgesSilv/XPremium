import { z } from "zod";

/**
 * DTOs de entrada e saída: investimentos dos clientes do assessor, vistos por ativo (M4).
 * Contratos compartilhados: Ativo/Cotacao/SeriePrecos com M2, Posicao com M3, ImpactoNoticia com M5.
 */

/** As cinco categorias aprovadas no escopo. */
export const CategoriaSchema = z.enum(["ACOES", "FII_REIT", "ETF", "CRIPTO", "RENDA_FIXA"]);
export type Categoria = z.infer<typeof CategoriaSchema>;

export const MoedaSchema = z.enum(["BRL", "USD"]);
export type Moeda = z.infer<typeof MoedaSchema>;

/** Prioridade aprovada: real atual → último real (com alerta) → simulado identificado. */
export const OrigemDadoSchema = z.enum(["REAL", "ULTIMO_REAL", "SIMULADO"]);
export type OrigemDado = z.infer<typeof OrigemDadoSchema>;

/** Identificação do ativo, sem nada específico de provedor externo (contrato com M2). */
export const AtivoSchema = z
  .object({
    ticker: z.string().min(1),
    nome: z.string().min(1),
    categoria: CategoriaSchema,
    moeda: MoedaSchema,
    /** Instituição emissora (conglomerado), para títulos bancários. */
    emissor: z.string().min(1).optional(),
    /** Coberto pelo FGC (CDB, LCI, LCA, LC, RDB...). Ausente = não coberto. */
    coberturaFGC: z.boolean().optional(),
  })
  .refine((a) => !a.coberturaFGC || a.emissor !== undefined, {
    message: "Ativo coberto pelo FGC precisa informar o emissor",
    path: ["emissor"],
  });
export type Ativo = z.infer<typeof AtivoSchema>;

/** Quanto um cliente tem de um ativo (contrato com M3: o M3 é dono do cliente, o M4 só guarda o id). */
export const PosicaoSchema = z.object({
  clienteId: z.string().min(1),
  ticker: z.string().min(1),
  quantidade: z.number().positive(),
});
export type Posicao = z.infer<typeof PosicaoSchema>;

/** Preço unitário do ativo na moeda dele (em renda fixa, o PU). */
export const CotacaoSchema = z.object({
  ticker: z.string().min(1),
  preco: z.number().positive(),
  origem: OrigemDadoSchema,
  /** Data de referência do preço (não a data da consulta). */
  asOf: z.iso.datetime({ offset: true }),
});
export type Cotacao = z.infer<typeof CotacaoSchema>;

/** Quantos reais vale 1 unidade de cada moeda estrangeira. */
export const TaxasCambioSchema = z.object({ USD: z.number().positive() });
export type TaxasCambio = z.infer<typeof TaxasCambioSchema>;

export const PeriodoSchema = z.enum(["7D", "30D"]);
export type Periodo = z.infer<typeof PeriodoSchema>;

/** Histórico para o gráfico. Renda fixa usa TAXA; os demais, PRECO. */
export const SeriePrecosSchema = z.object({
  ticker: z.string().min(1),
  medida: z.enum(["PRECO", "TAXA"]),
  moeda: MoedaSchema,
  origem: OrigemDadoSchema,
  pontos: z.array(z.object({ data: z.iso.date(), valor: z.number() })),
});
export type SeriePrecos = z.infer<typeof SeriePrecosSchema>;

/** Possível impacto de uma notícia num ativo, segundo o agente de IA (contrato com M5). */
export const ImpactoNoticiaSchema = z.object({
  noticiaId: z.string().min(1),
  ticker: z.string().min(1),
  direcao: z.enum(["POSITIVO", "NEGATIVO", "INDEFINIDO"]),
  motivo: z.string().min(1),
  publicadoEm: z.iso.datetime({ offset: true }),
  geradoPorIA: z.literal(true),
});
export type ImpactoNoticia = z.infer<typeof ImpactoNoticiaSchema>;

/**
 * Filtros da tela, vindos da URL (?ativo=PETR4&categoria=ACOES&alerta=1).
 * Valor inválido vira "sem filtro" em vez de erro: a URL pode ser editada à mão.
 */
export const FiltrosVisaoSchema = z.object({
  ativo: z.string().min(1).max(20).optional().catch(undefined),
  categoria: CategoriaSchema.optional().catch(undefined),
  alerta: z.literal("1").optional().catch(undefined),
});
export type FiltrosVisao = z.infer<typeof FiltrosVisaoSchema>;

// Saídas dos cálculos (montadas pelo servidor, não vêm de fora; por isso só tipos).

/** Uma linha da lista principal: o ativo somado entre todos os clientes do assessor. */
export type ResumoAtivo = {
  ativo: Ativo;
  numClientes: number;
  quantidadeTotal: number;
  /** Em reais; null quando o ativo não tem cotação. */
  valorTotal: number | null;
  /** Fração (0 a 1) do total sob gestão; null quando o ativo não tem cotação. */
  participacao: number | null;
  origemPreco: OrigemDado | null;
};

/** Um cliente que tem o ativo selecionado (painel lateral). */
export type ClienteDoAtivo = {
  clienteId: string;
  quantidade: number;
  /** Em reais; null quando o ativo não tem cotação. */
  valor: number | null;
  /** Fração (0 a 1) da carteira do cliente; null quando não dá para calcular. */
  pesoNaCarteira: number | null;
  acimaDoLimite: boolean;
};

export type ResumoCarteiras = {
  /** Soma em reais das posições com cotação. */
  totalSobGestao: number;
  numClientes: number;
  numAtivos: number;
  /** Tickers sem cotação: ficaram fora dos totais (cobertura parcial). */
  semCotacao: string[];
  ativos: ResumoAtivo[];
};
