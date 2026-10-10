"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { destinoAposLogin, entrar, LoginSchema, sair } from "@/modules/usuarios";

export type EstadoLogin = {
  /** E-mail digitado, devolvido para o campo não ficar vazio após um erro (o React limpa o formulário). */
  email?: string;
  erro?: string;
  erros?: { email?: string; senha?: string };
  /** Login feito, mas "Sou assessor" sem o papel: mostra o aviso e segue para `destino`. */
  aviso?: string;
  destino?: string;
};

const EntradaSchema = LoginSchema.extend({
  escolha: z.enum(["assessor", "cliente"]).catch("cliente"),
  voltar: z.string().nullish(),
});

export async function entrarAction(_anterior: EstadoLogin, dados: FormData): Promise<EstadoLogin> {
  const entrada = EntradaSchema.safeParse({
    email: dados.get("email"),
    senha: dados.get("senha"),
    escolha: dados.get("escolha"),
    voltar: dados.get("voltar"),
  });
  const emailDigitado = String(dados.get("email") ?? "");
  if (!entrada.success) {
    const campos = z.flattenError(entrada.error).fieldErrors;
    return { email: emailDigitado, erros: { email: campos.email?.[0], senha: campos.senha?.[0] } };
  }

  const usuario = await entrar(entrada.data);
  if (!usuario) return { email: emailDigitado, erro: "E-mail ou senha inválidos." };

  const { destino, semAcessoAssessor } = destinoAposLogin(
    usuario,
    entrada.data.escolha,
    entrada.data.voltar ?? null,
  );
  if (semAcessoAssessor) {
    return {
      aviso: "Sua conta não tem acesso de assessor. Você será levado à área do cliente.",
      destino,
    };
  }
  redirect(destino);
}

/** Encerra a sessão e volta para o login. Use em <form action={sairAction}>. */
export async function sairAction(): Promise<void> {
  await sair();
  redirect("/login");
}
