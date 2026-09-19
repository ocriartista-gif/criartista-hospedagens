import { createClient } from "npm:@supabase/supabase-js@2";

const allowedRoles = new Set([
  "owner",
  "manager",
  "reservations",
  "marketing",
  "technical_admin",
]);

const appUrl = "https://criartista-hospedagens.vercel.app";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function envKey(name: string, legacyName: string) {
  const raw = Deno.env.get(name);
  if (raw) {
    try {
      return JSON.parse(raw).default as string;
    } catch {
      // Fall through to legacy environment variable.
    }
  }
  return Deno.env.get(legacyName) ?? "";
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Unauthorized." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const publishableKey = envKey(
    "SUPABASE_PUBLISHABLE_KEYS",
    "SUPABASE_ANON_KEY"
  );
  const secretKey = envKey(
    "SUPABASE_SECRET_KEYS",
    "SUPABASE_SERVICE_ROLE_KEY"
  );

  if (!supabaseUrl || !publishableKey || !secretKey) {
    return json({ error: "Supabase environment is not configured." }, 500);
  }

  const userClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const token = authHeader.slice("Bearer ".length);
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser(token);

  if (userError || !user) {
    return json({ error: "Invalid session." }, 401);
  }

  const body = await req.json().catch(() => null);
  const propertyId = String(body?.propertyId ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const displayName = String(body?.displayName ?? "").trim();
  const role = String(body?.role ?? "").trim();

  if (!propertyId || !email || !allowedRoles.has(role)) {
    return json({ error: "Invalid invitation data." }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Invalid email address." }, 400);
  }

  const { data: callerMembership, error: membershipError } = await userClient
    .from("property_members")
    .select("role")
    .eq("property_id", propertyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !callerMembership) {
    return json({ error: "Property membership not found." }, 403);
  }

  if (!["owner", "technical_admin"].includes(callerMembership.role)) {
    return json({ error: "You cannot manage users for this property." }, 403);
  }

  const adminClient = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: usersData, error: listError } =
    await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (listError) {
    return json({ error: listError.message }, 500);
  }

  let targetUser = usersData.users.find(
    (candidate) => candidate.email?.toLowerCase() === email
  );

  let invitationSent = false;

  if (!targetUser) {
    const { data: inviteData, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${appUrl}/admin/accept-invite`,
        data: {
          display_name: displayName || email.split("@")[0],
          invited_property_id: propertyId,
        },
      });

    if (inviteError || !inviteData.user) {
      return json(
        { error: inviteError?.message ?? "Could not invite user." },
        400
      );
    }

    targetUser = inviteData.user;
    invitationSent = true;
  }

  const { error: upsertError } = await adminClient
    .from("property_members")
    .upsert(
      {
        property_id: propertyId,
        user_id: targetUser.id,
        role,
        display_name:
          displayName ||
          String(targetUser.user_metadata?.display_name ?? "") ||
          email.split("@")[0],
        email,
        invited_by: user.id,
        invited_at: new Date().toISOString(),
      },
      { onConflict: "property_id,user_id" }
    );

  if (upsertError) {
    return json({ error: upsertError.message }, 500);
  }

  return json({
    ok: true,
    invitationSent,
    userId: targetUser.id,
    email,
    role,
  });
});
