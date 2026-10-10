import "server-only";

import { autorizarApi } from "@/modules/usuarios";

/**
 * Sessão e papel vêm de autorizarApi("assessor").
 * Este adapter não lê header, cookie, query nem body da rota.
 * Admin também passa nessa checagem e segue neste painel como ASSESSOR.
 */

export type AssessorPrincipal = {
  userId: string;
  role: "ASSESSOR";
};

export type AuthDecision =
  | { ok: true; principal: AssessorPrincipal }
  | {
      ok: false;
      status: 401 | 403;
      error: {
        code: "UNAUTHENTICATED" | "FORBIDDEN";
        message: string;
      };
    };

export type AssessorGuard = () => Promise<AuthDecision>;

export const assessorGuard: AssessorGuard = async () => {
  const acesso = await autorizarApi("assessor");
  if (acesso instanceof Response) {
    return acesso.status === 401
      ? {
          ok: false,
          status: 401,
          error: { code: "UNAUTHENTICATED", message: "Sessão não comprovada no servidor." },
        }
      : { ok: false, status: 403, error: { code: "FORBIDDEN", message: "Sem permissão." } };
  }
  return { ok: true, principal: { userId: acesso.id, role: "ASSESSOR" } };
};

/** Porta fechada, usada só em teste para simular a rota sem sessão. */
export const pendingAssessorGuard: AssessorGuard = async () => ({
  ok: false,
  status: 401,
  error: {
    code: "UNAUTHENTICATED",
    message: "Sessão não comprovada no servidor.",
  },
});
