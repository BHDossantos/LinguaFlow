import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TEST_USER } from "./env";

// Verifies the local dev stack is reachable and the test user exists before
// any spec runs. Fails fast with an actionable message if the stack is down.
async function globalSetup() {
  const health = `${SUPABASE_URL}/auth/v1/health`;
  try {
    const r = await fetch(health);
    if (!r.ok) throw new Error(`status ${r.status}`);
  } catch (e) {
    throw new Error(
      `Local Supabase stack not reachable at ${health} (${e}).\n` +
        `Start it first:  set -a && . .env.local && set +a && bash devstack/setup.sh`,
    );
  }

  // Ensure the test user exists (idempotent — ignores "already registered").
  if (SUPABASE_SERVICE_ROLE_KEY) {
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
        email_confirm: true,
      }),
    }).catch(() => {});
  }
}

export default globalSetup;
