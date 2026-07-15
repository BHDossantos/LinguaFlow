# Curriculum ingestion pipeline

Turn an open academic source into Noelia courses without hand-writing SQL.

```
External source → connector → interchange JSON → build-sql.mjs → seed SQL → Supabase
     (structure)   (per source)   (schema.json)    (normalize)     (idempotent)   (Run)
```

## Steps

1. **Connector** — for a source (OpenStax book, CK-12 FlexBook, MIT OCW course),
   collect the *structure* (chapters, learning objectives, sequence) and author
   original lesson prose against it. Emit one interchange JSON file per course
   conforming to [`schema.json`](./schema.json).
2. **Normalize** — `node scripts/ingest/build-sql.mjs <file>.json` validates the
   interchange (lesson kinds, quiz answers 0–3 with 4 options, body shapes, UUID,
   school enum, attribution present) and writes an idempotent
   `supabase/seed/curriculum/<slug>.sql`.
3. **Review** — a human reads the generated course before publishing.
4. **Load** — paste the SQL into the Supabase SQL Editor (or add to the seed set).

## Source catalog

| Source | Best for | License | Use |
|---|---|---|---|
| MIT OpenCourseWare | CS, math, engineering | CC BY-NC-SA | structure |
| OpenStax | university math/science/business/social | CC BY 4.0 | structure |
| CK-12 | K-12 math & science | CC BY-NC | structure |
| OER Commons | broad library | various CC | structure |
| CEFR | languages A1–C2 | Council of Europe | objectives |
| Common Core | K-12 math/ELA | public | objectives |
| ACM Computing Curricula | CS competencies | ACM | objectives |
| AWS / Microsoft Learn / Google Cloud | certification tracks | vendor | objectives |
| Khan Academy | subject sequencing | — | **inspiration only, never scraped** |

## Golden rules

1. Only openly licensed **structure/objectives**. Prose is written fresh.
2. Every course description **credits its source** (build-sql enforces this).
3. **Human review before publish.** The pipeline drafts; people approve.

## Example

```
node scripts/ingest/build-sql.mjs scripts/ingest/examples/example_openstax_psychology.json
# → supabase/seed/curriculum/introduction_to_psychology.sql (10 lessons)
```

Standards alignment (which course covers which CEFR/Common Core/ACM descriptor)
lives in `supabase/seed/curriculum_graph_seed.sql` and the
`0028_curriculum_graph.sql` migration.
