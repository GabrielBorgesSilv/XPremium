"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type WorkspaceRole = "assessor" | "cliente";

const navigation: Record<WorkspaceRole, { group: string; links: { label: string; href: string; icon: string }[] }[]> = {
  assessor: [
    { group: "Visão geral", links: [{ label: "Dashboard", href: "/assessor", icon: "▦" }, { label: "Mercado", href: "/assessor/dashboard", icon: "▤" }, { label: "Investimentos", href: "/assessor/ativos", icon: "↗" }, { label: "Métricas", href: "/assessor/metricas", icon: "⌁" }] },
    { group: "Relacionamento", links: [{ label: "Clientes", href: "/assessor/clientes", icon: "♙" }, { label: "Agenda", href: "/assessor", icon: "▦" }, { label: "Perfil", href: "/assessor/perfil", icon: "◉" }] },
  ],
  cliente: [
    { group: "Visão geral", links: [{ label: "Dashboard", href: "/cliente", icon: "▦" }, { label: "Patrimônio", href: "/cliente/patrimonio", icon: "◈" }, { label: "Investimentos", href: "/cliente/patrimonio", icon: "↗" }] },
    { group: "Relacionamento", links: [{ label: "Reuniões", href: "/cliente/reunioes", icon: "▦" }, { label: "Meu perfil", href: "/cliente/perfil", icon: "◉" }, { label: "Open Finance", href: "/cliente/open-finance", icon: "⌁" }] },
  ],
};

/** Iniciais do avatar: primeira letra do primeiro e do último nome ("Carla Rocha" → "CR"). */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts.at(-1)![0] : "")).toUpperCase();
}

type WorkspaceShellProps = {
  role: WorkspaceRole;
  /** Usuário logado (vem do layout, via exigirPapel). */
  user: { name: string };
  /** Pode abrir a área do assessor (papel assessor ou admin): controla o botão "Visualizar assessor". */
  canViewAdvisor: boolean;
  /** Server Action de logout (sairAction), passada pelo layout: src/shared não importa src/app. */
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
};

export function WorkspaceShell({ role, user, canViewAdvisor, signOutAction, children }: WorkspaceShellProps) {
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
          <div className="xp-user"><span className="xp-avatar">{initials(user.name)}</span><span><b>{user.name}</b><small>{role === "assessor" ? "Assessora private" : "Cliente private"}</small></span></div>
          <form action={signOutAction}><button type="submit" className="xp-link"><span className="xp-link-icon" aria-hidden="true">⎋</span>Sair</button></form>
        </div>
      </aside>
      <main className="xp-main">
        <header className="xp-top">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="xp-icon-button xp-mobile-menu" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>☰</button>
            <div className="xp-crumb">XPremium&nbsp; / &nbsp;<b>{pathname.split("/").filter(Boolean).at(-1) ?? "Dashboard"}</b></div>
          </div>
          <div className="xp-top-actions">
            {(role === "assessor" || canViewAdvisor) && <Link className="xp-role" href={destination}>Visualizar {role === "assessor" ? "cliente" : "assessor"}</Link>}
            <button className="xp-icon-button" aria-label="Notificações">♧</button>
            <span className="xp-avatar" title={user.name}>{initials(user.name)}</span>
          </div>
        </header>
        <div className="xp-content">{children}</div>
      </main>
    </div>
  );
}
