import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.mercadopago.com";

export async function mercadoPagoRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) throw new Error("Mercado Pago credentials are unavailable.");
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Mercado Pago request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export type AuthorizedPayment = {
  id: number;
  preapproval_id: string;
  currency_id: string;
  transaction_amount: string | number;
  payment?: { status?: string; id?: number };
};

export type Preapproval = {
  id: string;
  external_reference?: string;
  payer_email?: string;
  status: string;
  auto_recurring?: { transaction_amount: string | number; currency_id: string };
};

export function verifyMercadoPagoSignature(
  xSignature: string | null, requestId: string | null,
  dataId: string | null, secret: string, now = Date.now()
) {
  if (!xSignature || !requestId || !dataId || !/^[a-zA-Z0-9_-]{1,100}$/.test(dataId)) return false;
  const parts = Object.fromEntries(xSignature.split(",").map((part) => part.trim().split("=")));
  if (!/^\d{10,13}$/.test(parts.ts ?? "") || !/^[a-f0-9]{64}$/i.test(parts.v1 ?? "")) return false;
  const timestamp = Number(parts.ts) * (parts.ts.length === 10 ? 1000 : 1);
  if (Math.abs(now - timestamp) > 5 * 60_000) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest();
  return timingSafeEqual(expected, Buffer.from(parts.v1, "hex"));
}
