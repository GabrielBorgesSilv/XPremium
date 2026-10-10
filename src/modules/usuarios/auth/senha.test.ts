import { describe, expect, it } from "vitest";

import { gerarHashSenha, verificarSenha } from "./senha";

describe("senha", () => {
  it("confere a senha correta e recusa a errada", async () => {
    const hash = await gerarHashSenha("senha-ficticia");
    expect(await verificarSenha("senha-ficticia", hash)).toBe(true);
    expect(await verificarSenha("outra-senha", hash)).toBe(false);
  });

  it("não guarda a senha em texto e usa sal diferente a cada hash", async () => {
    const a = await gerarHashSenha("senha-ficticia");
    const b = await gerarHashSenha("senha-ficticia");
    expect(a).not.toContain("senha-ficticia");
    expect(a).not.toBe(b);
  });

  it("recusa hash malformado", async () => {
    expect(await verificarSenha("x", "")).toBe(false);
    expect(await verificarSenha("x", "md5$abc$def")).toBe(false);
    expect(await verificarSenha("x", "scrypt$00$00")).toBe(false);
  });
});
