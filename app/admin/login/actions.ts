"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/admin/login?error=E-mail%20ou%20senha%20inv%C3%A1lidos.");
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=N%C3%A3o%20foi%20poss%C3%ADvel%20validar%20a%20sess%C3%A3o.");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("property_members")
    .select("property_id, role")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) {
    await supabase.auth.signOut();
    redirect(
      "/admin/login?error=Este%20usu%C3%A1rio%20ainda%20n%C3%A3o%20possui%20acesso%20a%20uma%20hospedagem."
    );
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}
