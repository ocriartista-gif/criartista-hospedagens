import Link from "next/link";
import { sendRecoveryEmail } from "./actions";

export default async function ForgotPassword({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  return <main className="account-page"><section className="admin-panel account-card"><h1>Recuperar senha</h1><p>Informe seu e-mail para receber um link de recuperação.</p>
    {sent && <p role="status" className="feedback-box feedback-success">Se a conta existir, enviaremos o link. Confira também o spam.</p>}
    {error && <p role="alert" className="feedback-box feedback-error">{error}</p>}
    <form action={sendRecoveryEmail} className="profile-form"><label>E-mail<input name="email" type="email" required autoComplete="email" /></label><button className="button button-primary">Enviar link</button></form><p><Link href="/admin/login">Voltar ao login</Link></p>
  </section></main>;
}
