"use client";

import { useEffect } from "react";
import { showCriartistaHelp } from "@/lib/admin-help";

export function OnboardingHelp({ message }: { message: string }) {
  useEffect(() => {
    showCriartistaHelp({
      eyebrow: "Publicação",
      title: "Vamos completar o que falta",
      body: message,
      details: [
        "Preencha nome, WhatsApp e endereço.",
        "Adicione título e foto principal em Conteúdo.",
        "Publique uma acomodação com pelo menos uma foto.",
      ],
      actions: [
        { href: "/admin/conteudo", label: "Abrir conteúdo" },
        { href: "/admin/acomodacoes", label: "Abrir acomodações" },
      ],
      tone: "warning",
    });
  }, [message]);
  return null;
}
