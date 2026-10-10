// Tabelas Drizzle do submódulo assessor/clientes. Prefixe as tabelas com "assessor_".
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Vínculo assessor ↔ cliente. Os ids são de contas do M1 (usuarios_contas), sem chave estrangeira
 * entre módulos. A chave é o cliente: cada cliente tem um único assessor.
 */
export const assessorVinculos = sqliteTable("assessor_vinculos", {
  clienteId: text("cliente_id").primaryKey(),
  assessorId: text("assessor_id").notNull(),
  criadoEm: text("criado_em").notNull(),
});

/**
 * Contatos do assessor com o cliente (hoje: WhatsApp aberto pela tela do cliente).
 * Guarda só quais blocos foram usados, nunca o texto. Não dá para saber se a mensagem foi de fato enviada.
 */
export const assessorContatos = sqliteTable("assessor_contatos", {
  id: text("id").primaryKey(),
  assessorId: text("assessor_id").notNull(),
  clienteId: text("cliente_id").notNull(),
  canal: text("canal", { enum: ["whatsapp"] }).notNull(),
  /** Blocos usados, separados por vírgula (ex.: "resumo,convite"). */
  blocos: text("blocos").notNull(),
  criadoEm: text("criado_em").notNull(),
});
