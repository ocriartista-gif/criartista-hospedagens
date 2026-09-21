import { AdminTabs } from "@/components/admin/AdminTabs";
import { MediaPicker, type MediaLibraryItem } from "@/components/admin/MediaPicker";
import { getAdminContext } from "@/lib/data/admin";
import type { Json } from "@/types/database";
import { updateContentSections } from "./actions";

export const dynamic = "force-dynamic";

const sectionDefinitions = [
  { key: "hero", label: "Hero", note: "Primeira mensagem da página. Mantenha curta e focada em desejo.", media: true },
  { key: "intro", label: "Apresentação", note: "Contextualiza a experiência e o posicionamento da hospedagem.", media: false },
  { key: "accommodations", label: "Acomodações", note: "Apresenta a seção; fotos, nomes e descrições dos quartos ficam em Acomodações.", media: false },
  { key: "direct_booking", label: "Reserva", note: "Edita apenas a comunicação. Campos e fluxo de conversão permanecem protegidos.", media: false },
  { key: "experiences", label: "Experiências", note: "Introdução para os diferenciais e experiências da propriedade.", media: false },
  { key: "reviews", label: "Avaliações", note: "Texto de abertura da prova social. Os depoimentos ficam em Avaliações.", media: false },
  { key: "location", label: "Localização", note: "Mensagem que acompanha endereço e mapa.", media: false },
  { key: "footer", label: "Rodapé", note: "Assinatura final da marca no site.", media: false },
] as const;

function extraObject(value: Json): Record<string, Json | undefined> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, Json | undefined>)
    : {};
}

function experienceItems(value: Json) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Record<string, Json | undefined> =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item)
    )
    .slice(0, 3)
    .map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      description: typeof item.description === "string" ? item.description : "",
      image: typeof item.image === "string" ? item.image : "",
    }));
}

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const { supabase, membership } = await getAdminContext([
    "owner",
    "manager",
    "marketing",
    "technical_admin",
  ]);

  const [{ data: rows, error }, { data: library, error: libraryError }] =
    await Promise.all([
      supabase
        .from("content_sections")
        .select("*")
        .eq("property_id", membership.property_id),
      supabase
        .from("gallery_images")
        .select("id, storage_path, alt_text, caption, category, sort_order")
        .eq("property_id", membership.property_id)
        .eq("published", true)
        .order("sort_order")
        .order("created_at", { ascending: false }),
    ]);

  if (error) throw error;
  if (libraryError) throw libraryError;

  const content = new Map((rows ?? []).map((row) => [row.section_key, row]));
  const mediaLibrary = (library ?? []) as MediaLibraryItem[];

  return (
    <form action={updateContentSections}>
      <header className="admin-header">
        <div>
          <span className="eyebrow">Conteúdo</span>
          <h1>Conteúdo do site</h1>
          <p>Edite uma seção por vez sem alterar a estrutura de conversão.</p>
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

      <AdminTabs
        tabs={sectionDefinitions.map((section) => ({
          key: section.key,
          label: section.label,
        }))}
      >
        {sectionDefinitions.map((section) => {
          const row = content.get(section.key);
          const extra = extraObject(row?.extra ?? {});
          const heroImage =
            section.key === "hero" && typeof extra.hero_image === "string"
              ? extra.hero_image
              : "";
          const items =
            section.key === "experiences"
              ? experienceItems(extra.items ?? [])
              : [];

          return (
            <section className="admin-panel content-editor-panel" key={section.key}>
              <div className="panel-heading content-panel-heading">
                <div>
                  <span className="eyebrow">Seção do site</span>
                  <h2>{section.label}</h2>
                </div>
                <span className="content-protected-label">
                  Estrutura protegida
                </span>
              </div>

              <p className="section-note">{section.note}</p>

              {section.media && (
                <div className="content-media-block">
                  <MediaPicker
                    propertyId={membership.property_id}
                    fieldName="heroMedia"
                    initialLibrary={mediaLibrary}
                    initialSelected={heroImage ? [heroImage] : []}
                    max={1}
                    title="Imagem de fundo do Hero"
                    description="Escolha uma foto da biblioteca ou envie uma nova."
                    uploadCategory="Hero"
                  />
                </div>
              )}

              <div className="field-grid">
                <label>
                  Pré-título
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

              {section.key === "experiences" && (
                <div className="experience-admin-grid">
                  {[0, 1, 2].map((index) => (
                    <div className="experience-admin-item" key={index}>
                      <div className="experience-admin-heading">
                        <strong>Experiência {index + 1}</strong>
                        <span>Foto opcional</span>
                      </div>

                      <MediaPicker
                        propertyId={membership.property_id}
                        fieldName={`experience_${index + 1}_media`}
                        initialLibrary={mediaLibrary}
                        initialSelected={
                          items[index]?.image ? [items[index].image] : []
                        }
                        max={1}
                        title="Foto da experiência"
                        description="Escolha uma imagem da biblioteca ou envie uma nova."
                        uploadCategory="Experiências"
                      />

                      <label>
                        Título
                        <input
                          name={`experience_${index + 1}_title`}
                          defaultValue={items[index]?.title ?? ""}
                          maxLength={100}
                        />
                      </label>
                      <label>
                        Descrição
                        <textarea
                          name={`experience_${index + 1}_description`}
                          defaultValue={items[index]?.description ?? ""}
                          maxLength={240}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </AdminTabs>

      <div className="sticky-save-bar">
        <span>As alterações entram no site assim que forem salvas.</span>
        <button className="button button-primary" type="submit">
          Salvar conteúdo
        </button>
      </div>
    </form>
  );
}
