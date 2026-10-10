import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const clienteAnamnese = sqliteTable("cliente_anamnese", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  usuarioId: text("usuario_id").notNull(),
  objetivo: text("objetivo", {
    enum: ["preservacao", "renda", "crescimento", "lucratividade"],
  }).notNull(),
  horizonte: text("horizonte", { enum: ["curto", "medio", "longo"] }).notNull(),
  perfilInvestidor: text("perfil_investidor", {
    enum: ["conservador", "moderado", "agressivo"],
  }).notNull().default("moderado"),
  toleranciaRisco: text("tolerancia_risco", {
    enum: ["baixa", "media", "alta"],
  }).notNull(),
  idade: integer("idade").notNull().default(0),
  profissao: text("profissao").notNull().default(""),
  experienciaMercado: text("experiencia_mercado").notNull().default(""),
  toleranciaRiscoDetalhada: text("tolerancia_risco_detalhada").notNull().default(""),
  objetivoDetalhado: text("objetivo_detalhado").notNull().default(""),
  alocacaoRendaFixa: real("alocacao_renda_fixa").notNull().default(0),
  alocacaoMultimercado: real("alocacao_multimercado").notNull().default(0),
  alocacaoFiis: real("alocacao_fiis").notNull().default(0),
  alocacaoRendaVariavel: real("alocacao_renda_variavel").notNull().default(0),
  alocacaoInternacional: real("alocacao_internacional").notNull().default(0),
  situacaoFinanceira: text("situacao_financeira").notNull(),
  rendaMensal: real("renda_mensal").notNull(),
  patrimonioAtual: real("patrimonio_atual").notNull(),
  atualizadoEm: text("atualizado_em")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});
