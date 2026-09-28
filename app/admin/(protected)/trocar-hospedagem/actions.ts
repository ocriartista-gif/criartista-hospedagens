"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function selectProperty(formData: FormData) {
  const propertyId = String(formData.get("propertyId") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(propertyId)) throw new Error("Hospedagem inválida.");
  const supabase = await createClient();
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) redirect("/admin/login");
  const { data: member } = await supabase.from("property_members")
    .select("property_id").eq("user_id", userData.user.id)
    .eq("property_id", propertyId).maybeSingle();
  if (!member) throw new Error("Você não tem acesso a esta hospedagem.");
  (await cookies()).set("criartista_active_property", propertyId, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/admin",
  });
  revalidatePath("/admin", "layout");
  redirect("/admin");
}
