# Noelia — Pricing & Packaging (proposal)

Three revenue lines: **(A) Consumer subscriptions**, **(B) Live tutoring**, and
**(C) Schools / institutions**. Prices are in USD. Annual billing ≈ 2 months
free. All figures are launch targets — tune with real conversion data.

Design principles:
- **Self-study is cheap; assistance is the upsell.** The "coach" features
  (conversational coach, system roleplay, word-by-word pronunciation scoring,
  instant grading, real-time translate) run on the Claude API and carry real
  per-use cost — so they sit above the self-study tier and have fair-use caps.
- **Human time is metered.** Live tutoring is à-la-carte or bundled minutes with
  a marketplace take rate; it never gets "unlimited."
- **Content is owned/openly-licensed → ~zero marginal cost**, so self-study can
  be priced aggressively to win users, then expanded to assistance + humans.

---

## A) Consumer subscriptions — Free + Bronze / Silver / Gold / Platinum

| | **Free**<br>Explorer | **Bronze**<br>Self-Study | **Silver**<br>Coached | **Gold**<br>Accelerate | **Platinum**<br>Mastery |
|---|---|---|---|---|---|
| **Monthly** | $0 | **$8.99** | **$16.99** | **$34.99** | **$79.99** |
| **Annual** (save) | $0 | **$79** (‑27%) | **$149** (‑27%) | **$299** (‑29%) | **$699** (‑27%) |
| Full course catalog (all 159 courses, 6 languages, 5 schools) | 1 track, 3 lessons/day | ✅ unlimited | ✅ | ✅ | ✅ |
| Spaced-repetition reviews, streaks, progress | limited | ✅ | ✅ | ✅ | ✅ |
| Offline lessons, no ads | — | ✅ | ✅ | ✅ | ✅ |
| **Coach assistance** (chat coach, hints, explanations) | — | — | ✅ ~50 msgs/day | ✅ ~200/day | ✅ unlimited* |
| **System roleplay** (scenario practice) | — | — | ✅ | ✅ | ✅ |
| **Pronunciation scoring** (word-by-word) | — | — | ✅ | ✅ | ✅ |
| **Instant grading** (writing/assignments) | — | — | ✅ | ✅ | ✅ |
| **Real-time translate** (voice + text) | — | — | ✅ | ✅ | ✅ |
| Certificates of completion | — | — | — | ✅ | ✅ verified |
| **Live tutoring credits included** | — | — | — | **60 min/mo** | **240 min/mo** |
| Family profiles | — | 1 | 1 | up to 3 | up to 6 |
| Priority support / early features | — | — | — | ✅ | ✅ + 1:1 onboarding |

\* "Unlimited" = generous fair-use; abuse soft-throttles rather than bills.

**Why these numbers**
- **Bronze $8.99** is the "just use the app" tier you asked for — everything to
  learn, no assistance. It sits right at Duolingo Super (~$7–13) but offers far
  more (languages **and** math/science/tech/business), so it's an easy yes.
- **Silver $16.99** is the flagship: it turns on the assistance layer. Priced
  below Duolingo Max (~$30) and Babbel bundles while doing more.
- **Gold $34.99** adds *human* minutes + certificates — competes with
  self-study + a little tutoring elsewhere, bundled cheaper.
- **Platinum $79.99** is for serious learners / exam candidates: heavy tutoring
  allotment + unlimited assistance. High-margin flagship.

**Trials & discounts**: 7-day free trial on Silver+; **students −30%**;
occasional annual promos. Downgrades keep access to end of period.

**Unit economics note**: assistance cost is bounded by the per-tier daily caps;
at these caps, gross margin stays healthy even before volume discounts on API.

---

## B) Live tutoring (à-la-carte, stacks on any plan)

Real humans over live video (LiveKit). Gold/Platinum include monthly minutes;
everyone can buy more.

| Option | Price | Effective /min |
|---|---|---|
| **Instant connect — standard tutor** | $1.25/min ($75/hr) | 1.25 |
| **Instant connect — expert / certified** | $1.75/min ($105/hr) | 1.75 |
| **Bundle — 60 min** | $59 | 0.98 |
| **Bundle — 180 min** | $149 | 0.83 |
| **Bundle — 600 min** | $429 | 0.72 |
| **Group / class session** (per seat, ≤6) | $12/seat/hr | — |
| First session (new users) | **10 min free** | — |

- **Tutor payout ≈ 70%**, platform keeps ≈ 30% (covers LiveKit + ops + margin).
- Bundle credits expire 12 months; included plan minutes expire monthly.
- Booking: instant "connect now" or scheduled; cancellation ≥2h = free.

---

## C) Schools & institutions (annual, B2B)

| | **Classroom** | **School** (per-student) | **District / Enterprise** |
|---|---|---|---|
| **Price** | **$499/yr** flat | **$15/student/yr** (volume tiers below) | **Custom** |
| Best for | one teacher / tutor / microschool | a whole school | multi-school / district |
| Students | up to 40 | 50+ (min) | unlimited |
| Teacher dashboards, rostering | ✅ | ✅ | ✅ |
| Assignments + **auto-grading** | ✅ | ✅ | ✅ |
| **Live class meetings** (video) | 1 room | ✅ | ✅ |
| Family / parent visibility | ✅ | ✅ | ✅ |
| Standards-alignment reporting (CEFR / Common Core) | basic | ✅ | ✅ advanced |
| Admin console, bulk provisioning | — | ✅ | ✅ |
| **SSO** (Google / Clever / SAML), SIS/LMS integration | — | add-on | ✅ |
| Dedicated success manager, SLA | — | — | ✅ |

**Per-student volume tiers (School):**

| Students | Price / student / yr |
|---|---|
| 50–99 | $15 |
| 100–499 | $12 |
| 500–999 | $9 |
| 1,000+ | $7 |

**Institutional add-ons**
- **Coach assistance for students**: +$5/student/yr (the AI layer, with
  classroom-safe guardrails). Optional — many schools start without it.
- **Live-tutoring pool**: à-la-carte at the rates in section B, centrally billed.
- **Verified certificates**: included in Enterprise; +$2/student/yr otherwise.

**Discounts**: Title I / low-income schools −40%; nonprofits −30%; multi-year
prepay −10%; pilot classrooms free for one term.

---

## Rollout notes

1. **Assistance tiers depend on `ANTHROPIC_API_KEY`.** Until it's set, Silver+
   assistance features show the graceful "offline" banners already built; sell
   Silver+ as "launching soon" or keep Bronze as the paid entry until the key is
   in. (This is the deferred key you mentioned.)
2. Stripe is already integrated (checkout + webhook fulfillment). This proposal
   maps to Stripe **Products** = tiers, **Prices** = monthly/annual, plus
   metered **usage** for tutoring minutes.
3. Recommended launch order: Bronze + Silver first (simple), add Gold/Platinum
   once tutoring supply exists, then open Schools with the Classroom plan.
