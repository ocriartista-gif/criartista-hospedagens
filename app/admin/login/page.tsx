import { login } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="login-page">
      <section className="login-card">
        <span className="eyebrow">Criartista Hospedagens</span>
        <h1>Acessar painel</h1>
        <p>Entre com o usuário autorizado para administrar esta hospedagem.</p>

        <form action={login} className="login-form">
          <label>
            E-mail
            <input type="email" name="email" required autoComplete="email" />
          </label>
          <label>
            Senha
            <input type="password" name="password" required autoComplete="current-password" />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-primary" type="submit">Entrar</button>
        </form>

        <a className="text-link" href="/">← Voltar ao site</a>
      </section>
    </main>
  );
}
