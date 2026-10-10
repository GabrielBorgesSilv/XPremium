"use client";

import Link from "next/link";
import { useActionState } from "react";

import estilos from "@/app/login/login.module.css";

import { type EstadoPedido, solicitarAction } from "./actions";

export function FormularioPedido({
  validadeMinutos,
  desenvolvimento,
}: {
  validadeMinutos: number;
  desenvolvimento: boolean;
}) {
  const [estado, acao, enviando] = useActionState<EstadoPedido, FormData>(solicitarAction, {});

  return (
    <form action={acao} className={estilos.caixa} noValidate>
      <div className={estilos.rotulo}>ACESSO SEGURO</div>
      <h2>Recuperar senha</h2>
      <p>Informe o e-mail da sua conta para receber um link de redefinição.</p>

      {estado.enviado ? (
        <p role="status" className={estilos.sucesso}>
          Se o e-mail estiver cadastrado, enviamos um link para redefinir a senha. Ele vale por {validadeMinutos}{" "}
          minutos.
          {desenvolvimento && " (Em desenvolvimento, o link aparece no terminal do servidor.)"}
        </p>
      ) : (
        <>
          <div className={estilos.campo}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="Digite seu e-mail"
              defaultValue={estado.email}
              aria-invalid={Boolean(estado.erro)}
              aria-describedby={estado.erro ? "erro-email" : undefined}
            />
            {estado.erro && <span id="erro-email" className={estilos.erroCampo}>{estado.erro}</span>}
          </div>
          <button type="submit" className="xp-btn lime" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar link →"}
          </button>
        </>
      )}

      <Link href="/login" className={estilos.voltar}>← Voltar para o login</Link>
    </form>
  );
}
