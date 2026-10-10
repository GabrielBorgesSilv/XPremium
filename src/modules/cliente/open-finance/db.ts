import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const clienteOpenFinance = sqliteTable("cliente_open_finance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  usuarioId: text("usuario_id").notNull(),
  instituicao: text("instituicao").notNull(),
  tipoConta: text("tipo_conta").notNull().default(""),
  saldoDisponivel: real("saldo_disponivel").notNull().default(0),
  faturaAtual: real("fatura_atual").notNull().default(0),
  scoreCredito: integer("score_credito").notNull().default(0),
  dataAutorizacao: text("data_autorizacao").notNull().default(""),
  portabilidadeEmAndamento: integer("portabilidade_em_andamento", { mode: "boolean" })
    .notNull()
    .default(false),
  detalhesPortabilidade: text("detalhes_portabilidade"),
  status: text("status", { enum: ["pendente", "ativo", "bloqueado"] }).notNull(),
  consentimento: integer("consentimento", { mode: "boolean" }).notNull().default(false),
  ultimoSyncEm: text("ultimo_sync_em")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});
