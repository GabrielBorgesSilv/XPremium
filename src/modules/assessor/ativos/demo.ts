/**
 * Dados FICTÍCIOS de demonstração do M4, usados enquanto não existem o banco de clientes (M1/M3),
 * o histórico de preços (M2) e o agente de notícias (M5). Nenhum dado é real (LGPD).
 * Preços, notícias e impactos são inventados e sempre exibidos com o rótulo de simulados.
 */
import type { DadosCarteiras } from "./calculos";

/** Data de referência fixa: a demo mostra sempre os mesmos números. */
export const DEMO_AS_OF = "2026-10-09T18:00:00-03:00";


const cotacao = (ticker: string, preco: number) => ({ ticker, preco, origem: "SIMULADO" as const, asOf: DEMO_AS_OF });

export const CARTEIRAS_DEMO: DadosCarteiras = {
  ativos: [
    { ticker: "PETR4", nome: "Petrobras PN", categoria: "ACOES", moeda: "BRL" },
    { ticker: "VALE3", nome: "Vale ON", categoria: "ACOES", moeda: "BRL" },
    { ticker: "ITUB4", nome: "Itaú Unibanco PN", categoria: "ACOES", moeda: "BRL" },
    { ticker: "HGLG11", nome: "CSHG Logística FII", categoria: "FII_REIT", moeda: "BRL" },
    { ticker: "KNRI11", nome: "Kinea Renda Imobiliária FII", categoria: "FII_REIT", moeda: "BRL" },
    { ticker: "XPML11", nome: "XP Malls FII", categoria: "FII_REIT", moeda: "BRL" },
    { ticker: "O", nome: "Realty Income (REIT)", categoria: "FII_REIT", moeda: "USD" },
    { ticker: "IVVB11", nome: "iShares S&P 500 (ETF)", categoria: "ETF", moeda: "BRL" },
    { ticker: "BOVA11", nome: "iShares Ibovespa (ETF)", categoria: "ETF", moeda: "BRL" },
    { ticker: "BTC", nome: "Bitcoin", categoria: "CRIPTO", moeda: "BRL" },
    { ticker: "IPCA-2035", nome: "Tesouro IPCA+ 2035", categoria: "RENDA_FIXA", moeda: "BRL" },
    // Títulos bancários de emissores fictícios, cobertos pelo FGC.
    { ticker: "CDB-ALFA-2027", nome: "CDB Banco Alfa 2027", categoria: "RENDA_FIXA", moeda: "BRL", emissor: "Banco Alfa", coberturaFGC: true },
    { ticker: "LCI-ALFA-2026", nome: "LCI Banco Alfa 2026", categoria: "RENDA_FIXA", moeda: "BRL", emissor: "Banco Alfa", coberturaFGC: true },
    { ticker: "LCA-BETA-2028", nome: "LCA Banco Beta 2028", categoria: "RENDA_FIXA", moeda: "BRL", emissor: "Banco Beta", coberturaFGC: true },
  ],
  // Carteiras-MODELO: o seed do assessor entrega a carteira-1 ao 1º cliente de demo, a carteira-2 ao 2º...
  // (assessor/seed.ts). As telas leem as posições do banco (assessor_posicoes), não daqui.
  posicoes: [
    // carteira-1: concentrada em renda fixa.
    { clienteId: "carteira-1", ticker: "IPCA-2035", quantidade: 60 },
    { clienteId: "carteira-1", ticker: "ITUB4", quantidade: 800 },
    { clienteId: "carteira-1", ticker: "HGLG11", quantidade: 120 },
    // carteira-1 passa do FGC no Banco Alfa só somando os dois títulos (R$ 162.810 + R$ 104.210).
    { clienteId: "carteira-1", ticker: "CDB-ALFA-2027", quantidade: 150 },
    { clienteId: "carteira-1", ticker: "LCI-ALFA-2026", quantidade: 100 },
    // carteira-2: diversificada.
    { clienteId: "carteira-2", ticker: "PETR4", quantidade: 1500 },
    { clienteId: "carteira-2", ticker: "VALE3", quantidade: 600 },
    { clienteId: "carteira-2", ticker: "IVVB11", quantidade: 90 },
    { clienteId: "carteira-2", ticker: "KNRI11", quantidade: 150 },
    { clienteId: "carteira-2", ticker: "IPCA-2035", quantidade: 15 },
    { clienteId: "carteira-2", ticker: "O", quantidade: 200 },
    // carteira-2 fica perto do limite no Banco Beta (R$ 229.792,50, 92%).
    { clienteId: "carteira-2", ticker: "LCA-BETA-2028", quantidade: 225 },
    // carteira-3: com cripto e exterior.
    { clienteId: "carteira-3", ticker: "BTC", quantidade: 0.35 },
    { clienteId: "carteira-3", ticker: "IVVB11", quantidade: 140 },
    { clienteId: "carteira-3", ticker: "PETR4", quantidade: 400 },
    { clienteId: "carteira-3", ticker: "O", quantidade: 120 },
    { clienteId: "carteira-3", ticker: "CDB-ALFA-2027", quantidade: 50 },
    // carteira-4: concentrada em ações; XPML11 está sem cotação (mostra cobertura parcial).
    { clienteId: "carteira-4", ticker: "PETR4", quantidade: 5000 },
    { clienteId: "carteira-4", ticker: "VALE3", quantidade: 900 },
    { clienteId: "carteira-4", ticker: "BOVA11", quantidade: 300 },
    { clienteId: "carteira-4", ticker: "XPML11", quantidade: 200 },
  ],
  cotacoes: [
    cotacao("PETR4", 38.5),
    cotacao("VALE3", 61.2),
    cotacao("ITUB4", 34.8),
    cotacao("HGLG11", 158),
    cotacao("KNRI11", 142.3),
    cotacao("O", 57.4),
    cotacao("IVVB11", 352.1),
    cotacao("BOVA11", 128.6),
    cotacao("BTC", 340000),
    cotacao("IPCA-2035", 3150),
    cotacao("CDB-ALFA-2027", 1085.4),
    cotacao("LCI-ALFA-2026", 1042.1),
    cotacao("LCA-BETA-2028", 1021.3),
  ],
  cambio: { USD: 5.4 },
};

/** Valor atual usado como fim da série simulada: preço, ou taxa (% a.a.) em renda fixa. */
export const REFERENCIA_SERIE_DEMO: Record<string, number> = {
  "IPCA-2035": 6.45,
  "CDB-ALFA-2027": 13.1,
  "LCI-ALFA-2026": 11.2,
  "LCA-BETA-2028": 11.6,
};

export type NoticiaDemo = { id: string; titulo: string; fonte: string; publicadoEm: string };

export const NOTICIAS_DEMO: NoticiaDemo[] = [
  { id: "n1", titulo: "Petróleo sobe no mercado internacional", fonte: "Fonte fictícia", publicadoEm: "2026-10-09T09:30:00-03:00" },
  { id: "n2", titulo: "Demanda por minério recua na Ásia", fonte: "Fonte fictícia", publicadoEm: "2026-10-08T14:00:00-03:00" },
  { id: "n3", titulo: "Vacância em galpões logísticos cai no trimestre", fonte: "Fonte fictícia", publicadoEm: "2026-10-07T11:15:00-03:00" },
  { id: "n4", titulo: "Juros longos sobem e pressionam fundos imobiliários", fonte: "Fonte fictícia", publicadoEm: "2026-10-09T16:40:00-03:00" },
  { id: "n5", titulo: "Mudança tributária em REITs é discutida nos EUA", fonte: "Fonte fictícia", publicadoEm: "2026-10-06T10:00:00-03:00" },
];

/** Resposta simulada do agente de IA. Inclui um ticker inventado, que o filtro deve descartar. */
export const RESPOSTA_IA_DEMO: unknown = [
  { noticiaId: "n1", ticker: "PETR4", direcao: "POSITIVO", motivo: "Preço do petróleo mais alto tende a favorecer a receita da empresa.", publicadoEm: "2026-10-09T09:30:00-03:00", geradoPorIA: true },
  { noticiaId: "n2", ticker: "VALE3", direcao: "NEGATIVO", motivo: "Menor demanda por minério pode pressionar preços e volumes.", publicadoEm: "2026-10-08T14:00:00-03:00", geradoPorIA: true },
  { noticiaId: "n3", ticker: "HGLG11", direcao: "POSITIVO", motivo: "Fundo tem portfólio de galpões logísticos.", publicadoEm: "2026-10-07T11:15:00-03:00", geradoPorIA: true },
  { noticiaId: "n4", ticker: "HGLG11", direcao: "NEGATIVO", motivo: "Juros mais altos costumam reduzir o valor de cotas de FIIs.", publicadoEm: "2026-10-09T16:40:00-03:00", geradoPorIA: true },
  { noticiaId: "n4", ticker: "KNRI11", direcao: "NEGATIVO", motivo: "Juros mais altos costumam reduzir o valor de cotas de FIIs.", publicadoEm: "2026-10-09T16:40:00-03:00", geradoPorIA: true },
  { noticiaId: "n5", ticker: "O", direcao: "INDEFINIDO", motivo: "Efeito depende do texto final da proposta.", publicadoEm: "2026-10-06T10:00:00-03:00", geradoPorIA: true },
  { noticiaId: "n1", ticker: "INVENTADO3", direcao: "POSITIVO", motivo: "Ativo que nenhum cliente tem.", publicadoEm: "2026-10-09T09:30:00-03:00", geradoPorIA: true },
];
