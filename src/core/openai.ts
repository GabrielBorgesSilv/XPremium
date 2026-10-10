import "server-only";
import OpenAI from "openai";

import { env } from "@/core/env";

let client: OpenAI | undefined;

export function getOpenAIClient(): OpenAI | null {
  if (!env.OPENAI_API_KEY) return null;
  client ??= new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: 20_000, maxRetries: 1 });
  return client;
}
