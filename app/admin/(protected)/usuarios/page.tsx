import { redirect } from "next/navigation";
import {
  invitePropertyMember,
  resendAccessCode,
  removePropertyMember,
  updatePropertyMemberRole,
} from "./actions";
import { getAdminContext } from "@/lib/data/admin";
import { roleDescriptions, roleLabels, roleOptions } from "@/lib/roles";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const { supabase, membership } = await getAdminContext();

  if (!["owner", "technical_admin"].includes(membership.role)) {
    redirect("/admin");
  }

  const { data: members, error: membersError } = await supabase
    .from("property_members")
    .select("*")
    .eq("property_id", membership.property_id)
    .order("created_at");

  if (membersError) throw membersError;

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="eyebrow">Acessos</span>
          <h1>Usuários e permissões</h1>
          <p>
            Convide a equipe e defina o que cada pessoa pode operar dentro da
            hospedagem.
          </p>
        </div>
      </header>

      {success && <div className="feedback-box feedback-success">{success}</div>}
      {error && <div className="feedback-box feedback-error">{error}</div>}

      <div className="users-layout">
        <section className="admin-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Equipe</span>
              <h2>Acessos atuais</h2>
            </div>
            <span className="queue-count">{members?.length ?? 0} usuário(s)</span>
          </div>

          <div className="member-list">
            {(members ?? []).map((member) => (
              <article className="member-card" key={member.user_id}>
                <div className="member-main">
                  <div className="member-avatar">
                    {(member.display_name || member.email || "?")
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>{member.display_name || member.email || "Usuário"}</strong>
                    <span>{member.email ?? "Sem e-mail informado"}</span>
                    <small>
                      Desde {formatDate(member.created_at)}
                      {member.invited_at
                        ? ` · convidado em ${formatDate(member.invited_at)}`
                        : ""}
                    </small>
                  </div>
                </div>

                <div className="member-actions">
                  <form action={updatePropertyMemberRole}>
                    <input type="hidden" name="userId" value={member.user_id} />
                    <select name="role" defaultValue={member.role}>
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {roleLabels[role]}
                        </option>
                      ))}
                    </select>
                    <button className="button button-secondary" type="submit">
                      Salvar perfil
                    </button>
                  </form>

                  {member.user_id !== membership.user_id ? (
                    <>
                      <form action={resendAccessCode}>
                        <input type="hidden" name="email" value={member.email ?? ""} />
                        <input
                          type="hidden"
                          name="displayName"
                          value={member.display_name ?? ""}
                        />
                        <input type="hidden" name="role" value={member.role} />
                        <button className="button button-secondary" type="submit">
                          Reenviar código
                        </button>
                      </form>

                      <form action={removePropertyMember}>
                        <input type="hidden" name="userId" value={member.user_id} />
                        <button className="button button-danger" type="submit">
                          Remover acesso
                        </button>
                      </form>
                    </>
                  ) : (
                    <span className="current-user-label">Seu usuário</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="admin-panel invite-panel">
          <span className="eyebrow">Novo acesso</span>
          <h2>Convidar usuário</h2>
          <p>
            O convidado receberá um código de acesso para ativar o painel
            e definir a senha.
          </p>

          <form action={invitePropertyMember} className="invite-form">
            <label>
              Nome
              <input name="displayName" required placeholder="Nome da pessoa" />
            </label>

            <label>
              E-mail
              <input
                name="email"
                type="email"
                required
                placeholder="pessoa@empresa.com"
              />
            </label>

            <label>
              Perfil
              <select name="role" defaultValue="reservations">
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </select>
            </label>

            <button className="button button-primary" type="submit">
              Enviar código de acesso
            </button>
          </form>

          <div className="role-guide">
            {roleOptions.map((role) => (
              <div key={role}>
                <strong>{roleLabels[role]}</strong>
                <span>{roleDescriptions[role]}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
