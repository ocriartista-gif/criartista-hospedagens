"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ASSISTANT_MARK_SRC = "data:image/png;base64,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";

type HelpContext = {
  eyebrow: string;
  title: string;
  body: string;
  actions?: Array<{ href: string; label: string }>;
};

const contexts: Array<{ match: (path: string) => boolean; help: HelpContext }> = [
  {
    match: (path) => path === "/admin",
    help: {
      eyebrow: "Seu painel",
      title: "Visão geral",
      body: "Use esta tela para identificar rapidamente leads, retornos vencidos e acomodações publicadas.",
      actions: [{ href: "/admin/leads", label: "Abrir CRM" }],
    },
  },
  {
    match: (path) => path.startsWith("/admin/leads"),
    help: {
      eyebrow: "Rotina comercial",
      title: "Por onde começar?",
      body: "A fila já considera prioridade, follow-ups e contatos agendados. Comece pelos primeiros itens e registre o próximo passo.",
    },
  },
  {
    match: (path) => path.startsWith("/admin/acomodacoes"),
    help: {
      eyebrow: "Hospedagem",
      title: "Acomodações",
      body: "Cadastre quartos, fotos e informações aqui. A ordem das fotos é definida dentro de cada acomodação, não na Galeria.",
      actions: [{ href: "/admin/galeria", label: "Abrir Galeria" }],
    },
  },
  {
    match: (path) => path.startsWith("/admin/galeria"),
    help: {
      eyebrow: "Biblioteca de mídia",
      title: "Onde usar cada foto?",
      body: "A Galeria organiza arquivos. Hero e Experiências ficam em Conteúdo, quartos em Acomodações e logos em Identidade.",
      actions: [
        { href: "/admin/conteudo", label: "Conteúdo" },
        { href: "/admin/acomodacoes", label: "Acomodações" },
      ],
    },
  },
  {
    match: (path) => path.startsWith("/admin/conteudo"),
    help: {
      eyebrow: "Site público",
      title: "Conteúdo",
      body: "Edite uma seção por vez. A estrutura de conversão permanece protegida enquanto textos e imagens podem ser atualizados.",
      actions: [{ href: "/", label: "Ver site" }],
    },
  },
  {
    match: (path) => path.startsWith("/admin/avaliacoes"),
    help: {
      eyebrow: "Prova social",
      title: "Avaliações",
      body: "Cadastre depoimentos, defina destaques e controle quais avaliações ficam publicadas no site.",
    },
  },
  {
    match: (path) => path.startsWith("/admin/identidade"),
    help: {
      eyebrow: "White-label",
      title: "Identidade da marca",
      body: "Logo, cores e tipografia do cliente vivem aqui. O próprio painel administrativo acompanha a cor principal e o logotipo cadastrados.",
      actions: [{ href: "/", label: "Ver resultado" }],
    },
  },
  {
    match: (path) => path.startsWith("/admin/integracoes"),
    help: {
      eyebrow: "Importante nesta versão",
      title: "Integrações",
      body: "WhatsApp e redes sociais já alimentam o site. Analytics, Pixel, GTM, Sheets, cookies e motores externos ainda salvam apenas a configuração.",
    },
  },
  {
    match: (path) => path.startsWith("/admin/usuarios"),
    help: {
      eyebrow: "Equipe",
      title: "Usuários e permissões",
      body: "Convide pessoas e escolha o perfil adequado. Cada função enxerga apenas as áreas que precisa operar.",
    },
  },
  {
    match: (path) => path.startsWith("/admin/configuracoes"),
    help: {
      eyebrow: "Dados da propriedade",
      title: "Configurações",
      body: "Informações salvas aqui são reutilizadas pelo site, como contato, endereço, horários e políticas da hospedagem.",
    },
  },
];

function contextFor(pathname: string) {
  return (
    contexts.find((item) => item.match(pathname))?.help ?? {
      eyebrow: "Ajuda",
      title: "Assistente Criartista",
      body: "Use este espaço para entender rapidamente como funciona cada área do painel.",
    }
  );
}

export function CriartistaAssistant() {
  const pathname = usePathname();
  const help = contextFor(pathname);
  const [open, setOpen] = useState(false);

  return (
    <div className={`criartista-assistant ${open ? "open" : ""}`}>
      {open && (
        <aside
          className="criartista-assistant-popover"
          aria-label="Assistente Criartista"
        >
          <div className="criartista-assistant-popover-head">
            <div className="criartista-assistant-mini-brand">
              <img
                src={ASSISTANT_MARK_SRC}
                alt=""
                aria-hidden="true"
              />
            </div>
            <div>
              <span>{help.eyebrow}</span>
              <strong>{help.title}</strong>
            </div>
            <button
              type="button"
              className="criartista-assistant-close"
              onClick={() => setOpen(false)}
              aria-label="Fechar ajuda"
            >
              ×
            </button>
          </div>

          <p>{help.body}</p>

          {help.actions?.length ? (
            <div className="criartista-assistant-actions">
              {help.actions.map((action) => (
                <Link
                  key={`${action.href}-${action.label}`}
                  href={action.href}
                  target={action.href === "/" ? "_blank" : undefined}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}

          <small>Assistente Criartista</small>
        </aside>
      )}

      <button
        type="button"
        className="criartista-assistant-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Fechar Assistente Criartista" : "Abrir Assistente Criartista"}
      >
        <img
          src={ASSISTANT_MARK_SRC}
          alt=""
          aria-hidden="true"
        />
        {!open && <span>Ajuda</span>}
      </button>
    </div>
  );
}
