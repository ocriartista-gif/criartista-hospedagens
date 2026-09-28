import Link from "next/link";
import { getAdminContext } from "@/lib/data/admin";
import { publishProperty, saveOnboardingProperty, saveOnboardingSocial } from "./actions";
import { OnboardingHelp } from "@/components/admin/OnboardingHelp";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({ searchParams }: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { saved, error } = await searchParams;
  const { supabase, membership, property, theme } = await getAdminContext(["owner"]);
  const id = membership.property_id;
  const [{ data: sections }, { data: rooms }, { data: social }, { data: domain }, { data: progress }] = await Promise.all([
    supabase.from("content_sections").select("section_key, title, extra").eq("property_id", id),
    supabase.from("accommodations").select("id, published").eq("property_id", id),
    supabase.from("social_links").select("*").eq("property_id", id).maybeSingle(),
    supabase.from("property_domains").select("domain").eq("property_id", id).eq("type", "subdomain").maybeSingle(),
    supabase.from("onboarding_state").select("current_step").eq("property_id", id).maybeSingle(),
  ]);
  const hero = sections?.find((row) => row.section_key === "hero");
  const experiences = sections?.find((row) => row.section_key === "experiences");
  const heroExtra = hero?.extra && typeof hero.extra === "object" && !Array.isArray(hero.extra) ? hero.extra : {};
  const roomIds = (rooms ?? []).filter((room) => room.published).map((room) => room.id);
  const { data: images } = roomIds.length
    ? await supabase.from("accommodation_images").select("accommodation_id").in("accommodation_id", roomIds).limit(1)
    : { data: [] };
  const checks = [
    { label: "Dados da hospedagem", done: Boolean(property.name && property.whatsapp && property.address), href: "#dados" },
    { label: "Marca e logo", done: Boolean(theme.logoMainUrl), href: "/admin/identidade" },
    { label: "Apresentação e foto principal", done: Boolean(hero?.title && typeof heroExtra.hero_image === "string" && heroExtra.hero_image), href: "/admin/conteudo" },
    { label: "Primeira acomodação com foto", done: Boolean(images?.length), href: "/admin/acomodacoes/nova" },
    { label: "Experiências", done: Boolean(experiences?.title), href: "/admin/conteudo" },
    { label: "Redes sociais", done: Boolean(social?.instagram || social?.facebook), href: "#redes" },
    { label: "Domínio", done: Boolean(domain?.domain), href: "/admin/dominio" },
  ];
  const count = checks.filter((step) => step.done).length;
  const canPublish = checks[0].done && checks[2].done && checks[3].done;
  return <>
    <header className="admin-header"><div><span className="eyebrow">Primeiros passos</span><h1>Prepare sua hospedagem</h1><p>Você pode sair e voltar quando quiser. Os dados salvos continuam aqui.</p></div></header>
    {saved && <div className="feedback-box feedback-success" role="status">{saved}</div>}
    {error && <div className="feedback-box feedback-error" role="alert">{error}</div>}
    {error && <OnboardingHelp message={error} />}
    <section className="admin-panel onboarding-progress">
      <strong>{property.status === "active" ? "Site publicado" : `${Math.round(count / checks.length * 100)}% concluído`}</strong>
      <progress value={count} max={checks.length} aria-label="Progresso da configuração" />
      <small>Etapa salva: {progress?.current_step ?? "property"}</small>
      <ol>{checks.map((step) => <li key={step.label}><span aria-label={step.done ? "Concluído" : "Pendente"}>{step.done ? "✓" : "○"}</span><Link href={step.href}>{step.label}</Link></li>)}</ol>
    </section>
    <div className="profile-grid">
      <section className="admin-panel" id="dados"><h2>1. Dados essenciais</h2><p>Essas informações aparecem no site e ajudam o hóspede a entrar em contato.</p>
        <form action={saveOnboardingProperty} className="profile-form">
          <label>Nome da hospedagem<input name="name" required maxLength={120} defaultValue={property.name} /></label>
          <label>WhatsApp com DDD<input name="whatsapp" type="tel" required defaultValue={property.whatsapp ?? ""} /></label>
          <label>Endereço<input name="address" required defaultValue={property.address ?? ""} /></label>
          <label>E-mail de contato<input name="email" type="email" defaultValue={property.email ?? ""} /></label>
          <button className="button button-primary">Salvar e continuar</button>
        </form>
      </section>
      <section className="admin-panel" id="redes"><h2>2. Redes sociais</h2><p>Opcional. Você pode preencher agora ou mais tarde.</p>
        <form action={saveOnboardingSocial} className="profile-form">
          <label>Instagram<input name="instagram" type="url" placeholder="https://instagram.com/..." defaultValue={social?.instagram ?? ""} /></label>
          <label>Facebook<input name="facebook" type="url" placeholder="https://facebook.com/..." defaultValue={social?.facebook ?? ""} /></label>
          <button className="button button-secondary">Salvar redes sociais</button>
        </form>
      </section>
    </div>
    <section className="admin-panel onboarding-publish"><h2>Revisão e publicação</h2>
      <p>Endereço automático: <strong>{domain?.domain ?? "será criado na ativação"}</strong></p>
      {property.status === "draft" ? <>
        <p>Para publicar, complete dados essenciais, apresentação com foto e uma acomodação publicada com foto. Logo, experiências e redes sociais podem vir depois.</p>
        <form action={publishProperty}><button className="button button-primary" disabled={!canPublish}>Publicar meu site</button></form>
      </> : <p>Seu site está {property.status === "active" ? "no ar" : "indisponível"}.</p>}
    </section>
  </>;
}
