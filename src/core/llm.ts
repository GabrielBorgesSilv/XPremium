import "server-only";
import Anthropic from "@anthropic-ai/sdk";

import { env } from "@/core/env";

export const llm = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export const MODELO_AGENTS = "claude-opus-5-5";
