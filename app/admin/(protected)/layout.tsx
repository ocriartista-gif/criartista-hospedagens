import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    redirect("/admin/login");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("property_members")
    .select("property_id, role")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) {
    redirect(
      "/admin/login?error=Este%20usu%C3%A1rio%20ainda%20n%C3%A3o%20possui%20acesso%20a%20uma%20hospedagem."
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
