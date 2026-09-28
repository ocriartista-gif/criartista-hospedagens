"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function sendRecoveryEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/admin/esqueci-senha?error=Informe%20um%20e-mail%20v%C3%A1lido.");
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) redirect("/admin/esqueci-senha?error=Recupera%C3%A7%C3%A3o%20temporariamente%20indispon%C3%ADvel.");
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${new URL(base).origin}/auth/callback?next=/admin/redefinir-senha` });
  redirect("/admin/esqueci-senha?sent=1");
}
