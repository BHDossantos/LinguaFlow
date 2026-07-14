-- Superseded by 0027_school_taxonomy.sql.
-- This migration added a check constraint on courses.subject, which is a
-- free-text teacher field — it violated on real data (e.g. "AP Biology").
-- Kept as a no-op so ordered replays stay stable.

alter table public.courses drop constraint if exists courses_subject_check;
