/**
 * O que o script de seed (scripts/db/comum.ts) entrega ao seed de cada módulo, além do gerador.
 * Permite ligar dados a contas já criadas (ex.: vínculo assessor ↔ cliente) sem um módulo
 * importar o seed de outro. Só id, e-mail e papel: nada de senha ou dado pessoal.
 */
export type ContaSemeada = { id: string; email: string; papel: string };

export type ContextoSeed = { contas: readonly ContaSemeada[] };
