# Top-University Open Courseware — ingestion allowlist

Noelia advertises, on the landing page, the academic sources its curriculum is
adapted from. **Every name shown must be a source we genuinely used and cite.**
This file is the allowlist the ingestion pipeline (and the daily agent) draws
from when adding university-sourced courses.

## The rule (non-negotiable — this is public-facing provenance)

A university may appear on the landing "Built on world-class open courseware"
strip **only after** at least one real course adapted from its genuinely
open-licensed materials exists in the catalog with `source_id` set. Order of
operations, always:

1. Confirm the resource is **openly licensed** (Creative Commons, or an explicit
   "open educational use" grant). If the license is unclear or "all rights
   reserved," **do not use it.**
2. Adapt only the **topic structure / syllabus progression** — facts and order,
   which are not copyrightable. Write **100% original prose**. Never copy
   lecture text, problem sets, or figures.
3. Author the course through `scripts/ingest/build-sql.mjs` (must print "✓").
4. Register the source in `supabase/seed/curriculum_graph_seed.sql`
   (`curriculum_sources`) and set the course's `source_id`.
5. Only then add the university's name to `SOURCES_ADAPTED` in
   `src/app/page.tsx` and ship — so the strip is true at deploy time.

If any step can't be completed honestly, stop and leave the strip unchanged.

## Verified sources (already in the catalog — safe to feature)

| Source id | Institution | Resource | License |
|-----------|-------------|----------|---------|
| `mit_ocw` | MIT | MIT OpenCourseWare | CC BY-NC-SA 4.0 |
| `harvard_cs50` | Harvard University | CS50 — Intro to Computer Science | CC BY-NC-SA 4.0 |
| `stanford` | Stanford University | Stanford Online | CC BY-NC-SA 4.0 |
| `cambridge` | University of Cambridge | Isaac Physics | Open educational use |
| `yale` | Yale University | Open Yale Courses | CC BY-NC-SA 3.0 |
| `jhsph` | Johns Hopkins | Bloomberg School of Public Health OCW | CC BY-NC-SA 3.0 |
| `cmu_oli` | Carnegie Mellon | Open Learning Initiative | CC BY-NC-SA 4.0 |
| `openstax` | Rice University | OpenStax | CC BY 4.0 |
| `ck12` | CK-12 Foundation | CK-12 | CC BY-NC 3.0 |

## Candidate resources (genuinely open — verify the specific course license first)

Add these as the agent authors real courses from them. Do **not** put the name
on the strip until a course exists.

| Institution | Open resource | Typical license | Notes |
|-------------|---------------|-----------------|-------|
| University of Oxford | Oxford Podcasts / Oxford Open materials | mixed CC BY-NC-SA/-ND | check per item; avoid ND for adaptation |
| UC Berkeley | Berkeley open courseware, Data-8 ecosystem | mixed CC | some ND — verify |
| University of Michigan | open.umich.edu | CC BY | clean, permissive |
| TU Delft | TU Delft OpenCourseWare | CC BY-NC-SA | strong in engineering |
| Open University (UK) | OpenLearn | CC BY-NC-SA 4.0 | very broad |
| Imperial College London | open teaching resources | mixed | verify per item |
| Columbia University | select open courses | mixed | verify per item |
| Princeton University | select open booksites | often all-rights-reserved | usually NOT usable — verify |

## What "top 15" means here

We interpret it loosely as globally-recognized, elite institutions whose names
add credibility. Prestige alone is never enough — the **open license is the gate.**
A lesser-known university with a clean CC-BY resource is preferred over a famous
one with no open license.
