import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resetPassword } from "./actions";

export default async function ResetPassword({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const { error, success } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !success) redirect("/admin/esqueci-senha?error=Link%20inv%C3%A1lido%20ou%20expirado.");
  return <main className="account-page"><section className="admin-panel account-card"><h1>Nova senha</h1>
    {success ? <><p role="status" className="feedback-box feedback-success">Senha atualizada com sucesso.</p><Link href="/admin/login">Entrar no painel</Link></> : <>
    <p>Use pelo menos 10 caracteres, com maiúscula, minúscula, número e símbolo.</p>
    {error && <p role="alert" className="feedback-box feedback-error">{error}</p>}
    <form action={resetPassword} className="profile-form"><label>Nova senha<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label><label>Confirme a senha<input name="confirmPassword" type="password" autoComplete="new-password" minLength={10} required /></label><button className="button button-primary">Salvar senha</button></form></>}
  </section></main>;
}
