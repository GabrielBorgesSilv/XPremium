// Tabelas Drizzle do submódulo usuarios/perfis. Prefixe as tabelas com "usuarios_".
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usuariosContas = sqliteTable("usuarios_contas", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  papel: text("papel", { enum: ["usuario", "assessor", "admin"] }).notNull(),
  criadoEm: text("criado_em").notNull(),
  idExterno: text("id_externo"),
  assessorExternoId: text("assessor_externo_id"),
  cargo: text("cargo"),
  ativo: integer("ativo", { mode: "boolean" }).notNull().default(true),
});
