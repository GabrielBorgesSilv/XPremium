import Link from "next/link";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl p-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold">Área do cliente</h1>
        <nav className="mt-2 flex gap-4 text-sm">
          <Link href="/cliente/anamnese">Anamnese</Link>
          <Link href="/cliente/open-finance">Open Finance</Link>
          <Link href="/cliente/patrimonio">Patrimônio</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
