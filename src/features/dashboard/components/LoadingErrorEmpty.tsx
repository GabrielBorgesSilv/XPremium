const COPY = {
  loading: "Carregando dados de demonstração.",
  empty: "Nenhum dado de demonstração neste recorte.",
  error: "Não foi possível montar este bloco de demonstração.",
} as const;

export function LoadingErrorEmpty({
  state,
  title,
}: {
  state: "loading" | "empty" | "error";
  title?: string;
}) {
  const message = title ?? COPY[state];
  return (
    <p role={state === "error" ? "alert" : "status"} className="xp-desc">
      {message}
    </p>
  );
}
