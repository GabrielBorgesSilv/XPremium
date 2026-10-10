"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { type EstadoLogin, entrarAction } from "./actions";
import estilos from "./login.module.css";

const ESPERA_AVISO_MS = 2500;

export function FormularioLogin({ voltar }: { voltar: string | null }) {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(entrarAction, {});
  const [escolha, setEscolha] = useState<"assessor" | "cliente">("assessor");
  const router = useRouter();

  // "Sou assessor" sem o papel: mostra o aviso e segue para a área do cliente.
  useEffect(() => {
    if (!estado.destino) return;
    const destino = estado.destino;
    const espera = setTimeout(() => router.replace(destino), ESPERA_AVISO_MS);
    return () => clearTimeout(espera);
  }, [estado.destino, router]);

  return (
    <form action={acao} className={estilos.caixa} noValidate>
      <div className={estilos.rotulo}>ACESSO SEGURO</div>
      <h2>Entre na sua conta</h2>
      <p>Acesse seu espaço de gestão patrimonial.</p>

      <div className={estilos.papel} role="radiogroup" aria-label="Área de acesso">
        {(["assessor", "cliente"] as const).map((area) => (
          <button
            key={area}
            type="button"
            role="radio"
            aria-checked={escolha === area}
            className={escolha === area ? estilos.ativo : undefined}
            onClick={() => setEscolha(area)}
          >
            {area === "assessor" ? "Sou assessor" : "Sou cliente"}
          </button>
        ))}
      </div>
      <input type="hidden" name="escolha" value={escolha} />
      {voltar && <input type="hidden" name="voltar" value={voltar} />}

      <div className={estilos.campo}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="Digite seu e-mail"
          aria-invalid={Boolean(estado.erros?.email)}
          aria-describedby={estado.erros?.email ? "erro-email" : undefined}
        />
        {estado.erros?.email && <span id="erro-email" className={estilos.erroCampo}>{estado.erros.email}</span>}
      </div>
      <div className={estilos.campo}>
        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          placeholder="Digite sua senha"
          aria-invalid={Boolean(estado.erros?.senha)}
          aria-describedby={estado.erros?.senha ? "erro-senha" : undefined}
        />
        {estado.erros?.senha && <span id="erro-senha" className={estilos.erroCampo}>{estado.erros.senha}</span>}
      </div>

      <div className={estilos.esqueci}>
        <Link href="/recuperar-senha">Esqueci minha senha</Link>
      </div>

      {estado.erro && <p role="alert" className={estilos.erro}>{estado.erro}</p>}
      {estado.aviso && <p role="status" className={estilos.aviso}>{estado.aviso}</p>}

      <button type="submit" className="xp-btn lime" disabled={enviando || Boolean(estado.destino)}>
        {enviando ? "Entrando…" : "Entrar com segurança →"}
      </button>

      <div className={estilos.nota}>
        Novo cliente? <Link href="/cadastro">Comece seu cadastro</Link>
      </div>
      <div className={estilos.seguranca}>🔒 &nbsp; Seus dados protegidos com segurança XP</div>
    </form>
  );
}
