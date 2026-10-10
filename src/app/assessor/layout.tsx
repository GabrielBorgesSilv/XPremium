import { sairAction } from "@/app/login/actions";
import { exigirPapel, papelAtende } from "@/modules/usuarios";
import { WorkspaceShell } from "@/shared/ui/workspace-shell";

export default async function AssessorLayout({ children }: { children: React.ReactNode }) {
  // Sem login → /login?voltar=...; sem o papel → área do próprio usuário.
  const usuario = await exigirPapel("assessor");
  return (
    <WorkspaceShell
      role="assessor"
      user={{ name: usuario.nome }}
      canViewAdvisor={papelAtende(usuario.papel, "assessor")}
      signOutAction={sairAction}
    >
      {children}
    </WorkspaceShell>
  );
}
