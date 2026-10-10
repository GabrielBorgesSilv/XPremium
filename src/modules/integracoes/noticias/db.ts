import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const noticias = sqliteTable("integracoes_noticias", {
  id: text("id").primaryKey(),
  providerId: text("provider_id").notNull(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  url: text("url").notNull(),
  fonte: text("fonte").notNull(),
  publicadoEm: text("publicado_em"),
  ticker: text("ticker"),
  resumo: text("resumo"),
  resumoGerado: integer("resumo_gerado", { mode: "boolean" }).notNull().default(false),
  analiseJson: text("analise_json"),
  coletadoEm: text("coletado_em").notNull(),
}, (table) => [
  uniqueIndex("integracoes_noticias_provider_id_uq").on(table.providerId),
  index("integracoes_noticias_publicado_idx").on(table.publicadoEm),
]);

export const alertas = sqliteTable("integracoes_alertas", {
  id: text("id").primaryKey(),
  noticiaId: text("noticia_id").notNull().references(() => noticias.id),
  ticker: text("ticker").notNull(),
  criticidade: text("criticidade").notNull(),
  tipoEvento: text("tipo_evento").notNull(),
  horizonte: text("horizonte").notNull(),
  direcao: text("direcao").notNull(),
  justificativa: text("justificativa").notNull(),
  evidencia: text("evidencia").notNull(),
  confianca: integer("confianca").notNull(),
  status: text("status").notNull().default("aberto"),
  emailStatus: text("email_status").notNull().default("nao_aplicavel"),
  dedupeKey: text("dedupe_key").notNull(),
  criadoEm: text("criado_em").notNull(),
}, (table) => [
  uniqueIndex("integracoes_alertas_dedupe_uq").on(table.dedupeKey),
  index("integracoes_alertas_priority_idx").on(table.criticidade, table.status, table.criadoEm),
]);

export const notificacoesOutbox = sqliteTable("integracoes_notificacoes_outbox", {
  id: text("id").primaryKey(),
  alertaId: text("alerta_id").notNull().references(() => alertas.id),
  destinatario: text("destinatario").notNull(),
  status: text("status").notNull().default("pendente"),
  tentativas: integer("tentativas").notNull().default(0),
  proximaTentativaEm: text("proxima_tentativa_em").notNull(),
  providerId: text("provider_id"),
  erro: text("erro"),
  criadoEm: text("criado_em").notNull(),
}, (table) => [
  uniqueIndex("integracoes_outbox_alert_recipient_uq").on(table.alertaId, table.destinatario),
  index("integracoes_outbox_pending_idx").on(table.status, table.proximaTentativaEm),
]);
