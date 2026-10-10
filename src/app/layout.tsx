import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "XPremium | Gestão patrimonial",
  description: "Acompanhe patrimônio e investimentos com sua assessoria private.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
