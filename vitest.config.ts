import path from "node:path";

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    // Testes rodam fora do Next: usa a versão vazia do server-only (a mesma que o Next usa no servidor).
    alias: { "server-only": path.resolve("node_modules/server-only/empty.js") },
  },
  test: {
    // Testes de componente usam `// @vitest-environment jsdom` no topo do arquivo.
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
