-- Course prerequisites (blueprint §2.9), as ordered recommendations.
-- NOTE: this migration originally tried to reuse courses.subject for the
-- school taxonomy — but subject has been a free-text teacher field since
-- 0003 ("AP Biology" etc.), so that collided with real data. The taxonomy
-- now lives in courses.school (see 0027); this file keeps only the
-- prerequisite piece.

alter table public.courses
  add column if not exists prerequisite_ids uuid[] not null default '{}';
