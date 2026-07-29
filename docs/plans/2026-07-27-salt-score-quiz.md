# The Salt Score — branched automation-potential quiz

**Date:** 2026-07-27 · **Status:** PLAN (no code yet)
**Strategy source:** approved office-hours design doc `~/.gstack/projects/createdbysalt-salt-studio/gabriellamartins-main-design-20260727-110546.md` + branching research revision (2026-07-27).
**Related:** `salt-studio-knowledge-base/studio/website/strategy/SERVICES.md` (services plan this funnel feeds).

## What we're building

A free two-phase quiz at `/quiz` — "How much of your business could be automated?" — that scores the visitor, then routes them to the right offer: **paid automation audit** ($500–1.5K, primary CTA for solo/small), **AI-build intro call** (orgs/institutions), **$5.5K Salt site** (secondary when the website is flagged), **Salt waitlist** (everyone, last). Submissions stored in Sanity and emailed to hello@ via the existing Resend path.

**One promise, branched by who they are (not by our services):** research says quizzes convert when they answer a question the visitor has about _themselves_ (25–50% of starters; single email field beats multi-field by 57%; adaptive paths beat linear; emotional question early lifts completion ~34%). So: no "which service do you want?" question — Q1/Q2 fork the _diagnostic path_, and routing happens from what their answers reveal.

## Locked decisions

| Decision     | Value                                                                                                                                                                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branch rule  | ORG track if business type = school/university/institution OR team ≥ 10; otherwise SOLO track                                                                                                                                                                                |
| Scoring      | Static weights in one config object — no AI, no server round-trip for scoring                                                                                                                                                                                                |
| Solo result  | "~N hours/week could run themselves" + ranked top-3 workflows                                                                                                                                                                                                                |
| Org result   | Qualitative band (Emerging / Significant / High automation potential) + 3 tailored observations                                                                                                                                                                              |
| Email gate   | Single email field + consent line linking the privacy legal page, shown before results                                                                                                                                                                                       |
| Anti-abuse   | Honeypot field + server-side validation only (no rate-limit store at launch)                                                                                                                                                                                                 |
| Storage      | Sanity `quizSubmission` document (write token via server action), plus notification email per submission                                                                                                                                                                     |
| Results UX   | Single route `/quiz` with client-side phases (questions → gate → results). Deviation from the design doc's `/quiz/results`: a separate results URL would need a persisted token or spoofable query params; client state is simpler and the results aren't shareable content. |
| Launch gate  | Page deploys unlinked + `noindex`. Nav/services links and social distribution only after the first audit sale (per design doc).                                                                                                                                              |
| Quiz content | Lives in code (`lib/quiz/config.ts`), not Sanity — questions are product logic coupled to scoring, and the no-placeholder-content rule applies to the dataset. CTA URLs (Stripe, Cal.com) live in env/site settings so Gabriella can swap them.                              |

## The questions

### Shared openers (everyone)

**Q1 — business type** · "What kind of business are you?"
Solo service business (design, coaching, consulting, creative…) · Small studio or team · Nonprofit, church, or community organization · School, university, or larger institution · Something else

**Q2 — team size** · "How many people are on your team?"
Just me · 2–9 · 10–50 · 50+

**Q3 — the hook (free text, early per research)** · "What's the one task you'd pay to never do again?"
Placeholder: "Chasing invoices… rewriting the same email… say it like it is." Optional but encouraged. This answer is Salt roadmap gold and must reach Gabriella's inbox verbatim.

→ **Branch** (rule above).

### SOLO track — S1–S5, hours/week each

Scale for all five: None · ~1–2 hrs · ~3–5 hrs · ~6–10 hrs · 10+ hrs (midpoints 0 / 1.5 / 4 / 8 / 12)

| #   | Question                                                                                  | Weight |
| --- | ----------------------------------------------------------------------------------------- | ------ |
| S1  | "Client intake — collecting info, forms, and back-and-forth before the real work starts?" | 0.80   |
| S2  | "Scheduling — booking, rescheduling, reminders?"                                          | 0.90   |
| S3  | "Follow-ups — chasing replies, sending check-ins and nudges?"                             | 0.85   |
| S4  | "Proposals and first drafts — quotes, outlines, documents started from scratch?"          | 0.70   |
| S5  | "Invoicing and chasing payments?"                                                         | 0.90   |

Score = Σ(weight × hours midpoint), displayed as "~N hours/week." Weights are admitted guesses; calibrate from real submissions + concierge replies.

### ORG track — O1–O5

| #   | Question                                                                                                           | Options                                                                                      | Scoring role                                        |
| --- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| O1  | "How many repetitive questions does your team answer every week — from clients, members, students, or the public?" | A handful · Dozens · Hundreds · It never stops                                               | Assistant potential (high weight)                   |
| O2  | "Where does the knowledge people need actually live?"                                                              | Well-organized docs · Scattered files and PDFs · Mostly in people's heads · All of the above | Knowledge-base potential                            |
| O3  | "How many hours a week does staff spend moving information between systems — entering, re-entering, routing?"      | Same hours scale as solo                                                                     | Workflow potential (high weight)                    |
| O4  | "How many people does a typical decision or approval touch?"                                                       | One · 2–3 · 4+ · Committees                                                                  | Complexity signal (informs pilot pitch, low weight) |
| O5  | "Is your organization using AI tools today?"                                                                       | Not really · A few individuals experiment · Team-wide                                        | Readiness modifier (not scored)                     |

Band thresholds: defined in config; start with simple tertiles of the weighted sum and tune.

### Shared closer (everyone)

**Q9 — website flag** · "Is your current website part of the problem?"
Yes — outdated or hard to update · Sort of — it's fine, but it doesn't bring in inquiries · No — the website's good

### Email gate

"Your Salt Score is ready. Where should we send the breakdown?" — single email field + waitlist checkbox ("Keep me posted on Salt — the tool we're building that does this work for you") + consent line linking `/legal/<privacy-slug>`.

### Results routing (precedence per design doc)

1. ORG track → primary CTA: **book an AI-build intro call** (Cal.com)
2. SOLO track → primary CTA: **book the paid automation audit** (Stripe payment link + Cal.com)
3. Q9 = yes or sort-of → secondary CTA: **the Salt site** ($5.5K package, links to services/contact)
4. Everyone → **Salt waitlist** confirmation of the checkbox state, rendered last

## Files to create / modify

| File                                         | New/Mod      | What                                                                                                                                                              |
| -------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/quiz/config.ts`                         | New          | Question definitions, branch rule, weights, band thresholds, CTA URL resolution — one config object                                                               |
| `lib/quiz/scoring.ts`                        | New          | Pure functions: solo score, org band, top-3 ranking. No React, unit-testable                                                                                      |
| `sanity/schemas/documents/quizSubmission.ts` | New          | All answers, email, track, score, `waitlistOptIn`, `source` (UTM/referrer), timestamps; `readOnly` fields                                                         |
| `sanity.config.ts`                           | Mod          | Register `quizSubmission`                                                                                                                                         |
| `sanity/plugins/deskStructure.tsx`           | Mod          | "Quiz submissions" list (read-only) so entries are visible in the Studio                                                                                          |
| `app/actions/quiz.ts`                        | New          | Server action mirroring `app/actions/contact.ts`: validate, honeypot check, Sanity create (write token), Resend notification with Q3 verbatim in the subject/body |
| `components/QuizFlow.tsx`                    | New (client) | Stepper: one question per screen, progress bar, branch logic, gate phase, results phase. DECIDE-surface styling per design.md                                     |
| `components/QuizResults.tsx`                 | New          | Score display + routed CTAs                                                                                                                                       |
| `app/(personal)/quiz/page.tsx`               | New          | Server page, metadata with `robots: noindex` until launch gate lifts                                                                                              |
| `lib/analytics/events.ts`                    | Mod          | `trackQuizStart`, `trackQuizStep(step, track)`, `trackQuizGate`, `trackQuizComplete(track, score)`, CTA clicks via existing `trackCTAClick`                       |
| `.env.example`                               | Mod          | Document `SANITY_API_WRITE_TOKEN`, `NEXT_PUBLIC_QUIZ_AUDIT_PAYMENT_URL`, `NEXT_PUBLIC_QUIZ_CALL_URL`                                                              |
| `sanity.types.ts` / `schema.json`            | Generated    | Via typegen — never hand-edit                                                                                                                                     |

Explicitly **not** in scope: PDF reports, AI-written analysis, CRM sync, dashboards, A/B testing, rate-limit store, `/quiz/results` as a separate route, nav/services links (launch-gated).

## Steps (tool for each — qcode executes in this order)

1. **Commercial inputs (blocker, Gabriella, ~1 hr):** audit price point, Stripe payment link, Cal.com event links. Verify a privacy `legalPage` exists in the dataset — check via Sanity MCP (`query_documents` on `legalPage`); if missing, create the doc content first (no placeholder content).
2. **Schema:** write `quizSubmission.ts`, register it, add desk entry — `Edit`/`Write` tools, then **`qtypes`** (`npm run typegen`).
3. **Config + scoring:** `lib/quiz/config.ts` + `lib/quiz/scoring.ts` — `Write` tool. Include the weights table above verbatim as the starting values.
4. **Server action:** `app/actions/quiz.ts` — `Write` tool, mirroring `contact.ts` (Resend init pattern, graceful no-op if unconfigured, honeypot).
5. **UI:** `QuizFlow`, `QuizResults`, `quiz/page.tsx` — **`/frontend-design` skill**. Constraints: server component page + one client island; design.md DECIDE-surface rules (quiet, exact, no expressive scroll); reduced-motion collapses transitions to opacity; mobile-first (quizzes are majority-mobile).
6. **Analytics:** extend `lib/analytics/events.ts` — `Edit` tool, following the existing typed-helper pattern.
7. **Copy pass:** all question copy, gate copy, results copy — **`salt-voice` skill** (COPY-VOICE rules: direct, concrete, no "craft"; conversion surface, not poetry).
8. **Verify:** **`qcheck`** — `npm run type-check` + `npm run lint`; confirm no bare `client.fetch`, write token stays server-only.
9. **QA:** **`webapp-testing` skill** (Playwright) — both tracks end-to-end, branch correctness, honeypot rejection, empty/error states, Resend no-op mode, mobile viewport, reduced motion.
10. **Launch gate (not a build step):** deploy unlinked + noindex → **first audit sale** → then lift: nav/services links, remove noindex, add sitemap entry, start the traffic plan (warm outreach weekly, 1–2 social posts/week).

## Success criteria (from the design doc)

≥2 paid audits in 30 days; ≥1 website lead + ≥10 waitlist signups attributable via `source`; Q3/Q8 answers feeding the Salt roadmap. Failure branch: zero audit sales in 30 days → quiz stays as waitlist/research instrument only.
