import { notFound } from "next/navigation";
import { BookingArea } from "@/components/site/BookingArea";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  getPublicAccommodationBySlug,
  getPublicAccommodations,
  getPublicSiteData,
} from "@/lib/data/public";
import { themeStyle } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function AccommodationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { property, content } = await getPublicSiteData();
  const [accommodation, accommodations] = await Promise.all([
    getPublicAccommodationBySlug(property.id, slug),
    getPublicAccommodations(property.id),
  ]);

  if (!accommodation) notFound();

  return (
    <main style={themeStyle(property.theme)}>
      <SiteHeader property={property} />
      <section className="room-hero container">
        <div className="room-gallery">
          {accommodation.images.length ? (
            <>
              <img
                className="room-main-image"
                src={accommodation.images[0]}
                alt={accommodation.name}
              />
              {accommodation.images.slice(1).map((image) => (
                <img key={image} src={image} alt="" />
              ))}
            </>
          ) : (
            <div className="public-image-placeholder room-main-image">
              Foto em breve
            </div>
          )}
        </div>
        <div className="room-copy">
          <span className="eyebrow">Acomodação</span>
          <h1>{accommodation.name}</h1>
          <p>{accommodation.description}</p>
          <div className="facts">
            <span>{accommodation.capacity} hóspedes</span>
            <span>{accommodation.sizeM2} m²</span>
            {accommodation.beds && <span>{accommodation.beds}</span>}
            <span>Check-in {property.checkInTime.slice(0, 5)}</span>
            <span>Check-out {property.checkOutTime.slice(0, 5)}</span>
          </div>
          <h2>Comodidades</h2>
          <ul className="amenities">
            {accommodation.amenities.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>
      <div className="container">
        <BookingArea
          propertyId={property.id}
          propertyWhatsapp={property.whatsapp}
          accommodations={accommodations}
          accommodationId={accommodation.id}
          content={content.direct_booking}
        />
      </div>
    </main>
  );
}
