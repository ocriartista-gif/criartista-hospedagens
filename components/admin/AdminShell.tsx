import Link from "next/link";
import { logout } from "@/app/admin/login/actions";
import { getAdminContext } from "@/lib/data/admin";
import { themeStyle } from "@/lib/theme";

type NavItem = {
  href: string;
  label: string;
  roles: string[];
};

const items: NavItem[] = [
  {
    href: "/admin",
    label: "Visão geral",
    roles: ["owner", "manager", "reservations", "marketing", "technical_admin"],
  },
  {
    href: "/admin/leads",
    label: "Leads",
    roles: ["owner", "manager", "reservations", "technical_admin"],
  },
  {
    href: "/admin/acomodacoes",
    label: "Acomodações",
    roles: ["owner", "manager", "marketing", "technical_admin"],
  },
  {
    href: "/admin/galeria",
    label: "Galeria",
    roles: ["owner", "manager", "marketing", "technical_admin"],
  },
  {
    href: "/admin/conteudo",
    label: "Conteúdo",
    roles: ["owner", "manager", "marketing", "technical_admin"],
  },
  {
    href: "/admin/avaliacoes",
    label: "Avaliações",
    roles: ["owner", "manager", "marketing", "technical_admin"],
  },
  {
    href: "/admin/identidade",
    label: "Identidade",
    roles: ["owner", "manager", "marketing", "technical_admin"],
  },
  {
    href: "/admin/integracoes",
    label: "Integrações",
    roles: ["owner", "technical_admin"],
  },
  {
    href: "/admin/usuarios",
    label: "Usuários",
    roles: ["owner", "technical_admin"],
  },
  {
    href: "/admin/configuracoes",
    label: "Configurações",
    roles: ["owner", "manager", "technical_admin"],
  },
];

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const { property, theme, membership } = await getAdminContext();
  const visibleItems = items.filter((item) =>
    item.roles.includes(membership.role)
  );

  return (
    <div className="admin-shell" style={themeStyle(theme)}>
      <aside className="admin-sidebar">
        <div className="admin-brand">
          {theme.logoLightUrl ? (
            <img className="admin-brand-logo" src={theme.logoLightUrl} alt={property.name} />
          ) : (
            <strong>{property.name}</strong>
          )}
          <span>Painel administrativo</span>
        </div>

        <nav>
          {visibleItems.map(({ href, label }) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>

        <Link className="admin-view-site" href="/">
          ↗ Ver site
        </Link>

        <form action={logout}>
          <button className="admin-logout" type="submit">
            Sair
          </button>
        </form>
      </aside>

      <section className="admin-content">{children}</section>
    </div>
  );
}
