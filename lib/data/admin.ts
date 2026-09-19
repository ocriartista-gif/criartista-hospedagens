import { createClient } from "@/lib/supabase/server";

export async function getAdminContext() {
  const supabase = await createClient();

  const { data: membership, error: membershipError } = await supabase
    .from("property_members")
    .select("property_id, role")
    .limit(1)
    .single();

  if (membershipError || !membership) {
    throw new Error("Admin user has no property membership.");
  }

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", membership.property_id)
    .single();

  if (propertyError || !property) {
    throw new Error("Property not found.");
  }

  return { supabase, membership, property };
}
