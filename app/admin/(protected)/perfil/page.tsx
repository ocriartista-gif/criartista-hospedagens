import { getAdminContext } from "@/lib/data/admin";
import { changeEmail, changePassword, removeAvatar, saveAvatar, saveProfile } from "./actions";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const { success, error } = await searchParams;
  const { supabase, userId, membership } = await getAdminContext();
  const [{ data: { user } }, { data: profile }] = await Promise.all([
    supabase.auth.getUser(), supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  return <>
    <header className="admin-header"><div><span className="eyebrow">Minha conta</span><h1>Meu perfil</h1><p>Seus dados acompanham você em todas as hospedagens às quais tem acesso.</p></div></header>
    {success && <p className="feedback-box feedback-success" role="status">{success}</p>}
    {error && <p className="feedback-box feedback-error" role="alert">{error}</p>}
    <div className="profile-grid">
      <section className="admin-panel"><h2>Informações pessoais</h2>
        <form action={saveProfile} className="profile-form">
          <label>Nome de exibição<input name="displayName" maxLength={120} required defaultValue={profile?.display_name || membership.display_name || ""} /></label>
          <label>Telefone (opcional)<input name="phone" type="tel" maxLength={30} defaultValue={profile?.phone ?? ""} /></label>
          <button className="button button-primary">Salvar perfil</button>
        </form>
      </section>
      <section className="admin-panel"><h2>Foto de perfil</h2>
        {profile?.avatar_path && <img className="profile-preview" src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-avatars/${profile.avatar_path}`} alt="Sua foto de perfil" />}
        <form action={saveAvatar} className="profile-form"><label>Escolher foto JPG, PNG ou WebP (até 2 MB)<input name="avatar" type="file" accept="image/jpeg,image/png,image/webp" required /></label><button className="button button-secondary">Atualizar foto</button></form>
        {profile?.avatar_path && <form action={removeAvatar}><button className="button button-secondary">Remover foto</button></form>}
      </section>
      <section className="admin-panel"><h2>E-mail da conta</h2><p>{user?.email}</p><form action={changeEmail} className="profile-form"><label>Novo e-mail<input name="email" type="email" required autoComplete="email" /></label><button className="button button-secondary">Solicitar alteração</button></form></section>
      <section className="admin-panel"><h2>Alterar senha</h2><form action={changePassword} className="profile-form"><label>Nova senha<input name="password" type="password" minLength={10} required autoComplete="new-password" /></label><label>Confirme a nova senha<input name="confirmPassword" type="password" minLength={10} required autoComplete="new-password" /></label><p>Use 10 caracteres ou mais, com maiúscula, minúscula, número e símbolo.</p><button className="button button-secondary">Alterar senha</button></form></section>
    </div>
  </>;
}
