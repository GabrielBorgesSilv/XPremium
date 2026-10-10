import { expectedQuoteCurrency } from "../domain/selectors";
import {
  demoReferenceStatus,
  type FixedIncomeInstrument,
  type FixedIncomeResponse,
  type Region,
} from "../domain/types";
import { fixedIncomeFixtures } from "../fixtures/fixedIncome.fixture";
import type { FixedIncomeProvider } from "../providers/contracts";
import { regionSchema } from "../schemas/dashboardSchemas";

export type FixedIncomeServiceError = {
  code: "INVALID_REGION";
  message: string;
  details?: { allowedValues: string[] };
};

export type FixedIncomeReadResult =
  | { ok: true; data: FixedIncomeResponse }
  | { ok: false; error: FixedIncomeServiceError };

function copyInstrument(instrument: FixedIncomeInstrument): FixedIncomeInstrument {
  return {
    id: instrument.id,
    name: instrument.name,
    currency: instrument.currency,
    country: instrument.country,
    referenceDate: instrument.referenceDate,
    maturityDate: instrument.maturityDate,
    yieldRate: instrument.yieldRate ? { ...instrument.yieldRate } : null,
    unitPrice: instrument.unitPrice ? { ...instrument.unitPrice } : null,
    historicalReturn: instrument.historicalReturn ? { ...instrument.historicalReturn } : null,
    dataStatus: { ...instrument.dataStatus },
  };
}

/**
 * Lista as referências da região, na ordem do conjunto.
 * Não ordena alta/baixa e não deriva preço a partir da taxa.
 */
export function getFixedIncome(
  region: Region,
  source: Record<Region, FixedIncomeResponse> = fixedIncomeFixtures,
): FixedIncomeResponse {
  const response = source[region];
  const currency = expectedQuoteCurrency(region);
  const instruments = response.instruments
    .filter((instrument) => instrument.currency === currency)
    .map(copyInstrument);

  return {
    region,
    instruments,
    dataStatus: response.dataStatus
      ? { ...response.dataStatus }
      : demoReferenceStatus("Conjunto de demonstração sem referências nesta região."),
  };
}

export function queryFixedIncome(
  input: unknown,
  source: Record<Region, FixedIncomeResponse> = fixedIncomeFixtures,
): FixedIncomeReadResult {
  const parsed = regionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_REGION",
        message: "Região inválida para renda fixa.",
        details: { allowedValues: ["BR", "INTL"] },
      },
    };
  }
  return { ok: true, data: getFixedIncome(parsed.data, source) };
}

export function createFixedIncomeProvider(
  source: Record<Region, FixedIncomeResponse> = fixedIncomeFixtures,
): FixedIncomeProvider {
  return {
    async getFixedIncome(region: Region): Promise<FixedIncomeResponse> {
      return getFixedIncome(region, source);
    },
  };
}
