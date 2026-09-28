import Link from "next/link";

const features = [
  ["Site com a sua marca", "Cores, tipografia, logo, conteúdo e endereço próprio para apresentar sua hospedagem."],
  ["Acomodações e experiências", "Organize fotos, detalhes dos quartos e o que faz a estadia especial."],
  ["Contato direto", "Receba consultas pelo site e acompanhe os contatos no painel."],
  ["Uma equipe, cada acesso", "Convide sua equipe e defina as áreas que cada pessoa pode administrar."],
];

export function PlatformLanding() {
  return <main className="platform-landing">
    <nav className="platform-nav"><strong>O Criartista <span>Hospedagens</span></strong><Link href="/admin/login">Acessar painel</Link></nav>
    <section className="platform-hero"><span>Para pousadas, hotéis e chalés</span><h1>Seu próximo hóspede precisa encontrar você.</h1><p>Um site com a personalidade da sua hospedagem e um painel simples para atualizar fotos, acomodações e contatos. Tudo pronto para você cuidar da presença digital sem depender de mudanças no código.</p><a href="/contratar">Começar minha hospedagem</a><small>Uma oferta completa. O valor é apresentado antes de confirmar a contratação.</small></section>
    <section className="platform-features"><span className="eyebrow">A plataforma</span><h2>Seu espaço na internet, sob seu controle.</h2><div>{features.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section className="platform-process"><div><span className="eyebrow">Como funciona</span><h2>Da primeira configuração ao site no ar.</h2><p>Crie sua conta, confirme a contratação e preencha as informações essenciais. O painel mostra o que falta antes de publicar e libera um subdomínio da plataforma. Depois, você pode conectar seu domínio.</p><Link href="/contratar" className="button button-primary">Criar minha conta</Link></div><ol><li><strong>01</strong><span>Crie sua conta e contrate</span></li><li><strong>02</strong><span>Apresente sua hospedagem</span></li><li><strong>03</strong><span>Publique e receba consultas</span></li></ol></section>
    <footer><strong>O Criartista Hospedagens</strong><Link href="/admin/login">Acessar painel</Link></footer>
  </main>;
}
