"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { CadastroSchema, cadastrar, entrar } from "@/modules/usuarios";

const CAMPOS_TEXTO = ["nome", "email", "nascimento", "celular", "profissao", "estadoCivil", "rendaFaixa"] as const;
type CampoTexto = (typeof CAMPOS_TEXTO)[number];
type Campo = CampoTexto | "senha" | "confirmacaoSenha" | "consentimento";

export type EstadoCadastro = {
  /** Valores digitados (sem as senhas), devolvidos para o formulário não ficar vazio após erro. */
  valores?: Partial<Record<CampoTexto, string>>;
  erros?: Partial<Record<Campo, string>>;
  emailEmUso?: boolean;
};

export async function cadastrarAction(_anterior: EstadoCadastro, dados: FormData): Promise<EstadoCadastro> {
  const valores = Object.fromEntries(CAMPOS_TEXTO.map((c) => [c, String(dados.get(c) ?? "")])) as Record<
    CampoTexto,
    string
  >;

  const entrada = CadastroSchema.safeParse({
    ...valores,
    senha: String(dados.get("senha") ?? ""),
    confirmacaoSenha: String(dados.get("confirmacaoSenha") ?? ""),
    consentimento: dados.get("consentimento") === "on",
  });
  if (!entrada.success) {
    const campos = z.flattenError(entrada.error).fieldErrors;
    const erros = Object.fromEntries(Object.entries(campos).map(([c, msgs]) => [c, msgs?.[0]]));
    return { valores, erros };
  }

  const resultado = await cadastrar(entrada.data);
  if (!resultado.ok) return { valores, emailEmUso: true };

  // Conta criada: já entra e vai para a área do cliente.
  await entrar({ email: entrada.data.email, senha: entrada.data.senha });
  redirect("/cliente");
}
