import estilos from "./login.module.css";

/** Lado esquerdo das telas de acesso (login, recuperar e redefinir senha). */
export function PainelMarca() {
  return (
    <section className={estilos.marca}>
      <div className={estilos.logo}>
        <b>XP</b>
        <span>XPremium</span>
      </div>
      <div className={estilos.chamada}>
        <small>ASSESSORIA PRIVATE · XP INC.</small>
        <h1>
          Estratégias exclusivas,
          <br />
          <em>resultados de alto nível.</em>
        </h1>
        <p>Uma experiência próxima e completa para acompanhar seus investimentos ao lado da sua assessoria.</p>
      </div>
      <div className={estilos.orbita} aria-hidden="true" />
    </section>
  );
}
