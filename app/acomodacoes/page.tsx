import type { Metadata } from "next";
import { AccommodationCard } from "@/components/site/AccommodationCard";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getPublicAccommodations, getPublicSiteData } from "@/lib/data/public";
import { themeStyle } from "@/lib/theme";
import { isPlatformHost, requestHost } from "@/lib/property-host";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  if (isPlatformHost(await requestHost())) return { title: "Página não encontrada" };
  const { property, content } = await getPublicSiteData();
  const section = content.accommodations;

  return {
    title: "Acomodações",
    description:
      section?.description ||
      `Conheça as acomodações de ${property.name} e consulte sua estadia diretamente.`,
    alternates: { canonical: "/acomodacoes" },
    openGraph: {
      type: "website",
      url: "/acomodacoes",
      title: `Acomodações | ${property.name}`,
      description:
        section?.description ||
        `Conheça as acomodações de ${property.name}.`,
    },
  };
}

export default async function AccommodationsPage() {
  if (isPlatformHost(await requestHost())) notFound();
  const { property, content } = await getPublicSiteData();
  const accommodations = await getPublicAccommodations(property.id);
  const section = content.accommodations ?? {
    eyebrow: "ACOMODAÇÕES",
    title: "Escolha o espaço que combina com a sua viagem.",
    description: "Fotos generosas, informações claras e consulta sempre a um passo.",
  };

  return (
    <main style={themeStyle(property.theme)}>
      <SiteHeader property={property} />
      <section className="page-hero container">
        <span className="eyebrow">{section.eyebrow}</span>
        <h1>{section.title}</h1>
        <p>{section.description}</p>
      </section>
      <section className="section container">
        <div className="card-grid">
          {accommodations.map((item) => (
            <AccommodationCard key={item.id} accommodation={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
