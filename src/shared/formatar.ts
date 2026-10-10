/** Formatação de números e datas no padrão brasileiro (pt-BR). Sem regra de negócio. */

const SEM_VALOR = "—";

export function formatarMoeda(valor: number | null, moeda: "BRL" | "USD" = "BRL"): string {
  if (valor === null) return SEM_VALOR;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda }).format(valor);
}

/** Valor grande resumido: R$ 1,2 mi, R$ 350 mil. */
export function formatarMoedaCompacta(valor: number | null): string {
  if (valor === null) return SEM_VALOR;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(valor);
}

/** Recebe fração (0,123) e devolve "12,3%". Com `sinal`, mostra "+" nos positivos. */
export function formatarPercentual(fracao: number | null, { sinal = false, casas = 1 } = {}): string {
  if (fracao === null) return SEM_VALOR;
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
    signDisplay: sinal ? "exceptZero" : "auto",
  }).format(fracao);
}

export function formatarNumero(valor: number, casas = 0): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: casas }).format(valor);
}

/** "2026-10-09T18:00:00-03:00" → "09/10/2026" (no fuso de Brasília). */
export function formatarData(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(new Date(iso));
}

/** "2026-10-09T18:00:00-03:00" → "09/10/2026, 18:00" (no fuso de Brasília). */
export function formatarDataHora(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}
