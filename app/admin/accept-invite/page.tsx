"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AcceptInvitePage() {
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
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
        "O link anterior foi consumido ou expirou. Use um novo código de 6 dígitos para ativar o acesso."
      );
    }

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setHasSession(Boolean(session));
      setChecking(false);
    };

    checkSession();
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

    if (!hasSession && !email.trim()) {
      setMessage("Informe o e-mail que recebeu o convite.");
      return;
    }

    if (!hasSession && !/^\d{6}$/.test(code)) {
      setMessage("Digite o código de 6 dígitos recebido por e-mail.");
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

    if (!hasSession) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code,
        type: "email",
      });

      if (verifyError) {
        setMessage("Código inválido ou expirado. Solicite um novo código.");
        setSaving(false);
        return;
      }
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

        {checking ? (
          <>
            <h1>Preparando acesso</h1>
            <p>Verificando sua sessão.</p>
          </>
        ) : done ? (
          <>
            <h1>Acesso ativado</h1>
            <p>Entrando no painel...</p>
          </>
        ) : (
          <>
            <h1>Ativar acesso</h1>
            <p>
              {hasSession
                ? "Seu e-mail já foi confirmado. Defina sua senha para concluir."
                : "Digite o e-mail, o código recebido e escolha sua senha."}
            </p>

            <form className="login-form" onSubmit={activate}>
              {!hasSession && (
                <>
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
                    Código de 6 dígitos
                    <input
                      name="code"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      autoComplete="one-time-code"
                      placeholder="000000"
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
                </>
              )}

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
