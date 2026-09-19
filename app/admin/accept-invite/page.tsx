"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AcceptInvitePage() {
  const [state, setState] = useState<
    "checking" | "ready" | "saving" | "error" | "done"
  >("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (session) {
        setState("ready");
        return;
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (nextSession && active) {
          setState("ready");
        }
      });

      window.setTimeout(async () => {
        const {
          data: { session: delayedSession },
        } = await supabase.auth.getSession();

        if (!active) return;

        if (delayedSession) {
          setState("ready");
        } else {
          setMessage(
            "O convite é inválido, expirou ou ainda não foi processado. Peça um novo convite ao administrador."
          );
          setState("error");
        }
      }, 1800);

      return () => subscription.unsubscribe();
    };

    check();

    return () => {
      active = false;
    };
  }, []);

  async function setPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (password.length < 8) {
      setMessage("Use uma senha com pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("As senhas não conferem.");
      return;
    }

    setState("saving");
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
      setState("ready");
      return;
    }

    setState("done");
    window.setTimeout(() => {
      window.location.href = "/admin";
    }, 500);
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <span className="eyebrow">Criartista Hospedagens</span>

        {state === "checking" && (
          <>
            <h1>Validando convite</h1>
            <p>Estamos preparando seu acesso.</p>
          </>
        )}

        {state === "error" && (
          <>
            <h1>Não foi possível ativar</h1>
            <p>{message}</p>
            <a className="button button-secondary" href="/admin/login">
              Ir para o login
            </a>
          </>
        )}

        {["ready", "saving"].includes(state) && (
          <>
            <h1>Defina sua senha</h1>
            <p>
              Seu acesso foi reconhecido. Crie a senha que você usará no
              painel administrativo.
            </p>

            <form className="login-form" onSubmit={setPassword}>
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
                disabled={state === "saving"}
              >
                {state === "saving" ? "Salvando..." : "Ativar acesso"}
              </button>
            </form>
          </>
        )}

        {state === "done" && (
          <>
            <h1>Acesso ativado</h1>
            <p>Entrando no painel...</p>
          </>
        )}
      </section>
    </main>
  );
}
