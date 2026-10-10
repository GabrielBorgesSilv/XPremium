import Link from "next/link";

export default function AssessorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl p-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold">Área do assessor</h1>
        <nav className="mt-2 flex gap-4 text-sm">
          <Link href="/assessor/clientes">Meus clientes</Link>
          <Link href="/assessor/ativos">Meus ativos</Link>
          <Link href="/assessor/metricas">Métricas</Link>
          <Link href="/assessor/prospeccao">Prospecção</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
