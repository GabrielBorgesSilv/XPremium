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
