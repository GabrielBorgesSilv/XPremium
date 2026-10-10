export type MockNewsArticle = {
  title: string;
  url: string;
  seendate: string;
  domain: string;
  ticker: string | null;
  summary: string;
};

const exemplos: Omit<MockNewsArticle, "url" | "seendate" | "domain">[] = [
  {
    title: "SIMULAÇÃO — Petrobras anuncia novo plano de investimentos para exploração no pré-sal",
    ticker: "PETR4",
    summary: "Cenário fictício: a Petrobras informou a aprovação de um plano plurianual que prioriza projetos do pré-sal e prevê maior produção a partir dos próximos anos. A execução pode exigir desembolsos relevantes e alterar as expectativas de produção e fluxo de caixa.",
  },
  {
    title: "SIMULAÇÃO — Vale reduz projeção de embarques após interrupção logística em corredor de minério",
    ticker: "VALE3",
    summary: "Cenário fictício: uma interrupção temporária em um corredor ferroviário levou a companhia a reduzir a projeção de embarques do trimestre. A duração da interrupção e a capacidade de compensar os volumes em outros portos ainda são incertas.",
  },
  {
    title: "SIMULAÇÃO — Itaú Unibanco registra avanço do lucro e queda da inadimplência",
    ticker: "ITUB4",
    summary: "Cenário fictício: os resultados trimestrais mostram crescimento do lucro recorrente, expansão moderada da carteira de crédito e redução da inadimplência acima de 90 dias. A administração manteve as projeções anuais.",
  },
  {
    title: "SIMULAÇÃO — Banco Central mantém Selic e sinaliza cautela com a inflação",
    ticker: "HGLG11",
    summary: "Cenário fictício: o Banco Central manteve a taxa básica de juros e afirmou que as próximas decisões dependerão da inflação de serviços. Juros elevados por mais tempo podem pressionar avaliações de fundos imobiliários, mas o efeito depende dos contratos, alavancagem e qualidade dos imóveis de cada fundo.",
  },
  {
    title: "SIMULAÇÃO — Vacância de galpões logísticos cai e novos contratos elevam a receita do setor",
    ticker: "HGLG11",
    summary: "Cenário fictício: dados setoriais apontam queda da vacância em galpões logísticos e aumento dos aluguéis em novos contratos. O efeito para cada fundo depende de sua localização, prazo dos contratos e imóveis vagos.",
  },
  {
    title: "SIMULAÇÃO — Ambev amplia capacidade de produção no Nordeste",
    ticker: "ABEV3",
    summary: "Cenário fictício: a companhia anunciou investimento em uma nova linha de produção para bebidas no Nordeste. O anúncio não informa o retorno esperado nem altera as projeções financeiras já divulgadas.",
  },
  {
    title: "SIMULAÇÃO — Nvidia recebe encomendas maiores para chips de inteligência artificial",
    ticker: "NVDA",
    summary: "Cenário fictício: fabricantes de servidores ampliaram encomendas de aceleradores de inteligência artificial. A notícia se refere à Nvidia e à cadeia internacional de semicondutores.",
  },
  {
    title: "SIMULAÇÃO — Banco do Brasil anuncia pagamento extraordinário de dividendos",
    ticker: "BBAS3",
    summary: "Cenário fictício: o conselho aprovou distribuição extraordinária de dividendos do Banco do Brasil. A decisão é específica da companhia e não informa mudanças para outros bancos.",
  },
  {
    title: "SIMULAÇÃO — Empresa de energia solar vence leilão de geração no Chile",
    ticker: null,
    summary: "Cenário fictício sem companhia ou ticker identificados: uma empresa não nomeada venceu um leilão de energia solar no Chile. O texto não permite relacionar o evento a um instrumento específico da carteira.",
  },
];

/** Cenários inteiramente fictícios: alguns acompanham ativos da carteira demo e outros servem de controle negativo. */
export function gerarFeedDemonstrativo(): MockNewsArticle[] {
  const agora = Date.now();
  return exemplos.map((article, index) => {
    const publicadoEm = new Date(agora - index * 3 * 60 * 60 * 1000);
    const seendate = `${publicadoEm.getUTCFullYear()}${String(publicadoEm.getUTCMonth() + 1).padStart(2, "0")}${String(publicadoEm.getUTCDate()).padStart(2, "0")}T${String(publicadoEm.getUTCHours()).padStart(2, "0")}${String(publicadoEm.getUTCMinutes()).padStart(2, "0")}${String(publicadoEm.getUTCSeconds()).padStart(2, "0")}Z`;
    return {
      ...article,
      url: `https://example.com/simulacao-noticias/${index + 1}`,
      seendate,
      domain: "SIMULAÇÃO — conteúdo fictício",
    };
  });
}
