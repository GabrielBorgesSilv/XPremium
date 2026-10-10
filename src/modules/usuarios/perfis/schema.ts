import { z } from "zod";

/** DTOs de entrada e saída: perfis de usuário e permissões. */

/**
 * Papel (role) da conta. Um por conta, em hierarquia: cada papel herda o acesso
 * dos anteriores (usuario < assessor < admin).
 */
export const PapelSchema = z.enum(["usuario", "assessor", "admin"]);

export type Papel = z.infer<typeof PapelSchema>;

/** Usuário autenticado, como os outros módulos o enxergam (sem dados de credencial). */
export const UsuarioSchema = z.object({
  id: z.string(),
  nome: z.string(),
  email: z.email(),
  papel: PapelSchema,
});

export type Usuario = z.infer<typeof UsuarioSchema>;
