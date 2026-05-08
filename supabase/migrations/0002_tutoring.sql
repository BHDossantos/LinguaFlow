-- Tutoring slice: budget cap, Stripe linkage, LiveKit room.

alter table public.tutor_sessions
  add column if not exists max_budget_cents int,
  add column if not exists stripe_payment_intent text,
  add column if not exists livekit_room text,
  add column if not exists last_heartbeat_at timestamptz;

create index if not exists idx_tutor_sessions_student on public.tutor_sessions (student_id, status);
create index if not exists idx_tutor_sessions_tutor on public.tutor_sessions (tutor_id, status);
