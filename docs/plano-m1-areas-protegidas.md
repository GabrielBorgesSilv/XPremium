# Plano: áreas protegidas, usuário real no menu e botão de sair (M1 × UI)

- **Para:** elvisjuniorr (dono do protótipo de UI)
- **Quem propõe:** Márcio (M1)
- **Data:** 10/10/2026
- **Depende de:** PR #7 (contrato de autenticação: `exigirPapel`, `obterUsuarioAtual`, `papelAtende`) e do PR do login (traz a `sairAction`).

## Situação hoje

- As áreas abrem sem login: `/cliente/*` e `/assessor/*`, inclusive as telas do M4 em `/assessor/ativos`.
- O `WorkspaceShell` (`src/shared/ui/workspace-shell.tsx`) mostra nomes fixos ("Mariana Costa", "Ana Martins") e o botão "Visualizar cliente/assessor" para todos.
- Não existe botão de sair.
- A home `/` leva direto às áreas pelos botões "Sou assessor" e "Sou cliente".

## Mudanças propostas

### 1. Proteger as áreas pelos layouts

```tsx
// src/app/assessor/layout.tsx
import { sairAction } from "@/app/login/actions";
import { exigirPapel, papelAtende } from "@/modules/usuarios";
import { WorkspaceShell } from "@/shared/ui/workspace-shell";

export default async function AssessorLayout({ children }: { children: React.ReactNode }) {
  const usuario = await exigirPapel("assessor"); // sem login → /login?voltar=...; usuario comum → /cliente
  return (
    <WorkspaceShell
      role="assessor"
      usuario={{ nome: usuario.nome, papel: usuario.papel }}
      podeVerAssessor={papelAtende(usuario.papel, "assessor")}
      acaoSair={sairAction}
    >
      {children}
    </WorkspaceShell>
  );
}
```

- `cliente/layout.tsx`: igual, com `exigirPapel("usuario")`, que aceita qualquer pessoa logada.
- **Regra para quando houver dados reais:** o Next não roda o layout de novo quando a pessoa navega entre páginas. Toda página, Server Action ou API que ler dados também precisa chamar `exigirPapel` ou `autorizarApi` (`CLAUDE.md`). Enquanto as telas usam dados fictícios, o layout basta.

### 2. `WorkspaceShell` com o usuário real

Continua `"use client"` e recebe três props novas:

- `usuario: { nome, papel }`: substitui os nomes fixos. Iniciais do avatar a partir do nome ("Carla Rocha" → "CR"); texto abaixo do nome conforme o papel ("Assessor(a) private" / "Cliente private").
- `podeVerAssessor`: o botão "Visualizar assessor" só aparece se for `true`. "Visualizar cliente" continua para assessor e admin.
- `acaoSair`: botão `<form action={acaoSair}><button>Sair</button></form>`. Chega como prop porque `src/shared` não pode importar `src/app`. Depois de sair, vai para `/login`.

### 3. Home `/`

- Botões "Sou assessor/cliente": com as áreas protegidas, quem não está logado cai no `/login`. Opções: (a) apontar os dois para `/login`; (b) manter, e o redirecionamento faz o resto; (c) a home vira o login.
- Slogan: trocar para **"Estratégias exclusivas, resultados de alto nível."** na home e no `prototipo.html` (a `/login` já usa; registrado em `docs/context.md`).

## Quem faz o quê

- **Opção A:** o Márcio faz tudo numa branch `feature/m1-areas-protegidas`, e o Elvis revisa o PR antes do merge.
- **Opção B:** o Elvis aplica nos arquivos dele seguindo este plano, e o Márcio revisa.

Em qualquer das duas, o PR só entra depois do PR do login (`sairAction`).

## Impacto para a equipe

- **Gabriel (M4):** para ver `/assessor/ativos`, entrar com `assessor@hubxp.test` (senha = `SENHA_DEMO` do `.env`; padrão `demo-hubxp`).
- **Todos:** a demo começa pelo `/login`; logins no README.

## Como testar

| Cenário | Esperado |
|---|---|
| Abrir `/assessor/ativos` sem login | Vai para `/login?voltar=/assessor/ativos` e, depois de entrar como assessor, volta para ela |
| `usuario1` abrindo `/assessor` | Vai para `/cliente` |
| `assessor` abrindo `/cliente` | Abre |
| Menu lateral | Nome real e iniciais; sem "Visualizar assessor" para `usuario1` |
| Sair | Volta para `/login`; o botão "voltar" do navegador cai no login de novo |
| Celular (menu ☰) | Botão de sair acessível |

## Perguntas para o Elvis

1. Onde fica o botão de sair: rodapé da barra lateral (junto do nome) ou menu no avatar do topo?
2. Texto abaixo do nome para o `admin` (hoje só há assessor e cliente)?
3. Home `/`: opção (a), (b) ou (c)?
4. Prefere a opção A ou a B?

## Andamento

- 10/10/2026: Márcio pediu para seguir com o plano (opção A); as respostas às perguntas acima ficam registradas aqui conforme forem definidas.
