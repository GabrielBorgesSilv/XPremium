/**
 * Gerador pseudoaleatório determinístico (mulberry32) para dados sintéticos.
 * A mesma semente gera sempre a mesma sequência, então todos da equipe
 * obtêm o mesmo banco ao rodar o seed.
 */
export type Aleatorio = {
  /** Número em [0, 1). */
  proximo(): number;
  /** Inteiro em [min, max], inclusivo. */
  inteiro(min: number, max: number): number;
  /** Decimal em [min, max), arredondado para `casas` casas decimais. */
  decimal(min: number, max: number, casas?: number): number;
  /** Item aleatório de uma lista não vazia. */
  escolher<T>(itens: readonly T[]): T;
  /** Verdadeiro com probabilidade `chance` (0 a 1). */
  chance(chance: number): boolean;
};

export function criarAleatorio(semente: number): Aleatorio {
  let estado = semente >>> 0;

  const proximo = () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    proximo,
    inteiro: (min, max) => min + Math.floor(proximo() * (max - min + 1)),
    decimal: (min, max, casas = 2) => {
      const fator = 10 ** casas;
      return Math.round((min + proximo() * (max - min)) * fator) / fator;
    },
    escolher: (itens) => {
      if (itens.length === 0) throw new Error("escolher: lista vazia");
      return itens[Math.floor(proximo() * itens.length)];
    },
    chance: (chance) => proximo() < chance,
  };
}
