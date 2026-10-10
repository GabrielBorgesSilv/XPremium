import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/core/db";
import { buscarUsuarioPorEmail } from "@/modules/usuarios";
import type { Aleatorio } from "@/shared/aleatorio";

import { clienteAnamnese } from "./anamnese/db";
import { clienteOpenFinance } from "./open-finance/db";
import { clientePatrimonio } from "./patrimonio/db";

const clientes = [
  {
    email: "usuario1@hubxp.test",
    anamnese: {
      objetivo: "preservacao",
      horizonte: "medio",
      perfilInvestidor: "conservador",
      toleranciaRisco: "baixa",
      idade: 58,
      profissao: "Engenheiro Civil Sênior",
      experienciaMercado: "Apenas Renda Fixa Tradicional",
      toleranciaRiscoDetalhada: "Baixa (aversão total à perda de capital nominal)",
      objetivoDetalhado: "Aposentadoria em 4 anos e preservação de capital",
      rendaMensal: 22000,
      patrimonioAtual: 850000,
      alocacaoRendaFixa: 0.9,
      alocacaoMultimercado: 0,
      alocacaoFiis: 0,
      alocacaoRendaVariavel: 0,
      alocacaoInternacional: 0.1,
      situacaoFinanceira: "Renda mensal de R$ 22.000,00; patrimônio declarado de R$ 850.000,00.",
    },
    openFinance: [
      {
        instituicao: "Banco do Brasil",
        tipoConta: "Conta Corrente / Salário",
        saldoDisponivel: 35000,
        faturaAtual: 0,
        scoreCredito: 840,
        dataAutorizacao: "2025-03-10",
        portabilidadeEmAndamento: false,
        detalhesPortabilidade: null,
      },
      {
        instituicao: "Itaú Unibanco",
        tipoConta: "Cartão de Crédito Black",
        saldoDisponivel: 0,
        faturaAtual: 8400,
        scoreCredito: 840,
        dataAutorizacao: "2025-03-10",
        portabilidadeEmAndamento: false,
        detalhesPortabilidade: null,
      },
    ],
  },
  {
    email: "usuario2@hubxp.test",
    anamnese: {
      objetivo: "crescimento",
      horizonte: "medio",
      perfilInvestidor: "moderado",
      toleranciaRisco: "media",
      idade: 36,
      profissao: "Gerente de Marketing",
      experienciaMercado: "Renda Fixa e Fundos Multimercado",
      toleranciaRiscoDetalhada: "Média (aceita oscilações moderadas de curto prazo)",
      objetivoDetalhado: "Troca de imóvel em 5 anos e fundo dos filhos",
      rendaMensal: 14000,
      patrimonioAtual: 320000,
      alocacaoRendaFixa: 0.5,
      alocacaoMultimercado: 0.2,
      alocacaoFiis: 0.15,
      alocacaoRendaVariavel: 0.15,
      alocacaoInternacional: 0,
      situacaoFinanceira: "Renda mensal de R$ 14.000,00; patrimônio declarado de R$ 320.000,00.",
    },
    openFinance: [
      {
        instituicao: "Nubank",
        tipoConta: "Conta PJ e PF / Cartão",
        saldoDisponivel: 12000,
        faturaAtual: 0,
        scoreCredito: 790,
        dataAutorizacao: "2025-06-15",
        portabilidadeEmAndamento: true,
        detalhesPortabilidade:
          "Migração de R$ 85.000,00 da XP para a corretora atual do assessor",
      },
      {
        instituicao: "XP Investimentos",
        tipoConta: "Custódia Externa (Resgate Solicitado)",
        saldoDisponivel: 85000,
        faturaAtual: 0,
        scoreCredito: 790,
        dataAutorizacao: "2025-06-15",
        portabilidadeEmAndamento: true,
        detalhesPortabilidade:
          "Migração de R$ 85.000,00 da XP para a corretora atual do assessor",
      },
    ],
  },
] as const;

/**
 * Salva os dados de demonstração associados aos usuários seed no banco.
 * Os registros existentes desses usuários são atualizados para manter o seed repetível.
 */
export async function semearCliente(aleatorio: Aleatorio): Promise<void> {
  const agora = new Date().toISOString();
  const clientesComUsuario = await Promise.all(
    clientes.map(async (cliente) => ({
      cliente,
      usuario: await buscarUsuarioPorEmail(cliente.email),
    })),
  );

  for (const { cliente, usuario } of clientesComUsuario) {
    if (!usuario || usuario.papel !== "usuario") {
      throw new Error("Conta de demonstração não encontrada para os dados do módulo cliente.");
    }

    const dadosAnamnese = {
      usuarioId: usuario.id,
      ...cliente.anamnese,
      atualizadoEm: agora,
    };
    const anamneseExistente = await db
      .select()
      .from(clienteAnamnese)
      .where(eq(clienteAnamnese.usuarioId, usuario.id))
      .get();
    if (anamneseExistente) {
      await db
        .update(clienteAnamnese)
        .set(dadosAnamnese)
        .where(eq(clienteAnamnese.id, anamneseExistente.id));
    } else {
      await db.insert(clienteAnamnese).values(dadosAnamnese);
    }

    for (const instituicao of cliente.openFinance) {
      const dadosOpenFinance = {
        usuarioId: usuario.id,
        ...instituicao,
        status: "ativo" as const,
        consentimento: true,
        ultimoSyncEm: new Date(`${instituicao.dataAutorizacao}T00:00:00.000Z`).toISOString(),
      };
      const conexaoExistente = await db
        .select()
        .from(clienteOpenFinance)
        .where(
          and(
            eq(clienteOpenFinance.usuarioId, usuario.id),
            eq(clienteOpenFinance.instituicao, instituicao.instituicao),
          ),
        )
        .get();
      if (conexaoExistente) {
        await db
          .update(clienteOpenFinance)
          .set(dadosOpenFinance)
          .where(eq(clienteOpenFinance.id, conexaoExistente.id));
      } else {
        await db.insert(clienteOpenFinance).values(dadosOpenFinance);
      }
    }
  }

  for (const { usuario } of clientesComUsuario) {
    if (!usuario || usuario.papel !== "usuario") {
      throw new Error("Conta de demonstração não encontrada para os dados do módulo cliente.");
    }
    const usuarioId = usuario.id;

    const patrimonioExistente = await db
      .select()
      .from(clientePatrimonio)
      .where(eq(clientePatrimonio.usuarioId, usuarioId))
      .get();
    if (patrimonioExistente) {
      continue;
    }

    const anamnese = await db
      .select()
      .from(clienteAnamnese)
      .where(eq(clienteAnamnese.usuarioId, usuarioId))
      .get();
    const distribuicao = [
      { categoria: "renda_fixa" as const, peso: anamnese?.alocacaoRendaFixa ?? 0 },
      {
        categoria: "fundos" as const,
        peso: (anamnese?.alocacaoMultimercado ?? 0) + (anamnese?.alocacaoFiis ?? 0),
      },
      { categoria: "renda_variavel" as const, peso: anamnese?.alocacaoRendaVariavel ?? 0 },
      { categoria: "outros" as const, peso: anamnese?.alocacaoInternacional ?? 0 },
    ];
    const somaPesos = distribuicao.reduce((soma, item) => soma + item.peso, 0);
    const pesos =
      somaPesos > 0
        ? distribuicao.map((item) => item.peso / somaPesos)
        : [0.5, 0.25, 0.15, 0.1];
    const total = Math.round(
      (anamnese?.patrimonioAtual || aleatorio.inteiro(50_000, 500_000)) * 100,
    ) / 100;
    const distribuicoesAtivas = distribuicao
      .map((item, indice) => ({ ...item, peso: pesos[indice] }))
      .filter((item) => item.peso > 0);
    const ativos = distribuicoesAtivas.map((item, indice) => ({
      usuarioId,
      instituicao: aleatorio.escolher(
        item.categoria === "renda_fixa"
          ? ["Tesouro Direto", "Banco do Brasil", "Itaú Unibanco"]
          : item.categoria === "fundos"
            ? ["XP Investimentos", "BTG Pactual", "Itaú Unibanco"]
            : item.categoria === "renda_variavel"
              ? ["B3", "XP Investimentos", "Nu Invest"]
              : ["XP Investimentos", "Banco Inter", "Avenue"],
      ),
      categoria: item.categoria,
      valorAtual:
        indice === distribuicoesAtivas.length - 1
          ? total -
            ativosParciais(distribuicoesAtivas, total, indice)
          : Math.round(total * item.peso * 100) / 100,
      moeda: "BRL",
      atualizadoEm: agora,
    }));

    await db.insert(clientePatrimonio).values(ativos);
  }
}

function ativosParciais(
  distribuicao: { peso: number }[],
  total: number,
  quantidade: number,
): number {
  return distribuicao
    .slice(0, quantidade)
    .reduce((soma, item) => soma + Math.round(total * item.peso * 100) / 100, 0);
}
