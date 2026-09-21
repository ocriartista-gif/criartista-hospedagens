"use client";

import { useState } from "react";

export function PasswordField() {
  const [visible, setVisible] = useState(false);

  return (
    <label>
      Senha
      <span className="criartista-password-field">
        <input
          type={visible ? "text" : "password"}
          name="password"
          required
          autoComplete="current-password"
          placeholder="Sua senha"
        />
        <button
          type="button"
          className="criartista-password-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-pressed={visible}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
            focusable="false"
          >
            {visible ? (
              <>
                <path
                  d="M3 3l18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M10.6 10.6a2 2 0 002.8 2.8M9.4 4.4A10.7 10.7 0 0112 4c5.5 0 9 5.5 9 5.5a16.7 16.7 0 01-3.1 3.7M6.2 6.2C4.2 7.5 3 9.5 3 9.5S6.5 15 12 15c1 0 1.9-.2 2.7-.4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            ) : (
              <>
                <path
                  d="M3 12s3.5-5.5 9-5.5S21 12 21 12s-3.5 5.5-9 5.5S3 12 3 12z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="2.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </>
            )}
          </svg>
          <span>{visible ? "Ocultar" : "Mostrar"}</span>
        </button>
      </span>
    </label>
  );
}
