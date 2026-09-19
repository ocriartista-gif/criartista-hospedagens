"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/data/admin";

const allowedRoles = new Set([
  "owner",
  "manager",
  "reservations",
  "marketing",
  "technical_admin",
]);

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function adminOnly(role: string) {
  if (!["owner", "technical_admin"].includes(role)) {
    throw new Error("Você não tem permissão para gerenciar usuários.");
  }
}

export async function invitePropertyMember(formData: FormData) {
  const { supabase, membership } = await getAdminContext();
  adminOnly(membership.role);

  const email = text(formData, "email").toLowerCase();
  const displayName = text(formData, "displayName");
  const role = text(formData, "role");

  if (!email || !allowedRoles.has(role)) {
    redirect("/admin/usuarios?error=Dados%20do%20convite%20inv%C3%A1lidos.");
  }

  const { data, error } = await supabase.functions.invoke(
    "invite-property-member",
    {
      body: {
        propertyId: membership.property_id,
        email,
        displayName,
        role,
      },
    }
  );

  if (error) {
    redirect(
      `/admin/usuarios?error=${encodeURIComponent(error.message)}`
    );
  }

  if (data?.error) {
    redirect(
      `/admin/usuarios?error=${encodeURIComponent(String(data.error))}`
    );
  }

  revalidatePath("/admin/usuarios");

  const message = data?.invitationSent
    ? "Convite enviado por e-mail."
    : "Usuário já existia e recebeu acesso à hospedagem.";

  redirect(`/admin/usuarios?success=${encodeURIComponent(message)}`);
}

export async function updatePropertyMemberRole(formData: FormData) {
  const { supabase, membership } = await getAdminContext();
  adminOnly(membership.role);

  const userId = text(formData, "userId");
  const role = text(formData, "role");

  if (!userId || !allowedRoles.has(role)) {
    redirect("/admin/usuarios?error=Perfil%20inv%C3%A1lido.");
  }

  const { error } = await supabase
    .from("property_members")
    .update({ role })
    .eq("property_id", membership.property_id)
    .eq("user_id", userId);

  if (error) {
    redirect(
      `/admin/usuarios?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/leads");

  redirect("/admin/usuarios?success=Perfil%20atualizado.");
}

export async function removePropertyMember(formData: FormData) {
  const { supabase, membership } = await getAdminContext();
  adminOnly(membership.role);

  const userId = text(formData, "userId");

  if (!userId) {
    redirect("/admin/usuarios?error=Usu%C3%A1rio%20inv%C3%A1lido.");
  }

  const { error } = await supabase
    .from("property_members")
    .delete()
    .eq("property_id", membership.property_id)
    .eq("user_id", userId);

  if (error) {
    redirect(
      `/admin/usuarios?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/leads");

  redirect("/admin/usuarios?success=Acesso%20removido.");
}
