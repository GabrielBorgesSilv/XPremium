import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // Testes de componente usam `// @vitest-environment jsdom` no topo do arquivo.
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
