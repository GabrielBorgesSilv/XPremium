import { WorkspaceShell } from "@/shared/ui/workspace-shell";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell role="cliente">{children}</WorkspaceShell>;
}
