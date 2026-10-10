import { papelAtende } from "../perfis/permissoes";
import type { Usuario } from "../perfis/schema";

/** Área escolhida na tela de login ("Sou assessor" / "Sou cliente"). */
export type AreaEscolhida = "assessor" | "cliente";

/**
 * Valida o destino de "voltar" depois do login: só caminhos internos da app.
 * Recusa URLs externas ("https://...", "//site", "/\site"), a própria /login e valores vazios.
 */
export function caminhoInternoSeguro(valor: unknown): string | null {
  if (typeof valor !== "string" || !valor.startsWith("/")) return null;
  if (valor.startsWith("//") || valor.startsWith("/\\")) return null;
  if (/[\u0000-\u001f]/.test(valor)) return null;
  if (valor === "/login" || valor.startsWith("/login?") || valor.startsWith("/login/")) return null;
  return valor;
}

/**
 * Para onde ir depois do login.
 * - Veio de uma página protegida (voltar válido): volta para ela; a permissão é checada lá.
 * - Senão, a área escolhida; "Sou assessor" sem o papel vai para /cliente com aviso.
 */
export function destinoAposLogin(
  usuario: Usuario,
  escolha: AreaEscolhida,
  voltar: string | null,
): { destino: string; semAcessoAssessor: boolean } {
  const temAcessoAssessor = papelAtende(usuario.papel, "assessor");
  const semAcessoAssessor = escolha === "assessor" && !temAcessoAssessor;
  const seguro = caminhoInternoSeguro(voltar);
  if (seguro) return { destino: seguro, semAcessoAssessor: false };
  return {
    destino: escolha === "assessor" && temAcessoAssessor ? "/assessor" : "/cliente",
    semAcessoAssessor,
  };
}
