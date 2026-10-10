import type { Papel, Usuario } from "./schema";

export type DecisaoAcesso = "permitido" | "nao-autenticado" | "sem-permissao";

const NIVEL: Record<Papel, number> = { usuario: 0, assessor: 1, admin: 2 };

/** O papel `atual` cobre o `exigido`? (hierarquia: usuario < assessor < admin) */
export function papelAtende(atual: Papel, exigido: Papel): boolean {
  return NIVEL[atual] >= NIVEL[exigido];
}

/** Regra de autorização. Função pura: a mesma decisão vale para páginas e APIs. */
export function decidirAcesso(usuario: Usuario | null, exigido: Papel): DecisaoAcesso {
  if (!usuario) return "nao-autenticado";
  return papelAtende(usuario.papel, exigido) ? "permitido" : "sem-permissao";
}

/** Área de destino após o login: assessores e admins vão para /assessor, os demais para /cliente. */
export function paginaInicialDoPapel(papel: Papel): string {
  return papelAtende(papel, "assessor") ? "/assessor" : "/cliente";
}
