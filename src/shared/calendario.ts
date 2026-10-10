/** Utilitários de calendário (datas AAAA-MM-DD, fuso de Brasília). Sem regra de negócio. */

export const NOMES_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const;

export const DIAS_SEMANA_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

export type DiaDaGrade = { data: string; doMes: boolean };

const MES_VALIDO = /^\d{4}-(0[1-9]|1[0-2])$/;

export function mesValido(mes: string | undefined): mes is string {
  return mes !== undefined && MES_VALIDO.test(mes);
}

/** "2026-10-15T17:00:00.000Z" → "2026-10-15" no fuso de Brasília. */
export function diaEmBrasilia(iso: string | Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(iso));
}

/** "2026-10" + 1 → "2026-11"; "2026-01" − 1 → "2025-12". */
export function deslocarMes(mes: string, delta: number): string {
  const [ano, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(ano, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

/** Semanas do mês (domingo a sábado), com os dias dos meses vizinhos para completar a grade. */
export function gradeDoMes(mes: string): DiaDaGrade[][] {
  const [ano, m] = mes.split("-").map(Number);
  const primeiro = new Date(Date.UTC(ano, m - 1, 1));
  const inicio = new Date(primeiro);
  inicio.setUTCDate(1 - primeiro.getUTCDay()); // volta até o domingo

  const semanas: DiaDaGrade[][] = [];
  const dia = new Date(inicio);
  do {
    const semana: DiaDaGrade[] = [];
    for (let i = 0; i < 7; i++) {
      semana.push({ data: dia.toISOString().slice(0, 10), doMes: dia.getUTCMonth() === m - 1 });
      dia.setUTCDate(dia.getUTCDate() + 1);
    }
    semanas.push(semana);
  } while (dia.getUTCMonth() === m - 1);
  return semanas;
}

/** "2026-10" → "Outubro de 2026". */
export function nomeDoMes(mes: string): string {
  const [ano, m] = mes.split("-").map(Number);
  return `${NOMES_MESES[m - 1]} de ${ano}`;
}
