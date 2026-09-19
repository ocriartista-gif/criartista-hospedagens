import { AccommodationCard } from "@/components/site/AccommodationCard";
import { SiteHeader } from "@/components/site/SiteHeader";
import { accommodations, property } from "@/lib/mock-data";
import { themeStyle } from "@/lib/theme";

export default function AccommodationsPage() {
  return <main style={themeStyle(property.theme)}><SiteHeader /><section className="page-hero container"><span className="eyebrow">Acomodações</span><h1>Escolha o espaço que combina com a sua viagem.</h1><p>Fotos generosas, informações claras e consulta sempre a um passo.</p></section><section className="section container"><div className="card-grid">{accommodations.filter((item) => item.published).map((item) => <AccommodationCard key={item.id} accommodation={item} />)}</div></section></main>;
}
