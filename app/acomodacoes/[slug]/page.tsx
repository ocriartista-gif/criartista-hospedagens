import { notFound } from "next/navigation";
import { BookingArea } from "@/components/site/BookingArea";
import { SiteHeader } from "@/components/site/SiteHeader";
import { accommodations, property } from "@/lib/mock-data";
import { themeStyle } from "@/lib/theme";

export default async function AccommodationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const accommodation = accommodations.find((item) => item.slug === slug && item.published);
  if (!accommodation) notFound();

  return <main style={themeStyle(property.theme)}><SiteHeader /><section className="room-hero container"><div className="room-gallery"><img className="room-main-image" src={accommodation.images[0]} alt={accommodation.name} />{accommodation.images.slice(1).map((image) => <img key={image} src={image} alt="" />)}</div><div className="room-copy"><span className="eyebrow">Acomodação</span><h1>{accommodation.name}</h1><p>{accommodation.description}</p><div className="facts"><span>{accommodation.capacity} hóspedes</span><span>{accommodation.sizeM2} m²</span><span>{accommodation.beds}</span></div><h2>Comodidades</h2><ul className="amenities">{accommodation.amenities.map((item) => <li key={item}>{item}</li>)}</ul></div></section><div className="container"><BookingArea accommodationId={accommodation.id} /></div></main>;
}
