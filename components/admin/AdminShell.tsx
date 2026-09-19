import Link from "next/link";
import { property } from "@/lib/mock-data";
import { themeStyle } from "@/lib/theme";
import { logout } from "@/app/admin/login/actions";

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

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell" style={themeStyle(property.theme)}>
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
