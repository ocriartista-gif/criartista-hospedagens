"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function result(kind: "success" | "error", message: string): never {
  redirect(`/admin/perfil?${kind}=${encodeURIComponent(message)}`);
}

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/admin/login");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!displayName || displayName.length > 120 || phone.length > 30) result("error", "Confira o nome e o telefone.");
  const { error: saveError } = await supabase.from("profiles").upsert({
    user_id: user.id, display_name: displayName, phone: phone || null, updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (saveError) result("error", "Não foi possível salvar seu perfil.");
  revalidatePath("/admin", "layout");
  result("success", "Perfil atualizado.");
}

export async function saveAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/admin/login");
  const file = formData.get("avatar");
  if (!(file instanceof File) || !file.size || file.size > 2 * 1024 * 1024) result("error", "Escolha uma imagem de até 2 MB.");
  const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const ext = extensions[file.type];
  if (!ext) result("error", "Use uma imagem JPG, PNG ou WebP.");
  const { data: old } = await supabase.from("profiles").select("avatar_path").eq("user_id", user.id).maybeSingle();
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("profile-avatars").upload(path, file, { contentType: file.type });
  if (uploadError) result("error", "Não foi possível enviar a foto.");
  const { error: saveError } = await supabase.from("profiles").upsert({ user_id: user.id, avatar_path: path, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (saveError) {
    await supabase.storage.from("profile-avatars").remove([path]);
    result("error", "Não foi possível salvar a foto.");
  }
  if (old?.avatar_path) await supabase.storage.from("profile-avatars").remove([old.avatar_path]);
  revalidatePath("/admin", "layout");
  result("success", "Foto atualizada.");
}

export async function removeAvatar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: old } = await supabase.from("profiles").select("avatar_path").eq("user_id", user.id).maybeSingle();
  const { error } = await supabase.from("profiles").update({ avatar_path: null, updated_at: new Date().toISOString() }).eq("user_id", user.id);
  if (error) result("error", "Não foi possível remover a foto.");
  if (old?.avatar_path) await supabase.storage.from("profile-avatars").remove([old.avatar_path]);
  revalidatePath("/admin", "layout");
  result("success", "Foto removida.");
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const password = String(formData.get("password") ?? "");
  if (password.length < 10 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password))
    result("error", "A senha precisa ter 10 caracteres, maiúscula, minúscula, número e símbolo.");
  if (password !== formData.get("confirmPassword")) result("error", "As senhas não conferem.");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) result("error", "Não foi possível alterar a senha. Entre novamente e tente de novo.");
  result("success", "Senha alterada.");
}

export async function changeEmail(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) result("error", "Informe um e-mail válido.");
  const { error } = await supabase.auth.updateUser({ email });
  if (error) result("error", "Não foi possível solicitar a troca de e-mail.");
  result("success", "Confira a confirmação enviada por e-mail.");
}
