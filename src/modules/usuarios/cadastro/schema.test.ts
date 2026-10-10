import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CadastroSchema } from "./schema";

const valido = {
  nome: "Pessoa Fictícia",
  email: "pessoa@hubxp.test",
  senha: "senha-ficticia",
  confirmacaoSenha: "senha-ficticia",
  nascimento: "1990-05-20",
  celular: "(11) 91234-5678",
  profissao: "Engenheira",
  estadoCivil: "solteiro",
  rendaFaixa: "5k-15k",
  consentimento: true,
};

function errosDe(entrada: Record<string, unknown>) {
  const r = CadastroSchema.safeParse(entrada);
  return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [i.path.join("."), i.message]));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-10T12:00:00.000Z"));
});
afterEach(() => vi.useRealTimers());

describe("CadastroSchema", () => {
  it("aceita um cadastro completo e normaliza e-mail e celular", () => {
    const r = CadastroSchema.parse({ ...valido, email: "  Pessoa@HubXP.test ", celular: "(11) 91234-5678" });
    expect(r.email).toBe("pessoa@hubxp.test");
    expect(r.celular).toBe("11912345678");
  });

  it("todos os campos são obrigatórios", () => {
    const erros = errosDe({});
    for (const campo of [
      "nome",
      "email",
      "senha",
      "nascimento",
      "celular",
      "profissao",
      "estadoCivil",
      "rendaFaixa",
      "consentimento",
    ]) {
      expect(erros, campo).toHaveProperty(campo);
    }
  });

  it("senha: mínimo 8 e máximo 200 caracteres", () => {
    expect(errosDe({ ...valido, senha: "1234567", confirmacaoSenha: "1234567" })).toHaveProperty("senha");
    expect(errosDe({ ...valido, senha: "12345678", confirmacaoSenha: "12345678" })).toEqual({});
    const longa = "x".repeat(201);
    expect(errosDe({ ...valido, senha: longa, confirmacaoSenha: longa })).toHaveProperty("senha");
  });

  it("confirmação precisa ser igual à senha", () => {
    expect(errosDe({ ...valido, confirmacaoSenha: "outra-senha" })).toHaveProperty("confirmacaoSenha");
  });

  it("exige 18 anos ou mais (hoje: 10/10/2026)", () => {
    expect(errosDe({ ...valido, nascimento: "2008-10-10" })).toEqual({}); // faz 18 hoje
    expect(errosDe({ ...valido, nascimento: "2008-10-11" })).toHaveProperty("nascimento"); // 17 anos
  });

  it("recusa datas futuras, impossíveis e absurdas", () => {
    for (const nascimento of ["2030-01-01", "1990-02-30", "20/05/1990", "1880-01-01", ""]) {
      expect(errosDe({ ...valido, nascimento }), nascimento).toHaveProperty("nascimento");
    }
  });

  it("celular: DDD + 9 + 8 dígitos", () => {
    for (const celular of ["11912345678", "(21) 99876-5432", "21 998765432"]) {
      expect(errosDe({ ...valido, celular }), celular).toEqual({});
    }
    for (const celular of ["1191234567", "(11) 3123-4567", "(01) 91234-5678", "119123456789"]) {
      expect(errosDe({ ...valido, celular }), celular).toHaveProperty("celular");
    }
  });

  it("estado civil aceita as seis opções, incluindo separado e viúvo", () => {
    for (const estadoCivil of ["solteiro", "casado", "uniao-estavel", "separado", "divorciado", "viuvo"]) {
      expect(errosDe({ ...valido, estadoCivil }), estadoCivil).toEqual({});
    }
  });

  it("estado civil e renda só aceitam as opções do formulário", () => {
    expect(errosDe({ ...valido, estadoCivil: "outro" })).toHaveProperty("estadoCivil");
    expect(errosDe({ ...valido, rendaFaixa: "1-milhao" })).toHaveProperty("rendaFaixa");
  });

  it("consentimento é obrigatório", () => {
    expect(errosDe({ ...valido, consentimento: false })).toHaveProperty("consentimento");
  });
});
