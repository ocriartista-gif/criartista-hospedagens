"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/data/admin";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalNumber(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw) return null;
  const value = Number(raw.replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

function partsInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  ) as Record<string, string>;
}

function localDateTimeToIso(value: string, timeZone: string) {
  if (!value) return null;

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
  );

  if (!match) return null;

  const [, year, month, day, hour, minute] = match;
  const desiredUtc = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    0
  );

  let candidate = new Date(desiredUtc);

  for (let index = 0; index < 2; index += 1) {
    const parts = partsInTimeZone(candidate, timeZone);
    const representedUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
    candidate = new Date(candidate.getTime() + (desiredUtc - representedUtc));
  }

  return candidate.toISOString();
}

export async function updateLead(formData: FormData) {
  const { supabase, membership, property } = await getAdminContext();
  const id = text(formData, "id");
  const status = text(formData, "status") || "novo";

  const { error } = await supabase
    .from("leads")
    .update({
      status,
      quoted_value: optionalNumber(formData, "quotedValue"),
      last_contact: localDateTimeToIso(
        text(formData, "lastContact"),
        property.timezone
      ),
      next_follow_up: localDateTimeToIso(
        text(formData, "nextFollowUp"),
        property.timezone
      ),
      scheduled_contact_at: localDateTimeToIso(
        text(formData, "scheduledContactAt"),
        property.timezone
      ),
      scheduled_contact_note: text(formData, "scheduledContactNote") || null,
      notes: text(formData, "notes") || null,
      lost_reason: status === "perdido" ? text(formData, "lostReason") || null : null,
      do_not_contact: formData.get("doNotContact") === "on",
      priority_override: optionalNumber(formData, "priorityOverride"),
    })
    .eq("id", id)
    .eq("property_id", membership.property_id);

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  redirect(`/admin/leads/${id}`);
}

export async function registerContactNow(formData: FormData) {
  const { supabase, membership } = await getAdminContext();
  const id = text(formData, "id");

  const { data: current, error: readError } = await supabase
    .from("leads")
    .select("status")
    .eq("id", id)
    .eq("property_id", membership.property_id)
    .single();

  if (readError) throw readError;

  const { error } = await supabase
    .from("leads")
    .update({
      last_contact: new Date().toISOString(),
      status: current.status === "novo" ? "contatado" : current.status,
      scheduled_contact_at: null,
      scheduled_contact_note: null,
    })
    .eq("id", id)
    .eq("property_id", membership.property_id);

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  redirect(`/admin/leads/${id}`);
}
