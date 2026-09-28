import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyMercadoPagoSignature } from "../lib/billing/mercado-pago.ts";

test("accepts a correctly signed, recent notification", () => {
  const now = 1_790_629_000_000;
  const ts = String(Math.floor(now / 1000));
  const dataId = "12345";
  const requestId = "req-1";
  const secret = "test-secret";
  const signature = createHmac("sha256", secret)
    .update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest("hex");
  assert.equal(verifyMercadoPagoSignature(`ts=${ts},v1=${signature}`, requestId, dataId, secret, now), true);
  assert.equal(verifyMercadoPagoSignature(`ts=${ts},v1=${signature}`, requestId, "54321", secret, now), false);
  assert.equal(verifyMercadoPagoSignature(`ts=${ts},v1=${signature}`, requestId, dataId, secret, now + 360_000), false);
  assert.equal(verifyMercadoPagoSignature(`ts=${ts},v1=${"0".repeat(64)}`, requestId, dataId, secret, now), false);
});
