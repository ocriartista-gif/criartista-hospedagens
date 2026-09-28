"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function resetPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 10 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password))
    redirect("/admin/redefinir-senha?error=A%20senha%20precisa%20ter%2010%20caracteres%2C%20mai%C3%BAscula%2C%20min%C3%BAscula%2C%20n%C3%BAmero%20e%20s%C3%ADmbolo.");
  if (password !== formData.get("confirmPassword")) redirect("/admin/redefinir-senha?error=As%20senhas%20n%C3%A3o%20conferem.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/esqueci-senha?error=Link%20expirado.");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/admin/redefinir-senha?error=N%C3%A3o%20foi%20poss%C3%ADvel%20alterar%20a%20senha.");
  await supabase.auth.signOut();
  redirect("/admin/redefinir-senha?success=1");
}
