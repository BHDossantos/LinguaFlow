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

    // Unlock the Checkpoint quiz (position 6) in the Spanish essentials course
    // for quiz.spec: lessons open sequentially, so the quiz is only reachable
    // once the prior lessons are done. Mark lessons 1-5 complete for the test
    // user — exactly the state a real student reaches the checkpoint in.
    await seedCheckpointProgress().catch((e) =>
      console.warn(`[e2e setup] could not pre-complete lessons for the quiz gate: ${e}`),
    );
  }
}

const ESSENTIALS_COURSE = "11111111-1111-1111-1111-111111111112";

async function seedCheckpointProgress() {
  const admin = {
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
  };

  // Resolve the test user's id.
  const usersRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=200`, { headers: admin });
  const usersBody = (await usersRes.json()) as { users?: { id: string; email: string }[] };
  const userId = (usersBody.users ?? []).find((u) => u.email === TEST_USER.email)?.id;
  if (!userId) throw new Error("test user not found");

  // The lessons that gate the checkpoint (positions 1-5).
  const lessonsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/lessons?select=id,position&course_id=eq.${ESSENTIALS_COURSE}&position=lte.5`,
    { headers: admin },
  );
  const lessons = (await lessonsRes.json()) as { id: string; position: number }[];
  if (!Array.isArray(lessons) || lessons.length === 0) throw new Error("essentials lessons not seeded");

  const now = new Date().toISOString();
  const rows = lessons.map((l) => ({ user_id: userId, lesson_id: l.id, completed_at: now, score: 100 }));
  const up = await fetch(`${SUPABASE_URL}/rest/v1/lesson_progress`, {
    method: "POST",
    headers: { ...admin, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(rows),
  });
  if (!up.ok) throw new Error(`lesson_progress upsert failed: ${up.status} ${await up.text()}`);
}

export default globalSetup;
