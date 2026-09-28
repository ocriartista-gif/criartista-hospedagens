type VercelDomain = {
  name: string;
  verified: boolean;
  verification?: Array<{ type: string; domain: string; value: string }>;
};

export async function vercelDomainRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) throw new Error("Vercel domain integration is unavailable.");
  const team = process.env.VERCEL_TEAM_ID;
  const url = new URL(`https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}${path}`);
  if (team) url.searchParams.set("teamId", team);
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init?.headers },
    signal: AbortSignal.timeout(10000), cache: "no-store",
  });
  if (!response.ok) throw new Error(`Vercel domain request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function addVercelDomain(domain: string) {
  return vercelDomainRequest<VercelDomain>("/domains", { method: "POST", body: JSON.stringify({ name: domain }) });
}

export async function verifyVercelDomain(domain: string) {
  return vercelDomainRequest<VercelDomain>(`/domains/${encodeURIComponent(domain)}/verify`, { method: "POST" });
}

export async function getVercelDomain(domain: string) {
  return vercelDomainRequest<VercelDomain>(`/domains/${encodeURIComponent(domain)}`);
}

export async function getVercelDnsConfiguration(domain: string) {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("Vercel domain integration is unavailable.");
  const url = new URL(`https://api.vercel.com/v6/domains/${encodeURIComponent(domain)}/config`);
  if (process.env.VERCEL_TEAM_ID) url.searchParams.set("teamId", process.env.VERCEL_TEAM_ID);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10000), cache: "no-store",
  });
  if (!response.ok) throw new Error(`DNS check failed: ${response.status}`);
  return response.json() as Promise<{ misconfigured?: boolean; configuredBy?: string | null }>;
}
