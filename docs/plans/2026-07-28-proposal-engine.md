# Proposal Engine — Custom proposals → selection → Stripe → contract → WhatsApp

**Date:** 2026-07-28
**Status:** Plan (no code written yet)
**Author:** Gabriella + Claude (qplan)

---

## The dream (in one line)

A client gets a private link to a proposal built from Salt's real services. They see everything that could be done, pick the deliverables or a package they want, choose how they pay (one-off, deposit, or split monthly), pay through Stripe, and on payment the system auto-generates a contract to sign and opens a 1:1 WhatsApp project thread with Gabriella.

## Decisions locked (2026-07-28)

| Fork          | Decision                                                                                                                                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data home** | **Hybrid** — service catalog + proposal _templates_ stay in Sanity; live proposal _instances_ (selections, payment state, contract state) live in **Postgres (Neon via Vercel Marketplace)**                            |
| **Contracts** | **Dropbox Sign API** (embedded signing, stays on `createdbysalt.com`)                                                                                                                                                   |
| **Payments**  | **Both** — Stripe Invoicing for one-off/deposit **and** payment-plan/subscription for "split into monthly bills"                                                                                                        |
| **WhatsApp**  | **1:1 project thread** (no group — WhatsApp API can't auto-add to groups). Auto-open a direct WhatsApp Business conversation with a templated welcome.                                                                  |
| **Languages** | **English + Brazilian Portuguese (pt-BR).** Each proposal carries a `locale`; the whole downstream chain (page, emails, contract, WhatsApp, Stripe) renders in that language. Built in from the start, not retrofitted. |

## Guardrails (from project memory)

- **No placeholder CMS content** — build every UI to degrade against empty Sanity data; do not seed demo proposals into production. See `[[no-placeholder-cms-content]]`.
- **Three-door service model** is live: Websites (from $2,500), AI Automations (retainer from $600/mo + pilots from $15k), Software (from $25k). Proposals must express both **one-off** (Websites/Software) and **recurring** (AI Automations) pricing. See `[[services-three-door-restructure]]`.
- **Every Sanity field needs a description + validation message** (client edits these). Follow `sanity/CLAUDE.md` conventions.
- **Never hand-edit `sanity.types.ts` / `schema.json`** — change schema, run `npm run typegen`.
- **Reads through `sanityFetch`**, all GROQ via `defineQuery`. Writes need a `server-only` write-token wrapper (see `app/api/CLAUDE.md`).
- This is **Next.js 16** — async `params`/`draftMode()`, verify APIs against `node_modules/next/dist/docs/` or Context7, not memory.

---

## Architecture at a glance

```
┌─────────────────────────────────────────────────────────────┐
│  SANITY (content — Gabriella edits)                          │
│  • service (exists: deliverables, timeline, priceLine…)      │
│  • + package        (bundled deliverables at a fixed price)  │
│  • + deliverable-as-line-item pricing on service            │
│  • + proposalTemplate (reusable proposal skeleton)          │
│  • + contractTemplate (Dropbox Sign template id + clauses)  │
└───────────────┬─────────────────────────────────────────────┘
                │  read at build/request via sanityFetch
                ▼
┌─────────────────────────────────────────────────────────────┐
│  POSTGRES / Neon (transactional state — the app writes)     │
│  • proposal   (instance: client, token, snapshot of catalog)│
│  • selection  (what the client checked / package chosen)    │
│  • payment    (stripe ids, plan type, status)               │
│  • contract   (dropbox sign request id, status)             │
│  • event log  (webhook + state-machine audit trail)         │
└───────────────┬─────────────────────────────────────────────┘
                │
   ┌────────────┼─────────────┬──────────────┬────────────────┐
   ▼            ▼             ▼              ▼                ▼
 Public      Stripe       Dropbox Sign   WhatsApp        Resend
 proposal    (invoice +   (embedded      (Business       (email
 page        subscription) signing)      Cloud API 1:1)  fallbacks)
 /p/[token]
```

**State machine (the spine):**
`draft → sent → viewed → selected → invoiced → paid → contract_sent → signed → onboarded`
Every transition is written to the event log and is idempotent (webhooks can fire twice).

---

## Proposal content blueprint (what goes in every proposal)

Backed by `docs/research/2026-07-28-high-converting-proposals.md`. **Sent after the discovery call**, so the proposal is ~90% reusable per-service template + a thin per-client customization layer from what we learned on the call. Winning proposals average **~7 sections / 11 pages** — keep it tight.

**Outcome-forward section order (default `proposalTemplate` sequence):**

1. **Hero / cover** — personalized: client name/logo + one line about _their_ goal. The first 5 seconds decide if they keep scrolling.
2. **"Here's what we heard" → needs-to-solution mapping** — the core personalization. Not a paragraph: a set of **mapped cards**, one per pain surfaced on the discovery call, each reading **"You told us: {their need, in their words} → We'll: {our solution / which deliverable} → So that: {the outcome for them}."** This is what makes a mostly-templated proposal feel written _for them_ — their own words tied to specific deliverables and a concrete benefit. Each mapping can **link to a catalog deliverable**, which auto-pre-checks it in the deliverables section (§5). This is the one section authored fresh each time, straight from call notes.
3. **Where you'll be (the outcome)** — lead with the transformation on three axes: **time saved · revenue gained · risk removed** (+ an identity line). Per-service, reusable.
4. **How we get there** — light approach/how-it-works. Reusable.
5. **Deliverables** — grouped _under the outcome each produces_, benefit-led, **selectable** with a live-updating total. Reusable list; per-client pre-checks.
6. **Proof — matched case study** — auto-pulled from `service.featuredProjects`, rendered **Problem → Solution → Result (one metric + timeframe)**, placed right before pricing. Graceful empty state for Software (no shipped proof yet).
7. **Investment** — good-better-best packages + (Websites) the priced care-plan tiers + payment-cadence selector. Reusable; per-client discount/expiry.
8. **Next step** — inline e-sign + Stripe pay, with an **expiry date**. Salt **counter-signs before sending** (+65% close).

**Service-specific content each `service`/`proposalTemplate` must carry (fill once, reuse):**

- **Outcomes block** (time/revenue/risk/identity) — _new structured field_ on `service` (or template). For AI Automations, this includes an **ROI / time-saved calculator** config (inputs: hours/week × hourly value → live payback vs. $600/mo). _New interactive section type._
- **Deliverables** with `amount` + `priceType` (one-off/monthly) + `optional` — already planned in Phase 1.
- **Care-plan tiers** (Websites) — _new: a priced 3-tier good-better-best block_ (Essential / Growth\*/ Partner), hosting folded in, results-currency not hours. Anchor the middle tier. This captures the **18× recurring-value lift**.
- **Packages** (good-better-best) — Phase 1 `package` doc.
- **Matched case study** — `featuredProjects` (exists); add per-project `problem` / `result-metric` / `timeframe` fields so the Problem→Solution→Result render is clean.
- **Terms + contract template ref** — Phase 1.

**Per-client customization layer (set at proposal-creation, from the discovery call):**

- Client name, logo, contact, `locale`, `whatsappOptIn`.
- **Hero line** + **"here's what we heard" summary** (free text from the call — the one section written fresh each time).
- Which service(s)/package(s) to show; which optional deliverables are **pre-checked**.
- Optional **custom line items** (one-off add-ons specific to this client not in the catalog).
- **Discount code / friends-&-family pricing** (see Phase 3).
- **Expiry date** (default from template, e.g. 14 days).
- Optional **personal intro video** URL (worth offering; not required — watched video correlates with 3.3× close but presence alone is weak).

**Discovery-call → proposal handoff:** the create-proposal form (Phase 5 admin) is essentially a **discovery worksheet**. Building a real proposal after a call is: pick service template → add a few **needs→solution→outcome mapping** rows from your call notes (each optionally linked to a deliverable, which auto-pre-checks it) → adjust any custom line items → set discount/expiry/locale → send. The heavy content (outcomes, deliverables, care plans, case study, terms) is all inherited from the service template. **Nice future add:** pre-fill the mapping from the discovery-call transcript/notes with an AI draft she edits — but v1 is manual entry, which is fast enough.

---

## Phasing

Ship value at every phase; nothing later blocks first revenue.

- **Phase 0** — Foundations: DB, env, service-layer scaffolding, secrets.
- **Phase 1** — Proposal content model in Sanity (packages + deliverable pricing + proposal template).
- **Phase 2** — Proposal instance + public proposal page + selection (read-only money, no Stripe yet).
- **Phase 3** — Stripe: invoice + payment plan, checkout, webhooks → `paid`.
- **Phase 4** — Contracts: Dropbox Sign auto-generate + embedded signing + webhook → `signed`.
- **Phase 5** — WhatsApp 1:1 onboarding thread + admin dashboard + notifications.

---

## Phase 0 — Foundations

**Goal:** DB reachable, secrets in place, a typed service layer to hang everything on.

1. **Provision Postgres (Neon).** Add via Vercel Marketplace; pull connection string into env.
   - _Tool:_ `/vercel:marketplace` skill (or `vercel env` via `mcp__plugin_vercel_vercel`), then `mcp__claude_ai_Vercel__get_project` to confirm wiring.
2. **Pick DB access layer: Drizzle ORM** (lightweight, TS-first, plays well with Neon serverless + Fluid Compute). Add `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`.
   - _Tool:_ Context7 (`mcp__claude_ai_Context7`) for current Drizzle + Neon serverless setup; **do not** rely on memory for the driver API.
3. **Create `lib/db/` module:** `schema.ts` (tables), `client.ts` (server-only Drizzle client), `index.ts` (barrel).
   - _Tool:_ `feature-dev:code-architect` to lay out the module against existing `lib/` conventions (mirror `lib/analytics`, `lib/quiz`).
4. **Env + secrets.** Add to `.env.example` and 1Password (`salt-studio-development`): `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DROPBOX_SIGN_API_KEY`, `DROPBOX_SIGN_WEBHOOK_KEY`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `SANITY_API_WRITE_TOKEN` (already defined, wire it up).
   - Create `sanity/lib/write-token.ts` (`server-only`) per `app/api/CLAUDE.md`.
5. **Secrets hygiene check.** No secret in a client bundle; all vendor keys behind `server-only`.
   - _Tool:_ `/cso` (daily mode) or `security-audit` agent once keys are added.

**Files:** `lib/db/{schema,client,index}.ts`, `sanity/lib/write-token.ts`, `.env.example`, `drizzle.config.ts`, migrations dir.

---

## Phase 1 — Proposal content model (Sanity)

**Goal:** Gabriella can assemble a proposal's _menu_ from real services without touching code.

Design note: pricing today lives as a human string (`priceLine`). Proposals need **machine-readable amounts** to build Stripe line items. Add structured price fields **additively** — keep `priceLine` as the display copy, add numeric fields alongside.

1. **Extend `service.deliverable` with optional pricing.** Add `amount` (number, minor units or dollars — pick one convention repo-wide), `priceType` (`one_off` | `monthly`), `optional` (bool — can the client toggle it?). Keep every field described + validated.
   - _File:_ `sanity/schemas/documents/service.ts` (the `serviceDeliverable` object).
2. **New `package` document** — a named bundle: title, slug, description, `includedDeliverables` (references or inline), `price` (amount + type), `bestFor`, optional `savingsLine`.
   - _File:_ `sanity/schemas/documents/package.ts`. Register in `sanity.config.ts` (`schema.types`).
3. **New `proposalTemplate` document** — reusable skeleton: title, intro (portable text in Salt voice), which `services`/`packages` to offer, default deliverables pre-checked, terms blurb, `contractTemplateRef`, expiry-days default.
   - _File:_ `sanity/schemas/documents/proposalTemplate.ts`. Register + add to structure if it should sit near core pages.
4. **New `contractTemplate` document** — maps a proposal to a Dropbox Sign template: `dropboxSignTemplateId`, signer roles, editable clause fields, jurisdiction line.
   - _File:_ `sanity/schemas/documents/contractTemplate.ts`.
5. **Outcomes block on `service`** — _new structured field_: `outcomes` (array or object of `timeSaved` / `revenue` / `riskRemoved` / `identity` lines) so the "where you'll be" section is authored per service, not free-typed each time. Localized text fields.
   - _File:_ `sanity/schemas/documents/service.ts`.
6. **ROI / time-saved calculator config** (for AI Automations) — _new object_ `roiCalculator`: default hourly value, hours-saved assumption, the monthly price to compare against, and copy labels. Powers the interactive calculator block in the proposal.
   - _File:_ new `sanity/schemas/objects/roiCalculator.ts`, referenced from `service`/`proposalTemplate`.
7. **Care-plan tiers** (Websites) — _new document or object_ `carePlanTier`: name, framing line, monthly price, included items, `mostPopular` bool (anchor the middle). Three tiers, good-better-best. This is where care plans finally become a **clearly priced** offer (they're currently unpriced publicly).
   - _File:_ `sanity/schemas/documents/carePlanTier.ts` (or embed on the Websites `service`).
8. **Case-study fields for the Problem→Solution→Result render** — add `problem`, `resultMetric`, `resultTimeframe` to `project` (or a per-service override) so the matched case study renders cleanly. Graceful empty state where absent (Software).
   - _File:_ `sanity/schemas/documents/project.ts`.
9. **GROQ queries** for template + services with pricing/outcomes/care-plans, all via `defineQuery`.
   - _File:_ `sanity/lib/queries.ts` — `proposalTemplateBySlugQuery`, `packagesQuery`, `servicesWithPricingQuery`, `carePlanTiersQuery`.
10. **Regenerate types.**
    - _Tool:_ `qtypes` trigger → `npm run typegen`.

**Review gate:** `/plan-design-review` on the Studio editing UX (is assembling a proposal actually pleasant for a non-technical editor?) + `conversion-reviewer` agent on the proposal _content_ structure.

**Files:** `sanity/schemas/documents/{package,proposalTemplate,contractTemplate}.ts`, `service.ts` (edit), `sanity/lib/queries.ts`, `sanity.config.ts`.

---

## Phase 2 — Proposal instance + public page + selection

**Goal:** A real, shareable proposal link where a client selects deliverables and sees a live total — no payment yet.

1. **DB tables** (`lib/db/schema.ts`): `proposals` (id, publicToken, clientName, clientEmail, clientPhone, **locale** (`en` | `pt-BR`, default `en`), templateSlug, catalogSnapshot JSONB, status, expiresAt, timestamps), `selections` (proposalId, chosen items, packageId, computed totals), `proposal_events` (audit).
   - **`locale` is chosen by Gabriella at proposal-creation time** and is the single switch that drives language everywhere downstream. The `catalogSnapshot` stores the copy already resolved to that locale, so the client's proposal never shifts language later.
   - **Per-client customization columns** (the thin discovery-call layer over the template): `heroLine`, `discoveryMapping` (json — array of `{theirNeed, ourSolution, theOutcome, linkedDeliverableId?}` cards captured from the call), `preCheckedDeliverables` (json — auto-populated from any `linkedDeliverableId`s, editable), `customLineItems` (json — one-off add-ons not in the catalog), `introVideoUrl` (nullable), `whatsappOptIn` (bool), `onboardingChannel`.
   - **Discount columns:** `stripeCouponId` / `promotionCode` (nullable), plus a denormalized `discountLabel` (e.g. "Friends & family rate") for display. Amounts are always **recomputed server-side** at checkout — these columns just record intent.
   - **Snapshot the catalog at send time** into `catalogSnapshot` so later Sanity edits don't silently change a client's live proposal/price.
2. **Server action / API to create a proposal** from a `proposalTemplate` + client details → generates unguessable `publicToken` (e.g. 32-char base62). Admin-triggered.
   - _File:_ `app/api/proposals/route.ts` (POST) or a server action. Reads template via `sanityFetch`, writes instance via Drizzle.
3. **Public proposal route** `app/(personal)/p/[token]/page.tsx` — server component; loads proposal by token from DB; renders intro, service story, deliverable checklist, packages, running total.
   - Follow async-`params` pattern; **not** slug-based Sanity content, so no draft-mode 404 dance — 404 on unknown/expired token.
   - Mark `viewed` on first load (idempotent).
4. **Selection UI** — client component for the interactive checklist + package toggle + payment-cadence preview. State persists via a debounced PATCH to `app/api/proposals/[token]/selection/route.ts`.
   - Respect three-door reality: one-off deliverables sum to a project total; monthly deliverables surface as "$X/mo"; a package overrides individual selection.
   - _Tool:_ `/frontend-design` skill for the page + selection UI (Tailwind v4 inline classes, no `cn()`), then `/design-review` on the live render.
5. **"Accept & continue" CTA** — transitions `selected`, routes to Phase 3 payment. Until Phase 3 lands, it can email Gabriella via Resend as a stub.
   - _File:_ `lib/proposals/notify.ts` using existing `resend`.

**Empty/edge states:** expired token, already-paid proposal, template deleted in Sanity (snapshot saves us), zero optional deliverables.

**Review gate:** `conversion-reviewer` agent (is the selection flow friction-free?) + `/qa` on the public flow.

**Files:** `lib/db/schema.ts` (edit), `app/(personal)/p/[token]/page.tsx`, `app/(personal)/p/[token]/*` client components, `app/api/proposals/route.ts`, `app/api/proposals/[token]/selection/route.ts`, `lib/proposals/{create,pricing,notify}.ts`.

---

## Phase 3 — Stripe (invoice + payment plan)

**Goal:** Client pays; system knows they paid.

1. **Add `stripe` SDK.** Create `lib/payments/stripe.ts` (`server-only` client). _Tool:_ Context7 / `/vercel:ai-sdk` not needed — use Stripe docs via Context7 for current API version.
2. **Map selection → Stripe.** `lib/payments/build-line-items.ts` converts `catalogSnapshot` + selection into:
   - **One-off / deposit** → Stripe **Invoice** (or Checkout Session in `payment` mode) for project totals.
   - **Split monthly** → Stripe **Subscription** (for true recurring like AI Automations retainer) **or Invoice with a schedule / installments** for "split a fixed project into N monthly bills." Decide per-line: recurring deliverable → subscription item; one-off split → invoice schedule.
3. **Checkout route** `app/api/proposals/[token]/checkout/route.ts` — creates the Stripe object for the chosen cadence, returns a hosted payment URL / client secret; writes a `payments` row (`pending`).
4. **Webhook** `app/api/stripe/webhook/route.ts` — verify signature with `STRIPE_WEBHOOK_SECRET`; handle `invoice.paid`, `checkout.session.completed`, `customer.subscription.created`, `invoice.payment_failed`; transition proposal → `paid`; idempotent via event id.
   - Runs on Fluid Compute (Node runtime) — raw body needed for signature verification; use route segment config accordingly.
5. **Payment cadence selector** in the proposal UI — "Pay in full" / "Deposit + balance" / "Monthly (N × $X)". Preview each with real Stripe-computed amounts before commit.
6. **Discounts (incl. friends & family) — via Stripe Coupons + Promotion Codes.**
   - **Model:** create the coupons once in Stripe (e.g. a `FRIENDS-FAMILY` percentage coupon, seasonal codes, etc.). Stripe splits this into a **Coupon** (the discount rule) and a **Promotion Code** (the customer-facing string). Both are supported on Invoices, Checkout Sessions, and Subscriptions.
   - **How it's applied — Gabriella-controlled, server-side (recommended for friends & family):** the create-proposal form has an optional **discount** field where she picks a Stripe coupon/promo code. Store `stripeCouponId` / `promotionCode` on the `proposals` row. At checkout the server attaches it to the Stripe object — the client never types anything, and the code can't leak or be self-applied. The discounted total is **recomputed server-side** and reflected in the live proposal total (never trust a client-sent price).
   - **Optional — client-entered code:** if you ever want public campaign codes, add a "have a code?" field on the proposal that validates against Stripe promotion codes. Default OFF for friends & family (keep those private/invite-only).
   - **Recurring nuance:** for retainer (AI Automations) friends-&-family pricing, the coupon's **`duration`** matters — `once` (first month), `repeating` (N months), or `forever`. Pick per relationship; store the intent so renewals behave correctly.
   - **Display:** show the original price struck through → discounted price, with a small "Friends & family rate" label. (Discounts present correlate with +75% deal value — but here it's a relationship gesture, so frame it warmly, not as a fire-sale.)
   - _Tool:_ Context7 for current Stripe Coupons/Promotion Codes + `discounts` param on Checkout/Invoice/Subscription — verify the API shape, don't rely on memory.
7. **Post-payment confirmation page** + Resend receipt/thank-you in Salt voice.
   - _Tool:_ `salt-voice` skill for the copy.

**Security:** never trust client-sent amounts — always recompute from `catalogSnapshot` server-side. Verify webhook signatures. _Tool:_ `security-audit` agent on the payment + webhook routes before shipping.

**Review gate:** `/codex` challenge mode on the money math + `pragmatic-code-review` on webhook idempotency.

**Files:** `lib/payments/{stripe,build-line-items,cadence}.ts`, `app/api/proposals/[token]/checkout/route.ts`, `app/api/stripe/webhook/route.ts`, proposal UI (edit), `lib/db/schema.ts` (payments table).

---

## Phase 4 — Contracts (Dropbox Sign)

**Goal:** On payment, a contract is auto-generated from the selection and signed without leaving the site.

1. **Add Dropbox Sign SDK** (`@dropbox/sign`). `lib/contracts/dropbox-sign.ts` (`server-only`). _Tool:_ Context7 for current SDK + embedded-signing flow.
2. **Trigger on `paid`** — from the Stripe webhook handler (or a `paid`-event subscriber), read the proposal's `contractTemplate` (Sanity) + selection, and create a signature request from the Dropbox Sign template, pre-filling deliverables, price, cadence, client name.
   - Write a `contracts` row (`sent`, dropbox request id).
3. **Embedded signing page** `app/(personal)/p/[token]/contract/page.tsx` — mounts Dropbox Sign embedded signing so it stays on-brand.
4. **Contract webhook** `app/api/dropbox-sign/webhook/route.ts` — verify with `DROPBOX_SIGN_WEBHOOK_KEY`; on `signature_request_signed` / `_all_signed` → transition `signed`; store signed PDF reference.
5. **Countersign flow** for Gabriella (if template needs two signers) + Resend copy of the executed contract to both parties.

**Edge cases:** payment succeeds but contract creation fails (retry queue / alert Gabriella — do not silently strand); client pays but never signs (reminder cadence).

**Review gate:** `security-audit` on webhook verification + PDF access control (signed contracts must not be publicly guessable).

**Files:** `lib/contracts/dropbox-sign.ts`, `app/(personal)/p/[token]/contract/page.tsx`, `app/api/dropbox-sign/webhook/route.ts`, `lib/db/schema.ts` (contracts table).

---

## Phase 5 — WhatsApp onboarding + admin dashboard

**Goal:** A signed client is auto-welcomed into a 1:1 WhatsApp project thread; Gabriella has a cockpit.

1. **WhatsApp Business Cloud API setup** (Meta). Register a message **template** (required for business-initiated 1:1 messages). `lib/onboarding/whatsapp.ts` (`server-only`). _Tool:_ Context7 / Meta docs for the Cloud API send-template call. **Reality check baked in:** no group auto-add — this opens a direct thread from Salt's business number to `clientPhone`.
2. **Trigger on `signed`** — send the templated welcome ("Hi {name}, thrilled to start on {project} — this thread is our home base…"). Transition `onboarded`.
3. **Onboarding email is always sent — it is not a fallback.** On `signed`, Resend fires a Salt-voice welcome email to every client regardless of WhatsApp status: recap of what they bought, cadence/next payment, link to the signed contract, and next steps. This gives everyone a durable written record (WhatsApp threads scroll away). Two variants of the same email:
   - **On WhatsApp** → the email says "I've also opened a WhatsApp thread with you — that's our fastest line day to day." A subtle nudge, not the primary channel.
   - **Not on WhatsApp** (no number, or `whatsappOptIn = false`, or the Cloud API send fails) → the email is the primary welcome: "Prefer email? Perfect — just reply here and we're rolling." Optionally include a click-to-chat `wa.me` link so they can start the thread themselves later. Also notify Gabriella so she knows this client is email-first.
   - Track `onboardingChannel` (`whatsapp` | `email`) on the proposal so the dashboard shows how each client is being run and so reminders use the right channel.
4. **Admin dashboard** `app/(admin)/proposals/` (new route group, own chrome — **not** inside `(personal)`, per `app/CLAUDE.md`) — list proposals, status, totals, `onboardingChannel`; **create-proposal / discovery-worksheet form** (pick service template + enter client + `locale`/`whatsappOptIn`; add `needs→solution→outcome` mapping rows with optional deliverable links; pick discount code; set expiry); resend/expire/void; view event log.
   - Gate behind auth (see open question on auth).
   - _Tool:_ `feature-dev:code-architect` for the dashboard shell; `/frontend-design` for UI.
5. **Notifications** — Resend digest to `hello@createdbysalt.com` on each key transition (sent/viewed/paid/signed) so Gabriella has ambient awareness.

**Files:** `lib/onboarding/whatsapp.ts`, `app/(admin)/proposals/*`, `lib/proposals/dashboard-queries.ts`.

---

## Localization (English + pt-BR)

`locale` lives on the **proposal instance** (DB), chosen at creation time — that's the master switch. But _where the translated words come from_ differs per layer, and two vendors (Dropbox Sign, WhatsApp) can't just take a runtime string — they need pre-registered per-language assets. This is the important nuance:

**1. Sanity content (author-managed copy).** Make the localizable fields on `service` / `package` / `proposalTemplate` (title, descriptions, intro, terms, deliverable names) **localized string/text fields** using `sanity-plugin-internationalized-array` (field-level, `en` + `pt-BR`). Gabriella writes both languages in one document; the proposal snapshot picks the right one by `locale`. _Verify current plugin API via Context7 before wiring._

**2. App UI chrome (labels, buttons, states).** Static strings like "Choose your deliverables", "Pay in full", "Accepted" go in a small dictionary (`lib/i18n/{en,pt-BR}.ts`) keyed by `locale`. No heavy i18n framework needed for two languages and a handful of screens — a typed dictionary + a `t(locale, key)` helper is enough and keeps it server-component-friendly.

**3. Emails (Resend).** Two template variants per email (welcome, receipt, reminders) — `welcome.en.tsx` / `welcome.pt-BR.tsx`, selected by `proposal.locale`. Copy through the `salt-voice` skill, translated for pt-BR (not machine-translated — Salt voice in Portuguese).

**4. Contract (Dropbox Sign) — the vendor nuance.** Dropbox Sign templates are pre-built documents, so **you create two templates: one English, one Portuguese**, each with the same merge fields (client name, deliverables, price, cadence). The `contractTemplate` Sanity doc holds **both** template IDs (`dropboxSignTemplateIdEn`, `dropboxSignTemplateIdPtBr`); at `paid → contract_sent`, the code picks the ID matching `proposal.locale`, then merges the (already-localized) selection data in. So: **one contract flow, two source documents, language chosen by the proposal.** A Brazilian client signs a genuinely Portuguese contract, not an English one with Portuguese values.

**5. WhatsApp (Cloud API) — the other vendor nuance.** Meta message templates are **submitted and approved per language**. You register the welcome template once with an English body and once with a pt-BR body (Meta supports language variants under one template name). At send time you pass `proposal.locale` as the template's `language` code (`en` / `pt_BR`) and the same variable values. So the client gets the approved Portuguese template — you cannot just send free-form translated text as a business-initiated message; it must be the pre-approved pt-BR template.

**6. Stripe.** Set the Checkout/Invoice `locale` (`pt-BR`) so Stripe's own UI, receipts, and hosted invoice render in Portuguese automatically. Line-item _descriptions_ come from your already-localized snapshot. Currency is a separate decision — see open questions.

**Rule of thumb:** anything **you** render (page, email, UI) reads the locale at runtime from a dictionary or the snapshot. Anything a **vendor** renders (contract doc, WhatsApp template) needs a **pre-registered per-language asset**, and the code just selects which one by `locale`.

### Field-level localization spec (which Sanity fields become bilingual)

**Two governing rules that keep this from getting heavy:**

1. **Localize copy the _client_ reads in a proposal. Leave everything else English.** Numbers, slugs, references, image assets, sort orders, and internal-only names never get translated. Website-only copy (the service _detail panel_ fields that render on the English public site, not in proposals) also stays English.
2. **pt-BR is optional per field, with fallback to `en`.** Using `sanity-plugin-internationalized-array`, Gabriella only fills Portuguese for services/packages she actually proposes to Brazilian clients. Empty pt-BR → the snapshot falls back to `en`. And **homepage/public-site GROQ queries pin `en`**, so bilingualizing a shared `service` field never changes what the English site shows.

This means `service` stays a single source of truth — no separate Portuguese site, no duplicated docs.

**`service` (`sanity/schemas/documents/service.ts`)**

| Field                                                                                                                              | Localize?     | Why                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                                                                                                                            | ✅            | Service name shown in the proposal (homepage pins `en`)                                                                                 |
| `headline`                                                                                                                         | ✅            | Client-facing headline                                                                                                                  |
| `shortDescription`                                                                                                                 | ✅            | Rendered in proposal                                                                                                                    |
| `timelineLine`                                                                                                                     | ✅            | Display string ("6–10 weeks" → "6–10 semanas")                                                                                          |
| `timeline[].label` / `.duration` / `.detail`                                                                                       | ✅            | Phased timeline shown in proposal                                                                                                       |
| `deliverables[].title` / `.detail`                                                                                                 | ✅            | **The core selectable line items — must be bilingual**                                                                                  |
| `idealFor[]` / `notAFit[]`                                                                                                         | ✅ (optional) | Client-facing bullets, if surfaced in the proposal                                                                                      |
| `deliverables[].amount` / `.priceType` / `.optional`                                                                               | ❌            | Numeric/structural — formatted per locale at render, not translated                                                                     |
| `priceLine`                                                                                                                        | ❌            | Display string, but proposal renders price from **numeric** fields formatted by locale + currency; keep `priceLine` as EN homepage copy |
| `slug`, `sortOrder`, `linkLabel`                                                                                                   | ❌            | Structural / homepage UI                                                                                                                |
| `capabilities`, `workCategories`, `featuredProjects`, `testimonials`, `clients`, `nextStep`                                        | ❌            | References — resolve their own copy                                                                                                     |
| `backgroundImage`, `backgroundVideoUrl`, `detailImage`                                                                             | ❌            | Assets                                                                                                                                  |
| `detailEyebrow`, `detailBody`, `sceneLine`, `stepsLabel`, `steps[]`, `proofAnchor`, `fitCheckLabel`, `fitCheckHref`, `routingLine` | ❌            | **Website detail-panel copy** — renders on the English public site, not in proposals. (Localize later only if a proposal reuses them.)  |

**`package` (new)**

| Field                                                                       | Localize? |
| --------------------------------------------------------------------------- | --------- |
| `title`, `description`, `bestFor`, `savingsLine`                            | ✅        |
| `price` (amount + type), `slug`, `includedDeliverables` (refs), `sortOrder` | ❌        |

**`proposalTemplate` (new)**

| Field                                                                                                                      | Localize? |
| -------------------------------------------------------------------------------------------------------------------------- | --------- |
| `intro` (portable text), `termsBlurb`, any section headings/CTA labels                                                     | ✅        |
| `title` (internal name), `slug`, `services`/`packages` (refs), `contractTemplateRef`, `expiryDays`, default-checked config | ❌        |

**`contractTemplate` (new) — the vendor-asset exception**

| Field                                                         | Localize?                   | Note                                                                                                                                             |
| ------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dropboxSignTemplateIdEn` **and** `dropboxSignTemplateIdPtBr` | ❌ (paired, not translated) | Two separate IDs — code picks by `proposal.locale`. This is the "pre-registered per-language asset" pattern, **not** an internationalized field. |
| `title` (internal), signer roles, jurisdiction                | ❌                          | Structural                                                                                                                                       |
| Any inline clause _copy_ rendered by us (not by Dropbox Sign) | ✅                          | Only if we render it ourselves                                                                                                                   |

**Not in Sanity at all** (handled elsewhere, per the Localization section above): app UI chrome → `lib/i18n/{en,pt-BR}.ts` dictionary; emails → `*.en.tsx` / `*.pt-BR.tsx` variants; WhatsApp → Meta per-language approved templates; Stripe → `locale` param.

_Verify `sanity-plugin-internationalized-array` current API + the GROQ shape for pinning `en` via Context7 before wiring — do not rely on memory._

## Cross-cutting concerns

- **Idempotency:** every webhook keyed by provider event id; state transitions are guarded (can't go `paid → paid`).
- **Security:** unguessable tokens; server-side price recompute; all webhooks signature-verified; signed contracts + PDFs access-controlled; secrets `server-only`. Run `/cso` before each external-facing phase ships.
- **Observability:** `proposal_events` audit table is the single source of truth for "what happened"; surface it in the dashboard.
- **Salt voice:** all client-facing copy (proposal intro, emails, WhatsApp template, receipts) through the `salt-voice` skill.
- **Testing:** Stripe test mode + Dropbox Sign test mode + WhatsApp test number end-to-end before any live key. `/qa` per phase.
- **Docs:** each phase updates `app/api/CLAUDE.md`, adds a `lib/<area>/CLAUDE.md`, and `sanity/CLAUDE.md` for new schemas. `/document-release` after each phase.

---

## Open questions to resolve before Phase 5 (not blocking Phase 0–2)

1. **Admin auth** — how does Gabriella log into the dashboard? Options: Sign in with Vercel, Auth.js, or a simple email-magic-link via Resend. (Sanity Studio auth is separate; don't overload it.)
2. **Money units** — store amounts as integer minor units (cents) everywhere (recommended) to match Stripe. Confirm and enforce in schema.
3. **Deposit / split rules** — default deposit % and default number of monthly installments? Per-proposal override?
4. **Proposal expiry** — default validity window (e.g. 14 days) and what a client sees after expiry.
5. **VAT/tax** — any tax handling needed now, or Stripe Tax later?
6. **Currency for Brazilian clients** — do pt-BR proposals bill in **USD** (simplest — one Stripe account, client pays in USD) or **BRL** (needs BRL enabled on the account + FX-aware pricing in the catalog)? `locale` and currency are independent switches; decide before Phase 3.

---

## Suggested build order (fastest path to first revenue)

**Phase 0 → 1 → 2 → 3** gets a client from link to paid. Phases 4 (contract) and 5 (WhatsApp) layer on after the money flow is proven — matching the `[[bridge-period-funnel-decision]]` "first sale is the go/no-go" instinct.

## `qcode` entry point

When approved, start with **Phase 0 step 1–3** (DB + `lib/db` scaffold). Use `feature-dev:code-architect` to produce the concrete blueprint for `lib/db/schema.ts` against the tables sketched above, then implement. Run `npm run lint` and `npm run type-check` before finishing each phase.
