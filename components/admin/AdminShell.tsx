import Link from "next/link";
import { logout } from "@/app/admin/login/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { getAdminContext } from "@/lib/data/admin";
import { themeStyle } from "@/lib/theme";

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  roles: string[];
};

const items: NavItem[] = [
  {
    href: "/admin",
    label: "Visão geral",
    shortLabel: "VG",
    roles: ["owner", "manager", "reservations", "marketing", "technical_admin"],
  },
  {
    href: "/admin/leads",
    label: "Leads",
    shortLabel: "LD",
    roles: ["owner", "manager", "reservations", "technical_admin"],
  },
  {
    href: "/admin/acomodacoes",
    label: "Acomodações",
    shortLabel: "AC",
    roles: ["owner", "manager", "marketing", "technical_admin"],
  },
  {
    href: "/admin/galeria",
    label: "Galeria",
    shortLabel: "GA",
    roles: ["owner", "manager", "marketing", "technical_admin"],
  },
  {
    href: "/admin/conteudo",
    label: "Conteúdo",
    shortLabel: "CO",
    roles: ["owner", "manager", "marketing", "technical_admin"],
  },
  {
    href: "/admin/avaliacoes",
    label: "Avaliações",
    shortLabel: "AV",
    roles: ["owner", "manager", "marketing", "technical_admin"],
  },
  {
    href: "/admin/identidade",
    label: "Identidade",
    shortLabel: "ID",
    roles: ["owner", "manager", "marketing", "technical_admin"],
  },
  {
    href: "/admin/integracoes",
    label: "Integrações",
    shortLabel: "IN",
    roles: ["owner", "technical_admin"],
  },
  {
    href: "/admin/usuarios",
    label: "Usuários",
    shortLabel: "US",
    roles: ["owner", "technical_admin"],
  },
  {
    href: "/admin/configuracoes",
    label: "Configurações",
    shortLabel: "CF",
    roles: ["owner", "manager", "technical_admin"],
  },
];

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  manager: "Gerente",
  reservations: "Reservas",
  marketing: "Marketing",
  technical_admin: "Administrador técnico",
};

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const { property, theme, membership } = await getAdminContext();
  const visibleItems = items
    .filter((item) => item.roles.includes(membership.role))
    .map(({ href, label, shortLabel }) => ({ href, label, shortLabel }));

  const displayName =
    membership.display_name?.trim() ||
    membership.email?.split("@")[0] ||
    "Usuário";

  return (
    <div className="admin-shell admin-shell-v2" style={themeStyle(theme)}>
      <aside className="admin-sidebar">
        <div className="admin-brand">
          {theme.logoLightUrl ? (
            <img
              className="admin-brand-logo"
              src={theme.logoLightUrl}
              alt={property.name}
            />
          ) : (
            <strong>{property.name}</strong>
          )}
          <span>Hospedagens</span>
        </div>

        <div className="admin-sidebar-section-label">Painel</div>
        <AdminNav items={visibleItems} />

        <div className="admin-sidebar-footer">
          <Link className="admin-view-site" href="/" target="_blank">
            <span className="admin-nav-mark" aria-hidden="true">↗</span>
            <span>Ver site</span>
          </Link>

          <form action={logout}>
            <button className="admin-logout" type="submit">
              <span className="admin-nav-mark" aria-hidden="true">↪</span>
              <span>Sair</span>
            </button>
          </form>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar-property">
            <span>Hospedagem ativa</span>
            <strong>{property.name}</strong>
          </div>

          <div className="admin-topbar-actions">
            <Link className="admin-topbar-site" href="/" target="_blank">
              Ver site ↗
            </Link>

            <div className="admin-profile-chip">
              <span className="admin-profile-avatar" aria-hidden="true">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
              <span className="admin-profile-copy">
                <strong>{displayName}</strong>
                <small>{roleLabels[membership.role] ?? membership.role}</small>
              </span>
            </div>
          </div>
        </header>

        <section className="admin-content">{children}</section>
      </div>
    </div>
  );
}
