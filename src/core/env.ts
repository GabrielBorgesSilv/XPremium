import "server-only";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().default("file:./hub.db"),
  OPEN_FINANCE_API_KEY: z.string().default(""),
  NEWS_API_KEY: z.string().default(""),
  ANTHROPIC_API_KEY: z.string().default(""),
  // Senha dos usuários fictícios criados pelo seed (só desenvolvimento/demo).
  SENHA_DEMO: z.string().default(""),
});

export const env = schema.parse(process.env);
