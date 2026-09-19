import { AccommodationCard } from "@/components/site/AccommodationCard";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getPublicAccommodations, getPublicSiteData } from "@/lib/data/public";
import { themeStyle } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function AccommodationsPage() {
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
