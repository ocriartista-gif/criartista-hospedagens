"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [existing, setExisting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    if (!existing && (password.length < 10 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password))) {
      setMessage("Use 10 caracteres ou mais, com maiúscula, minúscula, número e símbolo.");
      setBusy(false);
      return;
    }
    const client = createClient();
    const { data, error } = existing
      ? await client.auth.signInWithPassword({ email, password })
      : await client.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/contratar/checkout` },
        });
    setBusy(false);
    if (error) { setMessage(existing ? "E-mail ou senha inválidos." : "Não foi possível criar sua conta. Confira os dados ou entre com sua conta existente."); return; }
    if (data.session) router.push("/contratar/checkout");
    else setMessage("Confira seu e-mail para confirmar a conta. Depois, continue a contratação.");
  }

  return <main className="account-page"><section className="admin-panel account-card">
    <span className="eyebrow">O Criartista Hospedagens</span><h1>{existing ? "Entrar na sua conta" : "Comece pela sua conta"}</h1>
    <p>{existing ? "Entre para continuar a contratação." : "Após confirmar seu e-mail, você poderá contratar a plataforma e configurar seu site."}</p>
    <form onSubmit={submit} className="profile-form">
      <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
      <label>Senha<input name="password" type="password" minLength={existing ? 1 : 10} required autoComplete={existing ? "current-password" : "new-password"} /></label>
      <button className="button button-primary" disabled={busy}>{busy ? "Aguarde..." : existing ? "Entrar e continuar" : "Criar minha conta"}</button>
    </form>
    {message && <p role="status" className="feedback-box">{message}</p>}
    <p><button type="button" className="button button-secondary" onClick={() => { setExisting(!existing); setMessage(""); }}>{existing ? "Criar uma conta" : "Já tenho conta"}</button></p>
  </section></main>;
}
