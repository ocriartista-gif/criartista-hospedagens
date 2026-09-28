import Link from "next/link";
import { logout } from "@/app/admin/login/actions";
import { AdminIcon, AdminNav, type AdminIconName } from "@/components/admin/AdminNav";
import { CriartistaAssistant } from "@/components/admin/CriartistaAssistant";
import { getAdminContext } from "@/lib/data/admin";
import { isDarkColor, themeStyle } from "@/lib/theme";
import { selectProperty } from "@/app/admin/(protected)/trocar-hospedagem/actions";

type NavItem = {
  href: string;
  label: string;
  icon: AdminIconName;
  roles: string[];
};

const items: NavItem[] = [
  {
    href: "/admin",
    label: "Visão geral",
    icon: "overview",
    roles: ["owner", "manager", "reservations", "marketing", "technical_admin"],
  },
  {
    href: "/admin/leads",
    label: "Leads",
    icon: "leads",
    roles: ["owner", "manager", "reservations", "technical_admin"],
  },
  {
    href: "/admin/acomodacoes",
    label: "Acomodações",
    icon: "accommodations",
    roles: ["owner", "manager", "marketing", "technical_admin"],
  },
  {
    href: "/admin/galeria",
    label: "Galeria",
    icon: "gallery",
    roles: ["owner", "manager", "marketing", "technical_admin"],
  },
  {
    href: "/admin/conteudo",
    label: "Conteúdo",
    icon: "content",
    roles: ["owner", "manager", "marketing", "technical_admin"],
  },
  {
    href: "/admin/avaliacoes",
    label: "Avaliações",
    icon: "reviews",
    roles: ["owner", "manager", "marketing", "technical_admin"],
  },
  {
    href: "/admin/identidade",
    label: "Identidade",
    icon: "identity",
    roles: ["owner", "manager", "marketing", "technical_admin"],
  },
  {
    href: "/admin/integracoes",
    label: "Integrações",
    icon: "integrations",
    roles: ["owner", "technical_admin"],
  },
  {
    href: "/admin/dominio",
    label: "Domínio",
    icon: "external",
    roles: ["owner"],
  },
  {
    href: "/admin/usuarios",
    label: "Usuários",
    icon: "users",
    roles: ["owner", "technical_admin"],
  },
  {
    href: "/admin/configuracoes",
    label: "Configurações",
    icon: "settings",
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
  const { property, theme, membership, memberships, supabase, userId } = await getAdminContext();
  const { data: profile } = await supabase.from("profiles").select("display_name, avatar_path").eq("user_id", userId).maybeSingle();
  const { data: availableProperties } = memberships.length > 1
    ? await supabase.from("properties").select("id, name").in("id", memberships.map((item) => item.property_id))
    : { data: [] as Array<{ id: string; name: string }> };
  const { data: publicDomain } = await supabase.from("property_domains")
    .select("domain").eq("property_id", property.id).eq("status", "verified")
    .eq("verification_status", "verified").order("is_primary", { ascending: false }).limit(1).maybeSingle();
  const siteHref = publicDomain ? `https://${publicDomain.domain}` : "/";
  const visibleItems = items
    .filter((item) => item.roles.includes(membership.role))
    .map(({ href, label, icon }) => ({ href, label, icon }));
  if (property.status === "draft" && membership.role === "owner") {
    visibleItems.unshift({ href: "/admin/onboarding", label: "Primeiros passos", icon: "overview" });
  }

  const displayName =
    profile?.display_name?.trim() || membership.display_name?.trim() ||
    membership.email?.split("@")[0] ||
    "Usuário";

  const sidebarUsesDarkSurface = isDarkColor(theme.primary);
  const adminLogoUrl = sidebarUsesDarkSurface
    ? theme.logoLightUrl || theme.logoMainUrl
    : theme.logoMainUrl || theme.logoLightUrl;

  return (
    <div className="admin-shell admin-shell-v2" style={themeStyle(theme)}>
      <aside className="admin-sidebar">
        <div className="admin-brand">
          {adminLogoUrl ? (
            <img
              className="admin-brand-logo"
              src={adminLogoUrl}
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
          <Link className="admin-view-site" href={siteHref} target="_blank">
            <AdminIcon name="external" />
            <span>Ver site</span>
          </Link>

          <form action={logout}>
            <button className="admin-logout" type="submit">
              <AdminIcon name="logout" />
              <span>Sair</span>
            </button>
          </form>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          {memberships.length > 1 ? (
            <form action={selectProperty} className="admin-property-switcher">
              <label htmlFor="active-property">Hospedagem ativa</label>
              <select id="active-property" name="propertyId" defaultValue={property.id}>
                {memberships.map((item) => <option key={item.property_id} value={item.property_id}>{availableProperties?.find((entry) => entry.id === item.property_id)?.name ?? `Hospedagem ${item.property_id.slice(0, 8)}`}</option>)}
              </select>
              <button type="submit">Trocar</button>
            </form>
          ) : <div className="admin-topbar-property"><span>Hospedagem ativa</span><strong>{property.name}</strong></div>}

          <div className="admin-topbar-actions">
            <Link className="admin-topbar-site" href={siteHref} target="_blank">
              Ver site ↗
            </Link>

            <Link className="admin-profile-chip" href="/admin/perfil" aria-label="Editar meu perfil">
              <span className="admin-profile-avatar" aria-hidden="true">
                {profile?.avatar_path ? <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-avatars/${profile.avatar_path}`} alt="" /> : displayName.slice(0, 1).toUpperCase()}
              </span>
              <span className="admin-profile-copy">
                <strong>{displayName}</strong>
                <small>{roleLabels[membership.role] ?? membership.role}</small>
              </span>
            </Link>
          </div>
        </header>

        <section className="admin-content">{children}</section>
        <CriartistaAssistant />
      </div>
    </div>
  );
}
