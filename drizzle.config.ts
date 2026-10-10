import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  // Cada submódulo declara suas próprias tabelas em db.ts.
  schema: "./src/modules/**/db.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "file:./hub.db" },
});
