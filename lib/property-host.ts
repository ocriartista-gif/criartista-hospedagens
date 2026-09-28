import { headers } from "next/headers";

export const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "hospedagens.ocriartista.site";

export async function requestHost() {
  const host = (await headers()).get("host")?.toLowerCase().replace(/:\d+$/, "") ?? "";
  // Hostnames are untrusted input: exact matching against verified DB entries follows.
  if (!/^[a-z0-9.-]{1,253}$/.test(host) || host.includes("..")) return "";
  return host;
}

export function isPlatformHost(host: string) {
  return host === PLATFORM_DOMAIN || host === `www.${PLATFORM_DOMAIN}` ||
    (process.env.VERCEL_ENV === "preview" && host.endsWith(".vercel.app"));
}
