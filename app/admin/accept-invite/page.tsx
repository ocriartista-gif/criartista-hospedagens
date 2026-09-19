"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AcceptInvitePage() {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email");

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (hash.get("error_code") === "otp_expired") {
      setMessage(
        "O link anterior foi consumido ou expirou. Use um novo código de acesso para ativar a conta."
      );
    }

    const prepareInviteSession = async () => {
      // A ativação sempre começa sem sessão para impedir que a senha ou o
      // perfil de outro usuário já logado sejam reutilizados por engano.
      await supabase.auth.signOut();
      setReady(true);
    };

    prepareInviteSession();
  }, []);

  async function resendCode() {
    if (!email.trim()) {
      setMessage("Informe o e-mail do usuário para receber um novo código.");
      return;
    }

    setSending(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false,
      },
    });

    setSending(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Novo código enviado. Consulte a caixa de entrada e o spam.");
  }

  async function activate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (!email.trim()) {
      setMessage("Informe o e-mail que recebeu o convite.");
      return;
    }

    if (!/^\d{6,10}$/.test(code)) {
      setMessage("Digite o código numérico recebido por e-mail.");
      return;
    }

    if (password.length < 8) {
      setMessage("Use uma senha com pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("As senhas não conferem.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    // Garante que o usuário autenticado seja exatamente o dono do código.
    await supabase.auth.signOut();

    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code,
      type: "email",
    });

    if (verifyError || !verifyData.user) {
      setMessage("Código inválido ou expirado. Solicite um novo código.");
      setSaving(false);
      return;
    }

    if (verifyData.user.email?.toLowerCase() !== email.trim().toLowerCase()) {
      await supabase.auth.signOut();
      setMessage("O código não corresponde ao e-mail informado.");
      setSaving(false);
      return;
    }

    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    });

    if (passwordError) {
      setMessage(passwordError.message);
      setSaving(false);
      return;
    }

    setDone(true);
    setSaving(false);

    window.setTimeout(() => {
      window.location.href = "/admin";
    }, 500);
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <span className="eyebrow">Criartista Hospedagens</span>

        {!ready ? (
          <>
            <h1>Preparando acesso</h1>
            <p>Encerrando outras sessões antes de ativar o novo usuário.</p>
          </>
        ) : done ? (
          <>
            <h1>Acesso ativado</h1>
            <p>Entrando no painel...</p>
          </>
        ) : (
          <>
            <h1>Ativar acesso</h1>
            <p>Digite o e-mail, o código recebido e escolha sua senha.</p>

            <form className="login-form" onSubmit={activate}>
              <label>
                E-mail
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                />
              </label>

              <label>
                Código de acesso
                <input
                  name="code"
                  inputMode="numeric"
                  pattern="[0-9]{6,10}"
                  maxLength={10}
                  required
                  autoComplete="one-time-code"
                  placeholder="00000000"
                />
              </label>

              <button
                className="button button-secondary"
                type="button"
                onClick={resendCode}
                disabled={sending}
              >
                {sending ? "Enviando..." : "Reenviar código"}
              </button>

              <label>
                Nova senha
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </label>

              <label>
                Confirmar senha
                <input
                  name="confirmPassword"
                  type="password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </label>

              {message && <p className="form-error">{message}</p>}

              <button
                className="button button-primary"
                type="submit"
                disabled={saving}
              >
                {saving ? "Ativando..." : "Ativar acesso"}
              </button>
            </form>

            <a className="text-link" href="/admin/login">
              Já tenho senha · Ir para o login
            </a>
          </>
        )}
      </section>
    </main>
  );
}
