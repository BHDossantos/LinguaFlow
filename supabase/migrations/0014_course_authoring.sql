-- Course authoring: teachers can create and manage their own courses.
--
-- 0001 only created "courses public read" (published = true), so course
-- INSERT was blocked by RLS for everyone except the service role. The seed
-- files masked this (they run as superuser); the teach e2e caught it:
-- "new row violates row-level security policy for table courses".
--
-- This also lets teachers SELECT their own unpublished courses, which the
-- /teach listing needs once drafts exist.

create policy "courses teacher manage" on public.courses
  for all using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

-- vocab_items is a shared vocabulary pool that learners populate implicitly:
-- rating a card upserts the item (see rateCardForUser). 0001 only granted
-- public read, so every SRS rating failed RLS (42501) for real users —
-- the seed data masked it. Allow signed-in users to add and refresh entries.
create policy "vocab authenticated insert" on public.vocab_items
  for insert to authenticated
  with check (true);

-- Upsert's ON CONFLICT DO UPDATE path also needs UPDATE permission.
create policy "vocab authenticated update" on public.vocab_items
  for update to authenticated
  using (true) with check (true);
