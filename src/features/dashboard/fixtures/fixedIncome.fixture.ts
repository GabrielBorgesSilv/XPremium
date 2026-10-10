import {
  DEMO_PRICE_METHODOLOGY,
  DEMO_REFERENCE_DATE,
  DEMO_SCENARIO,
  demoReferenceStatus,
  type FixedIncomeInstrument,
  type FixedIncomeResponse,
  type Region,
} from "../domain/types";
import { fixedIncomeResponseSchema } from "../schemas/dashboardSchemas";

const sectionStatus = demoReferenceStatus(
  `${DEMO_SCENARIO}. Campos ausentes permanecem nulos. O cache de 15 minutos das cotações não se aplica a esta seção.`,
);

function instrument(
  fields: Pick<FixedIncomeInstrument, "id" | "name" | "currency" | "country"> &
    Partial<Pick<FixedIncomeInstrument, "maturityDate" | "yieldRate" | "unitPrice" | "historicalReturn">>,
): FixedIncomeInstrument {
  return {
    maturityDate: null,
    yieldRate: null,
    unitPrice: null,
    historicalReturn: null,
    ...fields,
    referenceDate: DEMO_REFERENCE_DATE,
    dataStatus: sectionStatus,
  };
}

function buildFixedIncome(region: Region): FixedIncomeResponse {
  const instruments =
    region === "BR"
      ? [
          instrument({
            id: "DEMO_RF_BR_01",
            name: "Título IPCA+ 2029",
            currency: "BRL",
            country: "Brasil",
            maturityDate: "2029-08-15",
            yieldRate: { value: 6.15, unit: "% a.a.", type: "IPCA+" },
          }),
          instrument({
            id: "DEMO_RF_BR_02",
            name: "CDB de liquidez diária",
            currency: "BRL",
            country: "Brasil",
            unitPrice: { value: 1000, type: "valor de face" },
          }),
          instrument({
            id: "DEMO_RF_BR_03",
            name: "Título prefixado 2028",
            currency: "BRL",
            country: "Brasil",
            maturityDate: "2028-06-15",
            yieldRate: { value: 11.4, unit: "% a.a.", type: "prefixado" },
            unitPrice: { value: 912.5, type: "preço" },
            historicalReturn: {
              value: 0.5,
              period: "30D",
              methodology: `${DEMO_PRICE_METHODOLOGY} Série isolada; não deriva da taxa nem do preço.`,
            },
          }),
        ]
      : [
          instrument({
            id: "DEMO_RF_INTL_01",
            name: "Título soberano 2030",
            currency: "USD",
            country: "Estados Unidos",
            maturityDate: "2030-05-15",
            yieldRate: { value: 4.25, unit: "% a.a.", type: "soberano" },
          }),
          instrument({
            id: "DEMO_RF_INTL_02",
            name: "Nota corporativa 2028",
            currency: "USD",
            country: "Estados Unidos",
            maturityDate: "2028-03-15",
            unitPrice: { value: 98.5, type: "preço" },
          }),
          instrument({
            id: "DEMO_RF_INTL_03",
            name: "Título soberano 2032",
            currency: "USD",
            country: "Estados Unidos",
            maturityDate: "2032-11-15",
          }),
        ];

  return {
    region,
    instruments,
    dataStatus: sectionStatus,
  };
}

/** Taxa e preço são independentes. Onde a série não existe, o campo fica nulo. */
export const fixedIncomeFixtures: Record<Region, FixedIncomeResponse> = {
  BR: fixedIncomeResponseSchema.parse(buildFixedIncome("BR")),
  INTL: fixedIncomeResponseSchema.parse(buildFixedIncome("INTL")),
};
