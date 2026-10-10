import type { Metadata } from "next";
import { redirect } from "next/navigation";

import estilos from "@/app/login/login.module.css";
import { PainelMarca } from "@/app/login/painel-marca";
import { obterUsuarioAtual, paginaInicialDoPapel, VALIDADE_LINK_MINUTOS } from "@/modules/usuarios";

import { FormularioPedido } from "./formulario-pedido";

export const metadata: Metadata = { title: "Recuperar senha | XPremium" };

export default async function PaginaRecuperarSenha() {
  const usuario = await obterUsuarioAtual();
  if (usuario) redirect(paginaInicialDoPapel(usuario.papel));

  return (
    <div className={estilos.login}>
      <PainelMarca />
      <section className={estilos.painel}>
        <FormularioPedido
          validadeMinutos={VALIDADE_LINK_MINUTOS}
          desenvolvimento={process.env.NODE_ENV !== "production"}
        />
      </section>
    </div>
  );
}
