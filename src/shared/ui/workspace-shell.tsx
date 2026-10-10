"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type WorkspaceRole = "assessor" | "cliente";

const navigation: Record<WorkspaceRole, { group: string; links: { label: string; href: string; icon: string }[] }[]> = {
  assessor: [
    { group: "Visão geral", links: [{ label: "Dashboard", href: "/assessor", icon: "▦" }, { label: "Carteira", href: "/assessor/ativos", icon: "◈" }, { label: "Investimentos", href: "/assessor/ativos", icon: "↗" }, { label: "Métricas", href: "/assessor/metricas", icon: "⌁" }] },
    { group: "Relacionamento", links: [{ label: "Clientes", href: "/assessor/clientes", icon: "♙" }, { label: "Agenda", href: "/assessor", icon: "▦" }, { label: "Perfil", href: "/assessor", icon: "◉" }] },
    { group: "Expansão", links: [{ label: "Prospecção", href: "/assessor/prospeccao", icon: "⌕" }] },
  ],
  cliente: [
    { group: "Visão geral", links: [{ label: "Dashboard", href: "/cliente", icon: "▦" }, { label: "Patrimônio", href: "/cliente/patrimonio", icon: "◈" }, { label: "Investimentos", href: "/cliente/patrimonio", icon: "↗" }] },
    { group: "Relacionamento", links: [{ label: "Agenda", href: "/cliente", icon: "▦" }, { label: "Meu perfil", href: "/cliente/anamnese", icon: "◉" }, { label: "Open Finance", href: "/cliente/open-finance", icon: "⌁" }] },
  ],
};

export function WorkspaceShell({ role, children }: { role: WorkspaceRole; children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (href: string) => pathname === href || (href !== `/${role}` && pathname.startsWith(href));
  const destination = role === "assessor" ? "/cliente" : "/assessor";

  return (
    <div className="xp-shell">
      <aside className={`xp-side${menuOpen ? " open" : ""}`}>
        <Link className="xp-brand" href={`/${role}`}><span className="xp-brand-mark">XP</span><span>XPremium<small>GESTÃO PATRIMONIAL</small></span></Link>
        {navigation[role].map((section) => <div key={section.group}>
          <div className="xp-group">{section.group}</div>
          {section.links.map((item) => <Link key={`${item.label}-${item.href}`} className={`xp-link${isActive(item.href) ? " active" : ""}`} href={item.href} onClick={() => setMenuOpen(false)}><span className="xp-link-icon" aria-hidden="true">{item.icon}</span>{item.label}</Link>)}
        </div>)}
        <div className="xp-side-bottom">
          <div className="xp-help"><b>Atendimento private</b><p>Fale com sua assessoria sempre que precisar.</p></div>
          <div className="xp-user"><span className="xp-avatar">{role === "assessor" ? "MC" : "AM"}</span><span><b>{role === "assessor" ? "Mariana Costa" : "Ana Martins"}</b><small>{role === "assessor" ? "Assessora private" : "Cliente private"}</small></span></div>
        </div>
      </aside>
      <main className="xp-main">
        <header className="xp-top">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="xp-icon-button xp-mobile-menu" aria-label="Abrir menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>☰</button>
            <div className="xp-crumb">XPremium&nbsp; / &nbsp;<b>{pathname.split("/").filter(Boolean).at(-1) ?? "Dashboard"}</b></div>
          </div>
          <div className="xp-top-actions">
            <Link className="xp-role" href={destination}>Visualizar {role === "assessor" ? "cliente" : "assessor"}</Link>
            <button className="xp-icon-button" aria-label="Notificações">♧</button>
            <span className="xp-avatar">{role === "assessor" ? "MC" : "AM"}</span>
          </div>
        </header>
        <div className="xp-content">{children}</div>
      </main>
    </div>
  );
}
