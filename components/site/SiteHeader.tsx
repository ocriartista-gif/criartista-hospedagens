import Link from "next/link";
import type { Property } from "@/types";

export function SiteHeader({ property }: { property: Property }) {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        {property.theme.logoMainUrl ? (
          <img
            className="site-brand-logo"
            src={property.theme.logoMainUrl}
            alt={property.name}
          />
        ) : (
          <>
            <strong>{property.name}</strong>
            <span>Pousada Boutique</span>
          </>
        )}
      </Link>
      <nav>
        <Link href="/acomodacoes">Acomodações</Link>
        <a href="/#experiencias">Experiências</a>
        <a href="/#localizacao">Localização</a>
      </nav>
      <a className="button button-primary" href="/#reserva">
        Consultar disponibilidade
      </a>
    </header>
  );
}
