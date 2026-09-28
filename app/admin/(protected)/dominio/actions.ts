"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/data/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { addVercelDomain, getVercelDnsConfiguration, getVercelDomain, verifyVercelDomain } from "@/lib/vercel-domains";
import { PLATFORM_DOMAIN } from "@/lib/property-host";

function feedback(kind: "error" | "saved", message: string): never {
  redirect(`/admin/dominio?${kind}=${encodeURIComponent(message)}`);
}

function normalized(value: unknown) {
  const domain = String(value ?? "").trim().toLowerCase().replace(/\.$/, "");
  if (domain.length > 253 || !/^(?=.{4,253}$)[a-z0-9]+(?:[.-][a-z0-9]+)+$/.test(domain)
    || domain.includes("..") || domain.endsWith(`.${PLATFORM_DOMAIN}`) || domain === PLATFORM_DOMAIN)
    feedback("error", "Informe um domínio válido que pertence à sua hospedagem.");
  return domain;
}

export async function addCustomDomain(formData: FormData) {
  const { membership } = await getAdminContext(["owner"]);
  const domain = normalized(formData.get("domain"));
  if (!process.env.VERCEL_TOKEN || !process.env.VERCEL_PROJECT_ID)
    feedback("error", "A conexão de domínio próprio ainda não está disponível.");
  const service = createServiceClient();
  const { data: existing } = await service.from("property_domains").select("property_id").eq("domain", domain).maybeSingle();
  if (existing) feedback("error", "Este domínio já está cadastrado.");
  try {
    const result = await addVercelDomain(domain).catch(() => getVercelDomain(domain));
    // Vercel may verify project ownership before DNS points at this project.
    // Never mark public/verified until both project verification and DNS are checked.
    const { error } = await service.from("property_domains").insert({
      property_id: membership.property_id, domain, type: "custom", status: "pending",
      verification_status: result.verified ? "ownership_verified" : "pending",
      verification_records: result.verification ?? [],
    });
    if (error) throw error;
    revalidatePath("/admin/dominio");
    feedback("saved", "Domínio adicionado. Confira os registros DNS abaixo.");
  } catch {
    feedback("error", "Não foi possível adicionar este domínio. Confira se ele já está vinculado a outro projeto.");
  }
}

export async function checkCustomDomain(formData: FormData) {
  const { membership } = await getAdminContext(["owner"]);
  const domain = normalized(formData.get("domain"));
  const service = createServiceClient();
  const { data: row } = await service.from("property_domains").select("id").eq("domain", domain)
    .eq("property_id", membership.property_id).eq("type", "custom").maybeSingle();
  if (!row) feedback("error", "Domínio não encontrado nesta hospedagem.");
  try {
    const verified = await verifyVercelDomain(domain);
    const current = await getVercelDomain(domain);
    const dns = await getVercelDnsConfiguration(domain);
    const ready = verified.verified && current.verified && dns.misconfigured === false;
    const { error } = await service.from("property_domains").update({
      status: ready ? "verified" : "pending",
      verification_status: ready ? "verified" : "pending",
      verification_records: current.verification ?? verified.verification ?? [],
      verified_at: ready ? new Date().toISOString() : null,
    }).eq("id", row.id);
    if (error) throw error;
    revalidatePath("/admin/dominio");
    feedback("saved", ready ? "Domínio verificado." : "Ainda aguardamos a verificação DNS.");
  } catch {
    feedback("error", "A verificação ainda não foi concluída. Confira os registros DNS.");
  }
}

export async function makePrimaryDomain(formData: FormData) {
  const { membership } = await getAdminContext(["owner"]);
  const domainId = String(formData.get("domainId") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(domainId)) feedback("error", "Domínio inválido.");
  const service = createServiceClient();
  const { error } = await service.rpc("set_primary_property_domain", {
    p_property_id: membership.property_id, p_domain_id: domainId,
  });
  if (error) feedback("error", "O domínio precisa estar verificado antes de virar principal.");
  revalidatePath("/admin", "layout");
  feedback("saved", "Domínio principal atualizado.");
}
