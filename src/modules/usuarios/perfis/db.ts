// Tabelas Drizzle do submódulo usuarios/perfis. Prefixe as tabelas com "usuarios_".
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usuariosContas = sqliteTable("usuarios_contas", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  papel: text("papel", { enum: ["usuario", "assessor", "admin"] }).notNull(),
  /**
   * Vínculo cliente → assessor (fonte única): id da conta do assessor que atende esta conta.
   * Null para assessores e para clientes ainda sem assessor.
   */
  assessorId: text("assessor_id"),
  criadoEm: text("criado_em").notNull(),
});
