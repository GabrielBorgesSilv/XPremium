import "server-only";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "@/core/env";

export const db = drizzle({ connection: { url: env.DATABASE_URL } });
