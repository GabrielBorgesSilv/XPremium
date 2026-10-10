import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Hub XP",
  description: "Hub de investimentos para clientes e assessores",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
