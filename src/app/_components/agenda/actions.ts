"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { cancelarReuniao, criarReuniao, responderReuniao } from "@/modules/agenda";
import { mesValido } from "@/shared/calendario";

/**
 * Ações da agenda (botões e formulário). A área vem de um campo oculto, mas não dá acesso a nada:
 * o módulo agenda confere o login e o papel de novo (exigirPapel) e o vínculo antes de gravar.
 */

const AreaSchema = z.enum(["assessor", "cliente"]);
const CAMPOS = ["participanteId", "data", "hora", "duracaoMin", "modalidade", "local", "motivoCategoria", "motivoDescricao"];

export type EstadoReuniao = {
  erro?: string;
  campos?: Record<string, string>;
  /** O que foi digitado, devolvido após um erro (o React limpa o formulário a cada envio). */
  valores?: Record<string, string>;
  /** Nº do envio: a tela recria o formulário a cada um, para as caixas de seleção voltarem preenchidas. */
  tentativa?: number;
};

const texto = (form: FormData, campo: string) => {
  const v = form.get(campo);
  return typeof v === "string" ? v : "";
};

/** Volta para a agenda no mês/dia em que o usuário estava, com uma mensagem. */
function voltar(area: "assessor" | "cliente", form: FormData, aviso: string, dia?: string): never {
  const params = new URLSearchParams();
  const mes = dia ? dia.slice(0, 7) : texto(form, "mes");
  if (mesValido(mes)) params.set("mes", mes);
  const diaFinal = dia ?? texto(form, "dia");
  if (/^\d{4}-\d{2}-\d{2}$/.test(diaFinal)) params.set("dia", diaFinal);
  params.set("aviso", aviso);
  revalidatePath(`/${area}/agenda`);
  redirect(`/${area}/agenda?${params.toString()}`);
}

export async function criarReuniaoAction(_anterior: EstadoReuniao, form: FormData): Promise<EstadoReuniao> {
  const area = AreaSchema.safeParse(form.get("area"));
  if (!area.success) return { erro: "Área inválida." };

  const valores = Object.fromEntries(CAMPOS.map((c) => [c, texto(form, c)]));
  const tentativa = Number(texto(form, "tentativa")) || 1;
  const resultado = await criarReuniao(area.data, valores);
  if (!resultado.ok) return { erro: resultado.erro, campos: resultado.campos, valores, tentativa };

  voltar(area.data, form, "Convite enviado. A reunião fica pendente até a outra pessoa aceitar.", valores.data);
}

export async function responderReuniaoAction(form: FormData): Promise<void> {
  const area = AreaSchema.parse(form.get("area"));
  const aceitar = form.get("resposta") === "aceitar";
  const resultado = await responderReuniao(area, texto(form, "id"), aceitar, texto(form, "justificativa"));
  voltar(area, form, resultado.ok ? (aceitar ? "Reunião confirmada." : "Convite recusado.") : resultado.erro);
}

export async function cancelarReuniaoAction(form: FormData): Promise<void> {
  const area = AreaSchema.parse(form.get("area"));
  const resultado = await cancelarReuniao(area, texto(form, "id"), texto(form, "justificativa"));
  voltar(area, form, resultado.ok ? "Reunião cancelada." : resultado.erro);
}
