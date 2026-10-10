// Tabelas Drizzle do submódulo usuarios/recuperacao. Prefixe as tabelas com "usuarios_".
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { usuariosContas } from "../perfis/db";

/** Pedidos de redefinição de senha. O link leva o token; aqui fica só o hash SHA-256 dele. */
export const usuariosRecuperacoesSenha = sqliteTable("usuarios_recuperacoes_senha", {
  tokenHash: text("token_hash").primaryKey(),
  usuarioId: text("usuario_id")
    .notNull()
    .references(() => usuariosContas.id, { onDelete: "cascade" }),
  expiraEm: text("expira_em").notNull(),
  criadoEm: text("criado_em").notNull(),
});
