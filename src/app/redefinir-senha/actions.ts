"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { RedefinicaoSenhaSchema, redefinirSenha } from "@/modules/usuarios";

export type EstadoRedefinicao = {
  erros?: { senha?: string; confirmacaoSenha?: string };
  linkInvalido?: boolean;
};

export async function redefinirAction(_anterior: EstadoRedefinicao, dados: FormData): Promise<EstadoRedefinicao> {
  const entrada = RedefinicaoSenhaSchema.safeParse({
    token: dados.get("token"),
    senha: dados.get("senha"),
    confirmacaoSenha: dados.get("confirmacaoSenha"),
  });
  if (!entrada.success) {
    const campos = z.flattenError(entrada.error).fieldErrors;
    if (campos.token) return { linkInvalido: true };
    return { erros: { senha: campos.senha?.[0], confirmacaoSenha: campos.confirmacaoSenha?.[0] } };
  }

  const resultado = await redefinirSenha(entrada.data.token, entrada.data.senha);
  if (resultado === "link-invalido") return { linkInvalido: true };

  // Todas as sessões da conta foram encerradas: entra de novo com a senha nova.
  redirect("/login?senha=alterada");
}
