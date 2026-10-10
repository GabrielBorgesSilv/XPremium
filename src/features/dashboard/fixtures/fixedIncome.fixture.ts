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
            name: "Referência demonstrativa de renda fixa BR 01",
            currency: "BRL",
            country: "Brasil (cenário fictício)",
            maturityDate: "2027-01-15",
            yieldRate: { value: 1.25, unit: "percentual", type: "taxa demonstrativa" },
          }),
          instrument({
            id: "DEMO_RF_BR_02",
            name: "Referência demonstrativa de renda fixa BR 02",
            currency: "BRL",
            country: "Brasil (cenário fictício)",
            unitPrice: { value: 100, type: "preço demonstrativo" },
          }),
          instrument({
            id: "DEMO_RF_BR_03",
            name: "Referência demonstrativa de renda fixa BR 03",
            currency: "BRL",
            country: "Brasil (cenário fictício)",
            maturityDate: "2028-06-15",
            yieldRate: { value: 4, unit: "percentual", type: "taxa demonstrativa" },
            unitPrice: { value: 10, type: "preço demonstrativo" },
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
            name: "Referência soberana demonstrativa INTL 01",
            currency: "USD",
            country: "Jurisdição demonstrativa",
            yieldRate: { value: 2, unit: "percentual", type: "taxa demonstrativa" },
          }),
          instrument({
            id: "DEMO_RF_INTL_02",
            name: "Referência soberana demonstrativa INTL 02",
            currency: "USD",
            country: "Jurisdição demonstrativa",
            unitPrice: { value: 80, type: "preço demonstrativo" },
          }),
          instrument({
            id: "DEMO_RF_INTL_03",
            name: "Referência soberana demonstrativa INTL 03",
            currency: "USD",
            country: "Jurisdição demonstrativa",
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
