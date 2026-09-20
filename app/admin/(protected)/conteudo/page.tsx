import { getAdminContext } from "@/lib/data/admin";
import { updateContentSections } from "./actions";

export const dynamic = "force-dynamic";

const sectionDefinitions = [
  {
    key: "hero",
    label: "Hero da Home",
    note: "Primeira mensagem da página. Mantenha curta e focada em desejo.",
  },
  {
    key: "intro",
    label: "Apresentação da hospedagem",
    note: "Contextualiza a experiência e o posicionamento da hospedagem.",
  },
  {
    key: "accommodations",
    label: "Acomodações",
    note: "Apresenta a seção; nomes e descrições dos quartos ficam em Acomodações.",
  },
  {
    key: "direct_booking",
    label: "Reserva direta",
    note: "Edita apenas a comunicação. Campos e fluxo de conversão permanecem protegidos.",
  },
  {
    key: "experiences",
    label: "Experiências",
    note: "Introdução para os diferenciais e experiências da propriedade.",
  },
  {
    key: "reviews",
    label: "Avaliações",
    note: "Texto de abertura da prova social. Os depoimentos ficam em Avaliações.",
  },
  {
    key: "location",
    label: "Localização",
    note: "Mensagem que acompanha endereço e mapa.",
  },
  {
    key: "footer",
    label: "Rodapé",
    note: "Assinatura final da marca no site.",
  },
] as const;

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const { supabase, membership } = await getAdminContext();

  const { data: rows, error } = await supabase
    .from("content_sections")
    .select("*")
    .eq("property_id", membership.property_id);

  if (error) throw error;

  const content = new Map((rows ?? []).map((row) => [row.section_key, row]));

  return (
    <form action={updateContentSections}>
      <header className="admin-header">
        <div>
          <span className="eyebrow">Conteúdo</span>
          <h1>Como a hospedagem fala.</h1>
          <p>
            Edite a comunicação sem alterar a estrutura de conversão do site.
          </p>
        </div>
        <button className="button button-primary" type="submit">
          Salvar alterações
        </button>
      </header>

      {saved === "1" && (
        <div className="feedback-box feedback-success">
          Conteúdo salvo e publicado no site.
        </div>
      )}

      <div className="settings-stack">
        {sectionDefinitions.map((section) => {
          const row = content.get(section.key);

          return (
            <section className="admin-panel" key={section.key}>
              <div className="panel-heading content-panel-heading">
                <div>
                  <span className="eyebrow">{section.key.replaceAll("_", " ")}</span>
                  <h2>{section.label}</h2>
                </div>
                <span className="content-protected-label">Estrutura protegida</span>
              </div>

              <p className="section-note">{section.note}</p>

              <div className="field-grid">
                <label>
                  Pré-título / eyebrow
                  <input
                    name={`${section.key}_eyebrow`}
                    defaultValue={row?.eyebrow ?? ""}
                    maxLength={100}
                  />
                </label>

                <label>
                  Título
                  <input
                    name={`${section.key}_title`}
                    defaultValue={row?.title ?? ""}
                    maxLength={180}
                  />
                </label>

                <label className="field-full">
                  Descrição
                  <textarea
                    name={`${section.key}_description`}
                    defaultValue={row?.description ?? ""}
                    maxLength={600}
                  />
                </label>
              </div>
            </section>
          );
        })}
      </div>

      <div className="sticky-save-bar">
        <span>As alterações entram no site assim que forem salvas.</span>
        <button className="button button-primary" type="submit">
          Salvar conteúdo
        </button>
      </div>
    </form>
  );
}
