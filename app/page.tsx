import { AccommodationCard } from "@/components/site/AccommodationCard";
import { BookingArea } from "@/components/site/BookingArea";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  getPublicAccommodations,
  getPublicReviews,
  getPublicSiteData,
} from "@/lib/data/public";
import { themeStyle } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { property, content, social } = await getPublicSiteData();
  const [accommodations, reviews] = await Promise.all([
    getPublicAccommodations(property.id),
    getPublicReviews(property.id),
  ]);

  const hero = content.hero ?? {
    eyebrow: "POUSADA BOUTIQUE NO INTERIOR DE SÃO PAULO",
    title: property.tagline,
    description: property.description,
  };
  const directBooking = content.direct_booking ?? {
    eyebrow: "RESERVE SEM INTERMEDIÁRIOS",
    title: "Consulte as melhores datas para você.",
    description: "",
  };
  const intro = content.intro ?? {
    eyebrow: "SUA PAUSA COMEÇA AQUI",
    title: "O conforto de chegar e sentir que escolheu certo.",
    description: property.description,
  };
  const roomsSection = content.accommodations ?? {
    eyebrow: "ACOMODAÇÕES",
    title: "Seu canto entre o verde.",
    description: "Escolha o espaço que combina com a sua viagem.",
  };
  const experiences = content.experiences ?? {
    eyebrow: "EXPERIÊNCIAS",
    title: "O que faz você lembrar da viagem.",
    description: "",
  };
  const reviewSection = content.reviews ?? {
    eyebrow: "AVALIAÇÕES",
    title: "Quem vem, leva histórias.",
    description: "",
  };
  const location = content.location ?? {
    eyebrow: "LOCALIZAÇÃO",
    title: "Perto o bastante. Longe na medida certa.",
    description: property.address,
  };
  const footer = content.footer ?? {
    eyebrow: property.name,
    title: "Hospedagens que criam boas histórias.",
    description: "",
  };

  const socialLinks = [
    social?.instagram && ["Instagram", social.instagram],
    social?.facebook && ["Facebook", social.facebook],
    social?.tiktok && ["TikTok", social.tiktok],
    social?.youtube && ["YouTube", social.youtube],
    social?.linkedin && ["LinkedIn", social.linkedin],
  ].filter(Boolean) as [string, string][];

  return (
    <main style={themeStyle(property.theme)}>
      <SiteHeader property={property} />

      <section
        className="hero"
        style={
          hero.image
            ? { backgroundImage: `url("${hero.image}")` }
            : undefined
        }
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="eyebrow">{hero.eyebrow}</span>
          <h1>{hero.title}</h1>
          <p>{hero.description}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#reserva">Planejar minha estadia</a>
            <a className="button button-ghost" href={`https://wa.me/${property.whatsapp}`}>Falar no WhatsApp</a>
          </div>
        </div>
      </section>

      <div className="container">
        <BookingArea
          propertyId={property.id}
          propertyWhatsapp={property.whatsapp}
          accommodations={accommodations}
          content={directBooking}
        />
      </div>

      <section className="section container split-section">
        <div>
          <span className="eyebrow">{intro.eyebrow}</span>
          <h2>{intro.title}</h2>
        </div>
        <p>{intro.description}</p>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{roomsSection.eyebrow}</span>
            <h2>{roomsSection.title}</h2>
            <p>{roomsSection.description}</p>
          </div>
          <a className="text-link" href="/acomodacoes">Ver todas →</a>
        </div>
        <div className="card-grid">
          {accommodations.map((item) => (
            <AccommodationCard key={item.id} accommodation={item} />
          ))}
        </div>
      </section>

      <section className="section section-tint" id="experiencias">
        <div className="container">
          <span className="eyebrow">{experiences.eyebrow}</span>
          <h2>{experiences.title}</h2>
          {experiences.description && <p>{experiences.description}</p>}
          <div className="feature-grid">
            <div><strong>Café da manhã artesanal</strong><p>Comece o dia sem pressa.</p></div>
            <div><strong>Jardins e trilhas leves</strong><p>Natureza a poucos passos do quarto.</p></div>
            <div><strong>Atendimento próximo</strong><p>Converse diretamente com quem cuida da pousada.</p></div>
          </div>
        </div>
      </section>

      <section className="section container">
        <span className="eyebrow">{reviewSection.eyebrow}</span>
        <h2>{reviewSection.title}</h2>
        {reviewSection.description && <p>{reviewSection.description}</p>}
        <div className="review-grid">
          {reviews.map((review) => (
            <blockquote key={review.id}>
              <div className="stars">{"★".repeat(review.rating)}</div>
              <p>“{review.text}”</p>
              <footer>{review.guestName} · {review.source}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="section container" id="localizacao">
        <div className="location-box">
          <div>
            <span className="eyebrow">{location.eyebrow}</span>
            <h2>{location.title}</h2>
            <p>{location.description}</p>
          </div>
          <div className="map-placeholder">Mapa / Google Maps</div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong>{footer.eyebrow || property.name}</strong>
            <p>{footer.title}</p>
          </div>
          <div>
            {socialLinks.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer">{label}</a>
            ))}
            {property.whatsapp && <a href={`https://wa.me/${property.whatsapp}`}>WhatsApp</a>}
            <a href="/admin">Área administrativa</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
