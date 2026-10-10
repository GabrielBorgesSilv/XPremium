import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  senha: string,
  sal: Buffer,
  tamanho: number,
) => Promise<Buffer>;

const TAMANHO_CHAVE = 64;

/** Gera o hash da senha no formato `scrypt$<sal hex>$<hash hex>`. */
export async function gerarHashSenha(senha: string): Promise<string> {
  const sal = randomBytes(16);
  const hash = await scryptAsync(senha, sal, TAMANHO_CHAVE);
  return `scrypt$${sal.toString("hex")}$${hash.toString("hex")}`;
}

/** Compara a senha com o hash em tempo constante. Hash malformado nunca confere. */
export async function verificarSenha(senha: string, armazenado: string): Promise<boolean> {
  const [algoritmo, salHex, hashHex] = armazenado.split("$");
  if (algoritmo !== "scrypt" || !salHex || !hashHex) return false;

  const esperado = Buffer.from(hashHex, "hex");
  if (esperado.length !== TAMANHO_CHAVE) return false;

  const calculado = await scryptAsync(senha, Buffer.from(salHex, "hex"), TAMANHO_CHAVE);
  return timingSafeEqual(calculado, esperado);
}
