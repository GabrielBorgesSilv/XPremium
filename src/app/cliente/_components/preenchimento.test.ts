import { describe, expect, it } from "vitest";

import type { DadosPessoais } from "@/modules/usuarios";

import { preenchimentoDoPerfil } from "./preenchimento";

const dados: DadosPessoais = {
  usuarioId: "u1",
  nascimento: "1990-01-01",
  celular: "11912345678",
  profissao: "Designer",
  estadoCivil: "solteiro",
  rendaFaixa: "5k-15k",
  consentimentoEm: "2026-10-10T00:00:00.000Z",
  consentimentoVersao: "2026-10-10",
};

describe("preenchimento do perfil", () => {
  it("conta só nome e e-mail quando não há dados pessoais nem questionário", () => {
    const resultado = preenchimentoDoPerfil({
      nome: "Ana Martins",
      email: "ana@hubxp.test",
      dados: null,
      questionarioPreenchido: false,
    });
    expect(resultado).toEqual({ preenchidos: 2, total: 8, fracao: 0.25 });
  });

  it("sobe quando os dados pessoais e o questionário existem", () => {
    const resultado = preenchimentoDoPerfil({
      nome: "Ana Martins",
      email: "ana@hubxp.test",
      dados,
      questionarioPreenchido: true,
    });
    expect(resultado.preenchidos).toBe(8);
    expect(resultado.fracao).toBe(1);
  });

  it("não conta celular vazio", () => {
    const resultado = preenchimentoDoPerfil({
      nome: "Ana",
      email: "ana@hubxp.test",
      dados: { ...dados, celular: null },
      questionarioPreenchido: false,
    });
    expect(resultado.preenchidos).toBe(6);
  });
});
