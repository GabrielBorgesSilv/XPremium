import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { caminhoInternoSeguro, obterUsuarioAtual, paginaInicialDoPapel } from "@/modules/usuarios";

import { FormularioLogin } from "./formulario-login";
import estilos from "./login.module.css";

export const metadata: Metadata = { title: "Entrar | XPremium" };

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ voltar?: string | string[] }>;
}) {
  const usuario = await obterUsuarioAtual();
  if (usuario) redirect(paginaInicialDoPapel(usuario.papel));

  const { voltar } = await searchParams;
  const voltarSeguro = caminhoInternoSeguro(Array.isArray(voltar) ? voltar[0] : voltar);

  return (
    <div className={estilos.login}>
      <section className={estilos.marca}>
        <div className={estilos.logo}>
          <b>XP</b>
          <span>XPremium</span>
        </div>
        <div className={estilos.chamada}>
          <small>ASSESSORIA PRIVATE · XP INC.</small>
          <h1>
            Seu patrimônio.
            <br />
            <em>Suas escolhas.</em>
          </h1>
          <p>Uma experiência próxima e completa para acompanhar seus investimentos ao lado da sua assessoria.</p>
        </div>
        <div className={estilos.orbita} aria-hidden="true" />
      </section>
      <section className={estilos.painel}>
        <FormularioLogin voltar={voltarSeguro} />
      </section>
    </div>
  );
}
