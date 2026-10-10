import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const cadastro = vi.hoisted(() => {
  process.env.DATABASE_URL = ":memory:";
  return { celular: null as string | null };
});

// Isola o módulo assessor: o celular do cadastro vem da interface pública do M1, simulada aqui.
vi.mock("@/modules/usuarios", () => ({
  buscarDadosPessoais: async () => (cadastro.celular ? { celular: cadastro.celular } : null),
}));

// O celular de teste é lido do env a cada import do módulo.
async function carregar(whatsappDemo: string) {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", ":memory:");
  vi.stubEnv("WHATSAPP_DEMO", whatsappDemo);
  const { db } = await import("@/core/db");
  const { pushSQLiteSchema } = await import("drizzle-kit/api");
  const assessorDb = await import("./db");
  await (await pushSQLiteSchema({ ...assessorDb }, db)).apply();
  const contato = await import("./contato");
  return { db, assessorDb, ...contato };
}

beforeAll(() => vi.unstubAllEnvs());
beforeEach(() => {
  vi.unstubAllEnvs();
  cadastro.celular = null;
});

describe("obterContatoWhatsApp", () => {
  it("cliente de outro assessor (ou inexistente) → null", async () => {
    const { obterContatoWhatsApp } = await carregar("");
    expect(await obterContatoWhatsApp("cliente-que-nao-existe", "Assessor Fictício")).toBeNull();
  });

  it("celular do cadastro tem prioridade sobre o número de teste", async () => {
    cadastro.celular = "21998765432";
    const { obterContatoWhatsApp } = await carregar("11912345678");
    expect(await obterContatoWhatsApp("cli-1", "Assessor Fictício")).toMatchObject({ celular: "21998765432", origemCelular: "cadastro" });
  });

  it("cliente de demonstração sem cadastro usa o número de teste do .env", async () => {
    const { obterContatoWhatsApp } = await carregar("11912345678");
    const c = await obterContatoWhatsApp("cli-1", "Assessor Fictício");
    expect(c).toMatchObject({ celular: "11912345678", origemCelular: "teste" });
  });

  it("sem número de teste → sem celular (o WhatsApp abre para escolher o contato)", async () => {
    const { obterContatoWhatsApp } = await carregar("");
    expect(await obterContatoWhatsApp("cli-1", "Assessor Fictício")).toMatchObject({ celular: null, origemCelular: "nenhum" });
  });

  it("número de teste inválido é ignorado", async () => {
    const { obterContatoWhatsApp } = await carregar("123");
    expect(await obterContatoWhatsApp("cli-1", "Assessor Fictício")).toMatchObject({ celular: null, origemCelular: "nenhum" });
  });

  it("traz uma mensagem pronta para cada combinação de blocos disponíveis, sem valores", async () => {
    const { obterContatoWhatsApp } = await carregar("");
    const c = (await obterContatoWhatsApp("cli-1", "Assessor Fictício"))!;
    expect(Object.keys(c.mensagens)).toHaveLength(2 ** c.disponiveis.length - 1);
    for (const texto of Object.values(c.mensagens)) {
      expect(texto).not.toMatch(/R\$/);
      expect(texto).not.toMatch(/\d+([.,]\d+)?\s*%/);
    }
  });
});

describe("registrarContatoWhatsApp", () => {
  it("guarda só os blocos (na ordem fixa), nunca o texto", async () => {
    const { db, assessorDb, registrarContatoWhatsApp } = await carregar("");
    expect(await registrarContatoWhatsApp("assessor-logado", "cli-1", ["convite", "resumo"])).toBe("ok");
    const [linha] = await db.select().from(assessorDb.assessorContatos);
    expect(linha).toMatchObject({ assessorId: "assessor-logado", clienteId: "cli-1", canal: "whatsapp", blocos: "resumo,convite" });
  });

  it("cliente que não é do assessor não é registrado", async () => {
    const { db, assessorDb, registrarContatoWhatsApp } = await carregar("");
    expect(await registrarContatoWhatsApp("assessor-logado", "cliente-que-nao-existe", ["convite"])).toBe("nao-encontrado");
    expect(await db.select().from(assessorDb.assessorContatos)).toHaveLength(0);
  });
});
