import { getAdminContext } from "@/lib/data/admin";
import { createReview, deleteReview, updateReview } from "./actions";

export const dynamic = "force-dynamic";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{
    created?: string;
    saved?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const { supabase, membership } = await getAdminContext();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("property_id", membership.property_id)
    .order("featured", { ascending: false })
    .order("review_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  const feedback =
    params.created === "1"
      ? "Avaliação criada e sincronizada com o site."
      : params.saved === "1"
        ? "Avaliação atualizada."
        : params.deleted === "1"
          ? "Avaliação removida."
          : null;

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="eyebrow">Prova social</span>
          <h1>Avaliações</h1>
          <p>
            Cadastre depoimentos individualmente e controle o que aparece no
            site.
          </p>
        </div>
      </header>

      {feedback && (
        <div className="feedback-box feedback-success">{feedback}</div>
      )}
      {params.error && (
        <div className="feedback-box feedback-error">{params.error}</div>
      )}

      <section className="admin-panel review-create-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Novo depoimento</span>
            <h2>Adicionar avaliação</h2>
          </div>
        </div>

        <form action={createReview} className="review-form">
          <div className="field-grid">
            <label>
              Nome do hóspede
              <input name="guestName" required placeholder="Ex.: Mariana S." />
            </label>

            <label>
              Nota
              <select name="rating" defaultValue="5">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} estrela{rating !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Fonte
              <input name="source" placeholder="Google, Booking, Airbnb..." />
            </label>

            <label>
              Data da avaliação
              <input type="date" name="reviewDate" />
            </label>

            <label className="field-full">
              Link da avaliação
              <input
                type="url"
                name="sourceUrl"
                placeholder="https://..."
              />
            </label>

            <label className="field-full">
              Depoimento
              <textarea
                name="reviewText"
                required
                maxLength={1000}
                placeholder="Texto da avaliação..."
              />
            </label>

            <label className="checkbox-field">
              <input type="checkbox" name="featured" />
              Marcar como destaque
            </label>

            <label className="checkbox-field">
              <input type="checkbox" name="published" defaultChecked />
              Publicar no site
            </label>
          </div>

          <div className="form-actions">
            <button className="button button-primary" type="submit">
              Adicionar avaliação
            </button>
          </div>
        </form>
      </section>

      <div className="review-admin-list">
        {(reviews ?? []).map((review) => (
          <article className="admin-panel review-admin-card" key={review.id}>
            <form action={updateReview} className="review-form">
              <input type="hidden" name="id" value={review.id} />

              <div className="review-card-heading">
                <div>
                  <div className="stars">{"★".repeat(review.rating)}</div>
                  <h2>{review.guest_name}</h2>
                </div>

                <div className="review-statuses">
                  {review.featured && <span>Destaque</span>}
                  <span className={review.published ? "published" : "hidden"}>
                    {review.published ? "Publicado" : "Oculto"}
                  </span>
                </div>
              </div>

              <div className="field-grid">
                <label>
                  Nome do hóspede
                  <input
                    name="guestName"
                    required
                    defaultValue={review.guest_name}
                  />
                </label>

                <label>
                  Nota
                  <select name="rating" defaultValue={String(review.rating)}>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} estrela{rating !== 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Fonte
                  <input name="source" defaultValue={review.source ?? ""} />
                </label>

                <label>
                  Data
                  <input
                    type="date"
                    name="reviewDate"
                    defaultValue={review.review_date ?? ""}
                  />
                </label>

                <label className="field-full">
                  Link da avaliação
                  <input
                    type="url"
                    name="sourceUrl"
                    defaultValue={review.source_url ?? ""}
                  />
                </label>

                <label className="field-full">
                  Depoimento
                  <textarea
                    name="reviewText"
                    required
                    maxLength={1000}
                    defaultValue={review.review_text}
                  />
                </label>

                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={review.featured}
                  />
                  Destaque
                </label>

                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    name="published"
                    defaultChecked={review.published}
                  />
                  Publicado
                </label>
              </div>

              <div className="form-actions">
                {review.source_url && (
                  <a
                    className="text-link"
                    href={review.source_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver avaliação original ↗
                  </a>
                )}
                <button className="button button-primary" type="submit">
                  Salvar avaliação
                </button>
              </div>
            </form>

            <form action={deleteReview} className="review-delete-form">
              <input type="hidden" name="id" value={review.id} />
              <button className="button button-danger" type="submit">
                Excluir
              </button>
            </form>
          </article>
        ))}
      </div>

      {!reviews?.length && (
        <div className="admin-panel empty-state">
          Nenhuma avaliação cadastrada ainda.
        </div>
      )}
    </>
  );
}
