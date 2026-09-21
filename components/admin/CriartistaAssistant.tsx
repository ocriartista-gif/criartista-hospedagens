"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
                src="/brand/criartista-assistant-mark.png"
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
          src="/brand/criartista-assistant-mark.png"
          alt=""
          aria-hidden="true"
        />
        {!open && <span>Ajuda</span>}
      </button>
    </div>
  );
}
