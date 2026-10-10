/** Fronteiras do monolito modular. Rode com `npm run check:modules`. */
module.exports = {
  forbidden: [
    {
      name: "modulo-so-pela-interface-publica",
      comment: "Um módulo só importa outro pelo index.ts (interface pública).",
      severity: "error",
      from: { path: "^src/modules/([^/]+)/" },
      to: {
        path: "^src/modules/[^/]+/.+",
        pathNot: ["^src/modules/$1/", "^src/modules/[^/]+/index\\.ts$"],
      },
    },
    {
      name: "app-so-pela-interface-publica",
      comment: "Páginas e rotas em src/app só importam módulos pelo index.ts.",
      severity: "error",
      from: { path: "^src/app/" },
      to: { path: "^src/modules/[^/]+/.+", pathNot: "^src/modules/[^/]+/index\\.ts$" },
    },
    {
      name: "infra-nao-depende-de-modulos",
      comment: "src/core e src/shared não conhecem os módulos de negócio.",
      severity: "error",
      from: { path: "^src/(core|shared)/" },
      to: { path: "^src/modules/" },
    },
    {
      name: "sem-ciclos",
      severity: "error",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
  },
};
