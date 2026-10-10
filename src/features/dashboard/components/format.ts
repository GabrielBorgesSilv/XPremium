import type { PriceBasis } from "../domain/types";

const PRICE_BASIS_LABEL: Record<PriceBasis, string> = {
  ADJUSTED: "Ajustado",
  UNADJUSTED: "Não ajustado",
  NOT_APPLICABLE: "Não se aplica",
};

function formatDecimal(value: number): string {
  const negative = value < 0;
  const [whole, fraction = "00"] = Math.abs(value).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negative ? "-" : ""}${grouped},${fraction}`;
}

export function formatNumber(value: number): string {
  return formatDecimal(value).replace(/,00$/, "");
}

export function formatPercent(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatDecimal(value)}%`;
}

export function formatMoney(value: number, currency: string): string {
  return `${currency} ${formatDecimal(value)}`;
}

export function formatTimestamp(iso: string | null): string {
  const match = iso?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return "Sem data";
  const [, year, month, day, hour, minute] = match;
  return `${day}/${month}/${year} ${hour}:${minute} UTC`;
}

export function formatDate(iso: string | null): string {
  const match = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "Sem data";
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

export function priceBasisLabel(basis: PriceBasis): string {
  return PRICE_BASIS_LABEL[basis];
}
