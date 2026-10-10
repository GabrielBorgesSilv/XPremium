import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Hub XP</h1>
      <nav className="mt-6 flex gap-4">
        <Link href="/cliente">Sou cliente</Link>
        <Link href="/assessor">Sou assessor</Link>
      </nav>
    </main>
  );
}
