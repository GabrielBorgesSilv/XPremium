import Link from "next/link";

export default function Home() {
  return (
    <main className="xp-home">
      <section className="xp-home-brand">
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -1 }}>XP <span style={{ color: "#c8ff00" }}>XPremium</span></div>
        <div style={{ maxWidth: 500 }}><p style={{ color: "#c8ff00", fontSize: 10, letterSpacing: 2 }}>ASSESSORIA PRIVATE</p><h1 style={{ fontSize: "clamp(36px, 5vw, 62px)", lineHeight: 1.03, letterSpacing: -2 }}>Seu patrimônio.<br/><span style={{ color: "#c8ff00" }}>Suas escolhas.</span></h1><p style={{ maxWidth: 390, color: "#aaa", lineHeight: 1.7 }}>Uma experiência próxima e completa para acompanhar seus investimentos ao lado da sua assessoria.</p></div>
        <small style={{ color: "#777" }}>Gestão patrimonial XPremium</small>
      </section>
      <section className="xp-home-access">
        <div style={{ width: "min(390px, 100%)" }}><p style={{ color: "#777", fontSize: 10, letterSpacing: 1 }}>ACESSO SEGURO</p><h2 style={{ fontSize: 26, letterSpacing: -1 }}>Acesse seu espaço</h2><p style={{ color: "#777", fontSize: 12 }}>Escolha como deseja visualizar a plataforma.</p>
          <nav style={{ display: "grid", gap: 10, marginTop: 25 }}>
            <Link href="/assessor" className="xp-btn lime" style={{ padding: 15 }}>Sou assessor <span aria-hidden="true">→</span></Link>
            <Link href="/cliente" className="xp-btn" style={{ padding: 15 }}>Sou cliente <span aria-hidden="true">→</span></Link>
          </nav>
          <p style={{ marginTop: 28, textAlign: "center", color: "#888", fontSize: 9 }}>Protótipo de interface · dados demonstrativos</p>
        </div>
      </section>
    </main>
  );
}
