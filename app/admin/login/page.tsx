import { login } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="criartista-login-page">
      <section className="criartista-login-shell">
        <div className="criartista-login-brand">
          <div className="criartista-login-brand-lockup">
            <img
              src="/brand/criartista-assistant-mark.png"
              alt=""
              aria-hidden="true"
            />
            <div>
              <strong>O CRIARTISTA</strong>
              <span>HOSPEDAGENS</span>
            </div>
          </div>

          <div className="criartista-login-brand-copy">
            <span className="criartista-login-kicker">Gestão da sua presença digital</span>
            <h1>Seu negócio por trás de uma experiência simples.</h1>
            <p>
              Administre conteúdo, acomodações, leads e identidade da hospedagem
              em um único lugar.
            </p>
          </div>

          <small>Uma solução O Criartista.</small>
        </div>

        <div className="criartista-login-panel">
          <div className="criartista-login-panel-inner">
            <span className="criartista-login-eyebrow">Área administrativa</span>
            <h2>Acessar painel</h2>
            <p className="criartista-login-intro">
              Entre com o usuário autorizado para administrar esta hospedagem.
            </p>

            <form action={login} className="criartista-login-form">
              <label>
                E-mail
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                />
              </label>

              <label>
                Senha
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="Sua senha"
                />
              </label>

              {error && <p className="form-error">{error}</p>}

              <button className="criartista-login-submit" type="submit">
                Entrar
              </button>
            </form>

            <a className="criartista-login-back" href="/">
              ← Voltar ao site
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
