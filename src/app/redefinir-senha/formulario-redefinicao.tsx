"use client";

import Link from "next/link";
import { useActionState } from "react";

import estilos from "@/app/login/login.module.css";

import { type EstadoRedefinicao, redefinirAction } from "./actions";

export function FormularioRedefinicao({ token }: { token: string }) {
  const [estado, acao, enviando] = useActionState<EstadoRedefinicao, FormData>(redefinirAction, {});
  const e = estado.erros ?? {};

  return (
    <form action={acao} className={estilos.caixa} noValidate>
      <div className={estilos.rotulo}>ACESSO SEGURO</div>
      <h2>Crie uma nova senha</h2>
      <p>Ao salvar, você sai de todos os aparelhos e entra de novo com a senha nova.</p>
      <input type="hidden" name="token" value={token} />

      <div className={estilos.campo}>
        <label htmlFor="senha">Nova senha (mínimo 8 caracteres)</label>
        <input id="senha" name="senha" type="password" autoComplete="new-password" aria-invalid={Boolean(e.senha)} aria-describedby={e.senha ? "erro-senha" : undefined} />
        {e.senha && <span id="erro-senha" className={estilos.erroCampo}>{e.senha}</span>}
      </div>
      <div className={estilos.campo}>
        <label htmlFor="confirmacaoSenha">Confirme a nova senha</label>
        <input id="confirmacaoSenha" name="confirmacaoSenha" type="password" autoComplete="new-password" aria-invalid={Boolean(e.confirmacaoSenha)} aria-describedby={e.confirmacaoSenha ? "erro-confirmacaoSenha" : undefined} />
        {e.confirmacaoSenha && <span id="erro-confirmacaoSenha" className={estilos.erroCampo}>{e.confirmacaoSenha}</span>}
      </div>

      {estado.linkInvalido && (
        <p role="alert" className={estilos.erro}>
          Link inválido ou expirado. <Link href="/recuperar-senha">Pedir um novo link</Link>.
        </p>
      )}

      <button type="submit" className="xp-btn lime" disabled={enviando}>
        {enviando ? "Salvando…" : "Salvar nova senha →"}
      </button>
      <Link href="/login" className={estilos.voltar}>← Voltar para o login</Link>
    </form>
  );
}
