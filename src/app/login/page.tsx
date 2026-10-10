import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { caminhoInternoSeguro, obterUsuarioAtual, paginaInicialDoPapel } from "@/modules/usuarios";

import { FormularioLogin } from "./formulario-login";
import { PainelMarca } from "./painel-marca";
import estilos from "./login.module.css";

export const metadata: Metadata = { title: "Entrar | XPremium" };

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ voltar?: string | string[]; senha?: string | string[] }>;
}) {
  const usuario = await obterUsuarioAtual();
  if (usuario) redirect(paginaInicialDoPapel(usuario.papel));

  const { voltar, senha } = await searchParams;
  const voltarSeguro = caminhoInternoSeguro(Array.isArray(voltar) ? voltar[0] : voltar);

  return (
    <div className={estilos.login}>
      <PainelMarca />
      <section className={estilos.painel}>
        <FormularioLogin voltar={voltarSeguro} senhaAlterada={senha === "alterada"} />
      </section>
    </div>
  );
}
