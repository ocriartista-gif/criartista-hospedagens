import Link from "next/link";
import { isDarkColor, resolvePaletteColor } from "@/lib/theme";
import type { Property } from "@/types";

export function SiteHeader({ property }: { property: Property }) {
  const headerBackground = resolvePaletteColor(
    property.theme,
    property.theme.headerSurfaceKey
  );
  const darkSurface = isDarkColor(headerBackground);

  const logoUrl = darkSurface
    ? property.theme.logoLightUrl ?? undefined
    : property.theme.logoMainUrl ?? property.theme.logoLightUrl;

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        {logoUrl ? (
          <img
            className="site-brand-logo"
            src={logoUrl}
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
