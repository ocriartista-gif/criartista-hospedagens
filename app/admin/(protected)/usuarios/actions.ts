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

async function sendAccessCode(
  email: string,
  displayName: string,
  role: string
) {
  const { supabase, membership } = await getAdminContext();
  adminOnly(membership.role);

  if (!email || !allowedRoles.has(role)) {
    redirect("/admin/usuarios?error=Dados%20do%20acesso%20inv%C3%A1lidos.");
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
}

export async function invitePropertyMember(formData: FormData) {
  const email = text(formData, "email").toLowerCase();
  const displayName = text(formData, "displayName");
  const role = text(formData, "role");

  await sendAccessCode(email, displayName, role);

  redirect(
    "/admin/usuarios?success=C%C3%B3digo%20de%20ativa%C3%A7%C3%A3o%20enviado%20por%20e-mail."
  );
}

export async function resendAccessCode(formData: FormData) {
  const email = text(formData, "email").toLowerCase();
  const displayName = text(formData, "displayName");
  const role = text(formData, "role");

  await sendAccessCode(email, displayName, role);

  redirect(
    "/admin/usuarios?success=Novo%20c%C3%B3digo%20de%20acesso%20enviado."
  );
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
