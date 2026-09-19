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

  const { data: memberships, error: membershipError } = await supabase
    .from("property_members")
    .select("property_id, role")
    .limit(1);

  if (membershipError || !memberships?.length) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=Este%20usu%C3%A1rio%20ainda%20n%C3%A3o%20possui%20acesso%20a%20uma%20hospedagem.");
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
