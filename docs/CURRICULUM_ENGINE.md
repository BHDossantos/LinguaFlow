# The Curriculum Engine

Noelia does not hand-write thousands of courses. It runs a pipeline that pulls
*structure* from trusted academic sources, normalizes it into one internal
format, aligns it to machine-readable standards, and expands it into reviewed
lessons. The courses are data flowing through the engine.

```
   External sources                 Engine                          Product
 ┌──────────────────┐      ┌──────────────────────────┐      ┌────────────────┐
 │ MIT OCW          │      │ connectors               │      │ Postgres        │
 │ OpenStax         │─────▶│   ↓ interchange JSON     │─────▶│  courses        │
 │ CK-12            │      │ normalizer (build-sql)   │      │  lessons        │
 │ CEFR / ACM       │      │   ↓ idempotent seed SQL  │      │  standards      │
 │ Common Core      │      │ knowledge graph          │      │  descriptors    │
 │ Certifications   │      │   standards+descriptors  │      │  course_standards│
 └──────────────────┘      │   +alignment mappings    │      │  student_mastery │
                           │ human instructional review│     └────────┬───────┘
                           └──────────────────────────┘              ▼
                                                              Student platform
```

## The knowledge graph (migration `0028_curriculum_graph.sql`)

| Table | Purpose |
|---|---|
| `curriculum_sources` | where structure came from (MIT OCW, OpenStax, CK-12, …) with license |
| `standards` | frameworks: CEFR, Common Core Math, ACM Computing Curricula |
| `standard_descriptors` | individual competencies / can-do statements |
| `course_standards` | which standards each course covers (the alignment map) |
| `courses.source_id` / `source_ref` | provenance stamped on each course |

Seeded by `supabase/seed/curriculum_graph_seed.sql`: 37 descriptors (CEFR A1–C1
× 5 skills, Common Core math domains, ACM knowledge areas) and 137 course→standard
alignments. Every language course auto-aligns to its CEFR level via a join, so
new language courses are covered the moment they're added. The course page shows
these as "Aligned to" chips.

## How the current 36 courses were produced

Each was built through this pipeline: the source's public table of contents
determined the unit sequence, then lessons were authored as original prose
against it (diagnostic → readings with worked examples and answered practice →
checkpoints → project → final), validated (JSON shape, quiz answers, executed
code traces for programming courses), and reviewed before publish. Sources:
OpenStax (Statistics, Business, Biology, Psychology), CK-12 (Geometry), MIT OCW
6.0001 (Intro CS), CEFR (all five languages A1→C1).

## Add the next source in 4 steps

1. Write a connector that outputs one interchange JSON per course (see
   `scripts/ingest/schema.json` and the Psychology example).
2. `node scripts/ingest/build-sql.mjs your_course.json` → generated seed SQL.
3. Add standards descriptors + `course_standards` rows if the source maps to a
   framework not yet in the graph.
4. Human review, then load the SQL into Supabase.

Full source catalog and licensing rules: `scripts/ingest/README.md`.
