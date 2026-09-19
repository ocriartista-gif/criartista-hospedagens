import { AccommodationCard } from "@/components/site/AccommodationCard";
import { BookingArea } from "@/components/site/BookingArea";
import { SiteHeader } from "@/components/site/SiteHeader";
import { accommodations, property, reviews } from "@/lib/mock-data";
import { themeStyle } from "@/lib/theme";

export default function Home() {
  return (
    <main style={themeStyle(property.theme)}>
      <SiteHeader />
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="eyebrow">Pousada boutique no interior de São Paulo</span>
          <h1>{property.tagline}</h1>
          <p>{property.description}</p>
          <div className="hero-actions"><a className="button button-primary" href="#reserva">Planejar minha estadia</a><a className="button button-ghost" href={`https://wa.me/${property.whatsapp}`}>Falar no WhatsApp</a></div>
        </div>
      </section>
      <div className="container"><BookingArea /></div>

      <section className="section container split-section">
        <div><span className="eyebrow">Sua pausa começa aqui</span><h2>O conforto de chegar e sentir que escolheu certo.</h2></div>
        <p>Na Villa Ipê, cada detalhe foi pensado para uma estadia sem pressa: acolhimento verdadeiro, natureza ao redor e a liberdade de falar diretamente com quem cuida da pousada.</p>
      </section>

      <section className="section container">
        <div className="section-heading"><div><span className="eyebrow">Acomodações</span><h2>Seu canto entre o verde.</h2><p>Escolha o espaço que combina com a sua viagem.</p></div><a className="text-link" href="/acomodacoes">Ver todas →</a></div>
        <div className="card-grid">{accommodations.filter((item) => item.published).map((item) => <AccommodationCard key={item.id} accommodation={item} />)}</div>
      </section>

      <section className="section section-tint" id="experiencias"><div className="container"><span className="eyebrow">Experiências</span><h2>O que faz você lembrar da viagem.</h2><div className="feature-grid"><div><strong>Café da manhã artesanal</strong><p>Comece o dia sem pressa.</p></div><div><strong>Jardins e trilhas leves</strong><p>Natureza a poucos passos do quarto.</p></div><div><strong>Atendimento próximo</strong><p>Converse diretamente com quem cuida da pousada.</p></div></div></div></section>

      <section className="section container"><span className="eyebrow">Avaliações</span><h2>Quem vem, leva histórias.</h2><div className="review-grid">{reviews.filter((review) => review.published).map((review) => <blockquote key={review.id}><div className="stars">{"★".repeat(review.rating)}</div><p>“{review.text}”</p><footer>{review.guestName} · {review.source}</footer></blockquote>)}</div></section>

      <section className="section container" id="localizacao"><div className="location-box"><div><span className="eyebrow">Localização</span><h2>Perto o bastante. Longe na medida certa.</h2><p>{property.address}, com acesso simples e clima de refúgio.</p></div><div className="map-placeholder">Mapa / Google Maps</div></div></section>
      <footer className="footer"><div className="container footer-inner"><div><strong>{property.name}</strong><p>Hospedagens que criam boas histórias.</p></div><div><a href="#">Instagram</a><a href={`https://wa.me/${property.whatsapp}`}>WhatsApp</a><a href="/admin">Área administrativa</a></div></div></footer>
    </main>
  );
}
