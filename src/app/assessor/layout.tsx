import { WorkspaceShell } from "@/shared/ui/workspace-shell";

export default function AssessorLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell role="assessor">{children}</WorkspaceShell>;
}
