import { describe, expect, it } from "vitest";

import {
  formatarCelular,
  formatarData,
  formatarDataHora,
  formatarMoeda,
  formatarMoedaCompacta,
  formatarNumero,
  formatarPercentual,
} from "./formatar";

// Intl usa espaço não separável entre "R$" e o número; normalizamos para comparar.
const limpar = (texto: string) => texto.replace(/\s/g, " ");

describe("formatar", () => {
  it("formata moeda em reais e dólares", () => {
    expect(limpar(formatarMoeda(1234.5))).toBe("R$ 1.234,50");
    expect(limpar(formatarMoeda(57.4, "USD"))).toBe("US$ 57,40");
    expect(formatarMoeda(null)).toBe("—");
  });

  it("resume valores grandes", () => {
    expect(limpar(formatarMoedaCompacta(1_234_567))).toBe("R$ 1,2 mi");
    expect(limpar(formatarMoedaCompacta(350_000))).toBe("R$ 350 mil");
  });

  it("formata frações como percentual, com sinal opcional", () => {
    expect(formatarPercentual(0.1234)).toBe("12,3%");
    expect(formatarPercentual(0.1, { sinal: true })).toBe("+10,0%");
    expect(formatarPercentual(-0.05, { sinal: true })).toBe("-5,0%");
    expect(formatarPercentual(null)).toBe("—");
  });

  it("formata celular com DDD e devolve outros formatos como vieram", () => {
    expect(formatarCelular("11912345678")).toBe("(11) 91234-5678");
    expect(formatarCelular("1234")).toBe("1234");
  });

  it("formata números e datas no padrão brasileiro", () => {
    expect(formatarNumero(1500)).toBe("1.500");
    expect(formatarNumero(0.35, 2)).toBe("0,35");
    expect(formatarData("2026-10-09T18:00:00-03:00")).toBe("09/10/2026");
    expect(formatarDataHora("2026-10-09T18:00:00-03:00")).toBe("09/10/2026, 18:00");
  });
});
