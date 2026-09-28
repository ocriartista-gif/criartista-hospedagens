import Link from "next/link";

const features = ["Site da hospedagem", "Acomodações e fotos", "Identidade visual", "Gestão de conteúdo", "Leads e reservas diretas", "Equipe e permissões"];

export function PlatformLanding() {
  return <main className="platform-landing">
    <nav className="platform-nav"><strong>O Criartista <span>Hospedagens</span></strong><Link href="/admin/login">Acessar painel</Link></nav>
    <section className="platform-hero"><span>Presença digital para quem recebe bem</span><h1>Sua hospedagem merece um site que trabalhe junto com você.</h1><p>Apresente seus espaços, organize o conteúdo e receba consultas diretas em um painel feito para o dia a dia de pousadas, hotéis e chalés.</p><a href="https://ocriartista.site/" aria-label="Conhecer O Criartista">Conhecer O Criartista</a></section>
    <section className="platform-features"><h2>Tudo em um só lugar</h2><div>{features.map((feature) => <article key={feature}>{feature}</article>)}</div></section>
    <footer>O Criartista Hospedagens</footer>
  </main>;
}
