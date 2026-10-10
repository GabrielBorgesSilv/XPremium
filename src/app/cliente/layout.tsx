import { sairAction } from "@/app/login/actions";
import { exigirPapel, papelAtende } from "@/modules/usuarios";
import { WorkspaceShell } from "@/shared/ui/workspace-shell";

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  // Sem login → /login?voltar=...; sem o papel → área do próprio usuário.
  const usuario = await exigirPapel("usuario");
  return (
    <WorkspaceShell
      role="cliente"
      user={{ name: usuario.nome }}
      canViewAdvisor={papelAtende(usuario.papel, "assessor")}
      signOutAction={sairAction}
    >
      {children}
    </WorkspaceShell>
  );
}
