import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  ESTADOS_CIVIS,
  FAIXAS_RENDA,
  obterUsuarioAtual,
  paginaInicialDoPapel,
  TEXTO_TERMO_CONSENTIMENTO,
} from "@/modules/usuarios";

import estilos from "./cadastro.module.css";
import { FormularioCadastro } from "./formulario-cadastro";

export const metadata: Metadata = { title: "Cadastro | XPremium" };

export default async function PaginaCadastro() {
  const usuario = await obterUsuarioAtual();
  if (usuario) redirect(paginaInicialDoPapel(usuario.papel));

  return (
    <main className={estilos.pagina}>
      <div className={estilos.formulario}>
        <header className={estilos.cabecalho}>
          <small>BOAS-VINDAS À XP PRIVATE</small>
          <h1>Vamos conhecer você</h1>
          <p>Preencha este formulário seguro para iniciar seu relacionamento com a assessoria.</p>
        </header>
        <FormularioCadastro
          estadosCivis={Object.entries(ESTADOS_CIVIS)}
          faixasRenda={Object.entries(FAIXAS_RENDA)}
          textoTermo={TEXTO_TERMO_CONSENTIMENTO}
        />
      </div>
    </main>
  );
}
