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

## Lesson kinds

`vocab`, `grammar`, `listening`, `reading`, `speaking`, `roleplay`, `writing`,
`quiz`, and `code`.

A **`code`** lesson is an interactive, auto-graded coding exercise (runs in a
sandboxed browser worker — no server round-trip). Body shape:

```json
{
  "language": "javascript",
  "prompt": "Write square(n) that returns n times itself.",
  "starter": "function square(n) {\n  // your code here\n}\n",
  "tests": [ { "label": "square(2) === 4", "expr": "square(2) === 4" } ],
  "instructions": "optional extra guidance",
  "solution": "optional reference (revealed only after 3 failed runs)"
}
```

`language` is `"javascript"` (default) or `"python"`. Each test's `expr` is a
boolean expression in that language, evaluated in the same scope as the learner's
code, so it can call the functions they defined. A test passes only when its
expression is exactly `true` / `True`. The lesson completes — and unlocks the
next one under the sequential gate — once **every** test passes. Author tests so
the starter template does *not* already pass.

- **JavaScript** runs in a sandboxed Web Worker (instant, offline).
- **Python** runs via Pyodide (CPython in WebAssembly), fetched once from the
  jsDelivr CDN by the learner's browser on first run — no server, no install.
  Use Python comparisons in `expr` (e.g. `square(2) == 4`); numpy/pandas scalar
  comparisons are graded correctly.
  - Add `"packages": ["numpy", "pandas"]` (python only) to load prebuilt
    Pyodide packages before the code runs — enables real data-science lessons.
    Provide any sample data (e.g. a DataFrame) in the `starter` so tests can call
    the learner's function against it.
  - Add `"matplotlib"` to `packages` to draw charts: any figure the learner's
    top-level code produces is captured (Agg backend) and rendered inline under
    the results. Tests still grade the returned data — put the plotting code in
    the `starter` so the chart appears as soon as the function is correct.
- **SQL** (`"language": "sql"`) runs real SQLite in the browser via sql.js.
  Instead of `tests`, give a `schema` (DDL + seed) and a reference `solution`
  query; the learner's query is graded by comparing its result set to the
  solution's (column names ignored). Set `"ordered": true` for lessons that
  teach ORDER BY. Example body:
  ```json
  {
    "language": "sql",
    "prompt": "Return the names of customers in Lisbon.",
    "schema": "CREATE TABLE customers(...); INSERT INTO customers VALUES (...);",
    "starter": "SELECT * FROM customers;",
    "solution": "SELECT name FROM customers WHERE city = 'Lisbon';"
  }
  ```

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
