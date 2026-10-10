/**
 * Porta do módulo 1. O repositório ainda não exporta sessão nem papel ASSESSOR.
 * Este adapter de produção não lê header, cookie, query nem body.
 * Enquanto o módulo 1 não publicar `requireAssessor()`, as rotas recusam a chamada.
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

export const pendingAssessorGuard: AssessorGuard = async () => ({
  ok: false,
  status: 401,
  error: {
    code: "UNAUTHENTICATED",
    message: "Sessão não comprovada no servidor.",
  },
});
