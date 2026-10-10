import type { Metadata } from "next";
import Link from "next/link";

import estilos from "@/app/login/login.module.css";
import { PainelMarca } from "@/app/login/painel-marca";
import { linkRecuperacaoValido } from "@/modules/usuarios";

import { FormularioRedefinicao } from "./formulario-redefinicao";

// O token está na URL: não o vaze para outros sites pelo cabeçalho Referer.
export const metadata: Metadata = { title: "Redefinir senha | XPremium", referrer: "no-referrer" };

export default async function PaginaRedefinirSenha({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  const valor = Array.isArray(token) ? token[0] : token;
  const valido = valor ? await linkRecuperacaoValido(valor) : false;

  return (
    <div className={estilos.login}>
      <PainelMarca />
      <section className={estilos.painel}>
        {valido && valor ? (
          <FormularioRedefinicao token={valor} />
        ) : (
          <div className={estilos.caixa}>
            <div className={estilos.rotulo}>ACESSO SEGURO</div>
            <h2>Link inválido ou expirado</h2>
            <p>O link de redefinição vale por pouco tempo e só pode ser usado uma vez.</p>
            <Link href="/recuperar-senha" className="xp-btn lime" style={{ display: "block", textAlign: "center", padding: 13 }}>
              Pedir um novo link →
            </Link>
            <Link href="/login" className={estilos.voltar}>← Voltar para o login</Link>
          </div>
        )}
      </section>
    </div>
  );
}
