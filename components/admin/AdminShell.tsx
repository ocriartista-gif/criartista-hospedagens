import Link from "next/link";
import { logout } from "@/app/admin/login/actions";
import { getAdminContext } from "@/lib/data/admin";
import { themeStyle } from "@/lib/theme";

const items = [
  ["/admin", "Visão geral"],
  ["/admin/leads", "Leads"],
  ["/admin/acomodacoes", "Acomodações"],
  ["/admin/galeria", "Galeria"],
  ["/admin/conteudo", "Conteúdo"],
  ["/admin/avaliacoes", "Avaliações"],
  ["/admin/identidade", "Identidade"],
  ["/admin/integracoes", "Integrações"],
  ["/admin/usuarios", "Usuários"],
  ["/admin/configuracoes", "Configurações"],
];

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const { property } = await getAdminContext();

  const theme = {
    primary: property.id ? "#183B2A" : "#183B2A",
    secondary: "#8CA67C",
    accent: "#C97863",
    background: "#F6F2EA",
    text: "#302C2F",
    headingFont: "Georgia",
    eyebrowFont: "Arial",
    bodyFont: "Arial",
    eyebrowTransform: "uppercase" as const,
    eyebrowWeight: "600" as const,
    eyebrowSpacing: "wide" as const,
  };

  return (
    <div className="admin-shell" style={themeStyle(theme)}>
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <strong>{property.name}</strong>
          <span>Painel administrativo</span>
        </div>

        <nav>
          {items.map(([href, label]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>

        <Link className="admin-view-site" href="/">↗ Ver site</Link>

        <form action={logout}>
          <button className="admin-logout" type="submit">Sair</button>
        </form>
      </aside>

      <section className="admin-content">{children}</section>
    </div>
  );
}
