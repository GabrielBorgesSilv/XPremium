import type { DadosPessoais } from "@/modules/usuarios";

/** Itens que compõem o perfil do cliente. O questionário de investidor ainda não é gravado. */
const ITENS = [
  "nome",
  "email",
  "nascimento",
  "celular",
  "profissao",
  "estadoCivil",
  "renda",
  "questionario",
] as const;

function preenchido(valor: string | null | undefined): boolean {
  return Boolean(valor?.trim());
}

export function preenchimentoDoPerfil(entrada: {
  nome: string;
  email: string;
  dados: DadosPessoais | null;
  questionarioPreenchido: boolean;
}): { preenchidos: number; total: number; fracao: number } {
  const dados = entrada.dados;
  const marcados = [
    preenchido(entrada.nome),
    preenchido(entrada.email),
    preenchido(dados?.nascimento),
    preenchido(dados?.celular),
    preenchido(dados?.profissao),
    preenchido(dados?.estadoCivil),
    preenchido(dados?.rendaFaixa),
    entrada.questionarioPreenchido,
  ];
  const preenchidos = marcados.filter(Boolean).length;
  const total = ITENS.length;
  return { preenchidos, total, fracao: preenchidos / total };
}
