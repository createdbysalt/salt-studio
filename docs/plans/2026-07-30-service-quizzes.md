# Service Quizzes — editable quiz funnels + Leads pipeline + website audit

**Date:** 2026-07-30 · **Status:** APPROVED, implementing
**Predecessor:** `2026-07-27-salt-score-quiz.md` (the hardcoded Salt Score at `/quiz` — stays live and untouched)

## What we're building

Three service-specific quizzes — one per door (AI Automations, Websites, Software) — as **editable `quiz` documents in Sanity**, rendered through one shared engine at `/quiz/[slug]`. Each quiz is a conversion funnel: score bands carry their own result copy, benefit bullets, and CTA (book a discovery call vs. email/waitlist nurture). The Leads folder becomes a lightweight pipeline. The Websites quiz runs a live automated audit of the visitor's site.

## Decisions

1. **Quiz content in Sanity, scoring engine in code.** Amends the 07-27 "questions in code" decision, which was made for a single quiz. The generic weighted-sum + band-threshold engine stays in `lib/quiz/dynamic.ts`; questions, option weights, band thresholds, and all result copy live in the `quiz` document. Server action re-fetches the published quiz doc and re-scores raw answers, preserving the tamper-proofing.
2. **`/quiz` (Salt Score) is untouched.** It keeps its own config/scoring/action. Follow-up (not this build): convert it to a short router quiz that hands off to the service quizzes.
3. **Per-band results are the conversion surface.** Band = `label + minScore + resultHeadline (+{score} placeholder) + resultBody + benefits[] + primary/secondary CTA`. High scorers get pushed to the discovery call; low scorers get nurtured (email already captured at the gate) instead of a call they won't book.
4. **Leads pipeline via `status` on `quizSubmission`** — `new → contacted → call-booked → won → lost`. The only editable field on an otherwise read-only document. Desk structure: Leads → Quizzes, All Submissions, then one filtered list per status.
5. **Submissions reference their quiz.** New dynamic submissions set `quiz` (reference) + `quizTitle` snapshot; legacy Salt Score fields (`track`, `businessType`, …) remain for old submissions.
6. **Website audit = PageSpeed Insights + direct-fetch checks.** `lib/audit/website.ts` calls the free PSI API (performance/SEO/accessibility/best-practices + LCP/CLS) and does one fetch of the page for title/meta/OG/viewport/https checks. Question `kind: 'url'` on any quiz collects the URL; results screen runs the audit async with a loading state. Optional `PAGESPEED_API_KEY` raises the rate limit.
7. **Quiz docs are created as drafts, never auto-published** (no-placeholder-CMS-content rule). Gabriella reviews copy in the Studio before publishing.
8. **New quiz routes ship `noindex`,** matching the Salt Score launch gate; they're reached via each service's `fitCheckHref`.

## Files

| Area               | Path                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| Quiz schema        | `sanity/schemas/documents/quiz.ts` (+ registration in `sanity.config.ts`)                                |
| Submission changes | `sanity/schemas/documents/quizSubmission.ts` (`quiz` ref, `quizTitle`, `status`)                         |
| Desk structure     | `sanity/plugins/deskStructure.tsx` (Leads → Quizzes + pipeline views)                                    |
| Engine (pure)      | `lib/quiz/dynamic.ts`                                                                                    |
| Queries            | `sanity/lib/queries.ts` (`quizBySlugQuery`, `quizSlugsQuery`)                                            |
| Route              | `app/(personal)/quiz/[slug]/page.tsx`                                                                    |
| UI                 | `components/DynamicQuizFlow.tsx`, `components/DynamicQuizResults.tsx`, `components/WebsiteAuditCard.tsx` |
| Server actions     | `app/actions/dynamicQuiz.ts`, `app/actions/audit.ts`                                                     |
| Audit lib          | `lib/audit/website.ts`                                                                                   |

## Success criteria

Same commercial gate as the Salt Score plan (bridge-period funnel): quiz completions → booked discovery calls per service, tracked via existing quiz analytics events (`quiz_name` = quiz slug) and the Leads status pipeline.
