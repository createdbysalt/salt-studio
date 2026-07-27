# Site Copy & Conversion Plan — createdbysalt.com

**Date:** 2026-07-26
**Goal:** Every page converges on one action — **book a discovery call** — while acting as a *filter* (per SERVICES.md: attract AI builds + fixed-scope site work, quietly repel open scope and committees, warm the Salt waitlist).
**Pages:** Homepage · Selected Work · About · Capabilities/Services · Contact
**Companion plan:** `2026-07-26-design-system-redesign.md` (visual + motion system; copy and motion are planned together below)

---

## 1. Source documents (all read 2026-07-26)

| Source | What it gives us |
| --- | --- |
| `salt-studio-knowledge-base/studio/website/strategy/SERVICES.md` | Approved positioning, hero draft, 3 services + Salt flag, pricing, filters, portfolio direction |
| `salt-studio-knowledge-base/08-Domain-Expertise/studio/COPY-VOICE.md` | Conversion-surface voice: direct, concrete, "what + for whom," no "craft/elevated" |
| `salt-studio-knowledge-base/02-Brand-Guidelines/WORDS.md` | Brand vocabulary + **the context override**: conversion pages follow studio voice, story contexts get the SALT metaphor. *"Clarity where visitors decide, poetry where they linger."* |
| `salt-studio-knowledge-base/02-Brand-Guidelines/PRICING.md` | Investment floors & care tiers (referenced via SERVICES.md) |
| `resources/onm-vault` (O Novo Mercado) | Copy frameworks — see §3. Curated in `Courses/_CURATION-for-Salt.md` |
| `resources/g4-vault` | Business/growth courses — lower direct relevance for page copy; use `Vendas` + `Growth` trails only if §3 extraction leaves gaps |
| Repo `.claude/` workflows | `/copy`, `/page`, `/strategy`, `salt-voice` skill, `conversion-reviewer` + `ux-strategist` + `icp-analyst` agents |

**Note:** `brand-identity/*.json` (discovery/audience/strategy/design) were never filled — the knowledge base *is* the discovery. Don't run `/discover`; mine what exists.

---

## 2. Conversion doctrine (the rules every page follows)

1. **One primary CTA, everywhere: "Book a discovery call."** Same label, same destination (contact page w/ calendar), in nav (persistent), mid-page after proof, and page-end. Secondary CTAs are routing only (see work → services → contact), never competing asks.
2. **Qualify, don't chase.** This site filters. Fit signals live *in* the copy ("one build at a time," "built closely with the one person who can say yes," visible investment floors). A wrong-fit visitor bouncing is a conversion *success*.
3. **Price is public.** "From $15,000 / $75,000 / $5,500 / $100 per month." Transparency pre-qualifies the call and signals confidence. Money language per WORDS.md: "investment," never apologetic.
4. **Proof before ask.** No CTA appears before at least one proof element (client name, outcome sentence, or the work itself) has scrolled past.
5. **Voice switching is structural, not vibes.** Each section in every page brief below is tagged `[DECIDE]` (studio voice: direct, concrete, deliverables-for-audiences) or `[LINGER]` (brand voice: salt metaphor, "draw out," poetry). Heroes, service blocks, CTAs, forms = DECIDE. About narrative, case-study interludes, philosophy lines = LINGER.
6. **Creativity lives in the frame, clarity lives in the words.** The motion system (word-swap heroes, scrubbed sections, line-mask reveals) carries the creative wow; the copy inside it stays plain enough to convert. We never solve "boring" with adjectives — we solve it with typography and motion.
7. **Awareness mapping (Schwartz):** site visitors arrive solution-aware (they know they want a site/AI tool; they're choosing *who*). So pages sell *fit and certainty* — process, scope discipline, outcomes — not "why have a website."
8. **Every case study = outcome sentence first.** Per SERVICES.md: one sentence of transformation, not feature lists.

---

## 3. Copy frameworks to extract from onm-vault (Step 2)

Extract into a one-page playbook (`studio/website/strategy/COPY-PLAYBOOK.md` in the knowledge base) before drafting:

| Trail | Use for |
| --- | --- |
| `Copywriting/Como-fazer-Headlines` (11 lessons) | Headline patterns for the 5 heroes + section leads |
| `Copywriting/Escrita-Persuasiva` (3 lessons) | CTA microcopy, service blocks |
| `Copywriting/Jornada-do-Heroi-aplicada-ao-cliente` (14 lessons) | About page arc + case-study structure (client as hero, Salt as guide) |
| `Copywriting/Storytelling` (24 lessons) | LINGER sections; skim for the 2–3 structural lessons |
| `Vendas/vendas-b2b` + `Vendas/vendas-1-1` | Objection inventory → services-page FAQ + call-expectations block on contact |
| `Vendas/funis-de-vendas` | Sanity-check the cross-page routing (work → services → contact) |

Distill *patterns and checklists*, not quotes — material is PT-BR, output is English.

---

## 4. Page briefs — section architecture

### 4.1 Homepage — job: qualify + route in 30 seconds

| # | Section | Voice | Copy + conversion mechanism | Motion pairing |
| --- | --- | --- | --- | --- |
| 1 | Hero | DECIDE | Approved SERVICES.md draft: "AI assistants and refined websites for organizations with a mission." + support line. CTA: Book a discovery call | **WordSwap**: the A/B candidate becomes the animation — clear headline swaps with the poetic line ("Salt doesn't overpower. It draws out what's already there."). Both truths on screen; the clear one leads |
| 2 | Proof strip | DECIDE | Client names (Cultivated, Enjoy Life, MFI Canada, Crossroads, Photon) — names only, no logos-soup | Marquee (existing) or static tracked-mono row |
| 3 | Services triad | DECIDE | 3 blocks from SERVICES.md drafts, one line each + investment floor + link to services page | LineReveal stagger |
| 4 | Selected work teaser | DECIDE headline / LINGER captions | 2–3 pieces, outcome sentence each → work page | ParallaxMedia cards, hover per design plan |
| 5 | The flag — Salt product | LINGER | "What we're building" draft from SERVICES.md → waitlist CTA (the *only* non-call CTA, visually distinct: red accent band) | ClipReveal band in `#E42927` |
| 6 | Philosophy interlude | LINGER | One or two lines max — the salt metaphor. No CTA | ScrubSection display type |
| 7 | Final CTA | DECIDE | "One build at a time. Currently booking [quarter]." + Book a discovery call | Simple; the words are the design |

### 4.2 Capabilities/Services — job: pre-sell the call, filter hard

1. **Hero** [DECIDE] — what we do, for whom, one line. No fluff before the menu.
2. **Service 1 — AI builds** [DECIDE] — SERVICES.md draft verbatim as base; add "how it works" (pilot → build), milestone/fixed-scope promise, investment. CTA.
3. **Service 2 — The Salt site** [DECIDE] — draft + single-decision-maker filter line + "limited number each year." CTA.
4. **Service 3 — Site care** [DECIDE] — draft + the leave-free promise (it's the most disarming trust line on the site — keep verbatim).
5. **Fit filter** [DECIDE] — "We're a good fit if / not a fit if" — public, kind rewrite of "What we no longer sell." This section does the repelling so the call doesn't have to.
6. **Process** [DECIDE] — discovery call → proposal → build, 3 steps, expectations per step. Demystifies the CTA ask.
7. **FAQ** [DECIDE] — objection inventory from §3 (timeline, who writes copy, what if scope changes, procurement/pilot for institutions). Doubles as AEO surface (FAQ schema — `lib/seo` already supports it).
8. **Final CTA** [DECIDE].

### 4.3 Selected Work — job: proof that routes

1. **Header** [DECIDE] — one line, then the work. No manifesto.
2. **3–5 case cards** — outcome sentence [DECIDE] on card; case pages/sections use problem → approach → outcome [LINGER allowed in narration], honest about hard parts, concrete metrics where they exist ("shipped in N weeks").
3. **Between/after cases** — one contextual CTA ("Want something like this → book a discovery call"), not one per card.
4. Candidates per SERVICES.md: Cultivated, Enjoy Life Church, MFI Canada, Crossroads, Photon Studio. Source material: `salt-studio-knowledge-base/03-Client-Projects/*`.

### 4.4 About — job: trust; the one page poetry leads

1. **Opening statement** [LINGER] — the salt metaphor in full. This is where "Subtle. Essential. Transformative." lives.
2. **The story** [LINGER] — founder arc (Jornada do Herói structure — but Gabriella as *guide*, mission-driven orgs as hero). Real history, real name, photo.
3. **Smallness as focus** [DECIDE-leaning] — "a few projects a year, each one taken seriously" (per SERVICES.md: smallness lives here, never in heroes).
4. **How we work / beliefs** [LINGER] — 3–4 short conviction lines, not a values grid.
5. **The Salt product bridge** [LINGER] — studio → software story, waitlist link.
6. **CTA** [DECIDE] — soft: "If this sounds like your kind of partner — book a discovery call."

### 4.5 Contact — job: zero-friction booking, expectation-setting

1. **Header** [DECIDE] — "Book a discovery call." One line of warmth, no essay.
2. **Calendar embed** — the call *is* the page. Cal.com or Calendly inline (⚠ open decision below). Not gated behind a form.
3. **What happens on the call** [DECIDE] — 3 bullets (30 min · we talk goals + fit · you leave with a clear next step, either way). Kills call anxiety = the #1 booking friction.
4. **Fallback form/email** [DECIDE] — for non-bookers: "Tell us about your project — we respond within 48 hours" (COPY-VOICE verbatim). Fields: name, org, what you're hoping to build, ~budget range select (self-qualification), anything else. Five fields max.
5. **Practical footer info** — email, location/timezone, response promise.

---

## 5. Steps

**Step 1 — Copy playbook from onm-vault** ✅ *done 2026-07-26*
Extracted via 3-agent fan-out (headlines+persuasion / hero's journey+storytelling / sales objections+funnel) → `salt-studio-knowledge-base/studio/website/strategy/COPY-PLAYBOOK.md` (6 parts: headlines, persuasive writing, hero's journey, objection inventory, call design, funnel check).

**Step 2 — Confirm booking mechanics** ✅ *resolved 2026-07-26: Cal.com*
Remaining details to collect at §4.5 implementation: Cal.com event link/username, call length (assume 30 min until told otherwise), fallback-form inbox (default `hello@createdbysalt.com`).
*Embed: `@calcom/embed-react` inline on the contact page (client component).*

**Step 3 — Draft page copy, one file per page** ✅ *draft-v1 done 2026-07-26*
All five files written to `salt-studio-knowledge-base/studio/website/copy/` (homepage, services, work, about, contact) — section-by-section, voice-tagged, hero alternates included, SERVICES.md approved drafts kept verbatim and extended. Open markers: `[GABRIELLA]` founder facts in about.md · `[VERIFY]` case facts in work.md (→ Step 4) · `[QUARTER]` scarcity line in homepage.md · `[X days]` recommendation turnaround + `[CAL-LINK]` in contact.md/services.md.

**Step 4 — Case study copy** ✅ *done 2026-07-26*
5-agent fan-out mined all client `_raw/` folders; work.md rewritten (draft-v2) with real facts, verbatim client vocabulary, and honest snags. **Critical finding: nothing had launched as of the notes** (targets: Cultivated Aug, ELC Sept 1, CLC Sept, Photon end-June unconfirmed, MFI in `live/`) — every case carries `STATUS: HOLD` until launch/permission confirms. No metrics or testimonials exist yet; none published.

**Step 5 — Conversion + voice review** ✅ *done 2026-07-26*
`conversion-reviewer` audit: 7.2/10, voice scan fully clean, CTA hierarchy passes. All auto-fixable findings applied (proof anchor above first services CTA, ELC/MFI/Photon/CLC card rewrites, site-care routing line, volunteer-FAQ requalification, WordSwap default-face + CTA-viewport build constraints, contact response paths, About §3 → LINGER, about.md marked BLOCKED). Verdicts: homepage/services/contact ship-ready after Gabriella fills; work.md gated on launches+permissions; about.md blocked on founder beats.

**Step 6 — Gabriella pass**
You edit for truth and taste — especially About (§4.4) and the hard-parts honesty in case studies. Nothing ships in your voice without your pass.
*Tool: user; then `/copy` for revisions.*

**Step 7 — Map to build**
Fold approved copy into the page/section build plans (Sanity `sections` array pilot from `2026-07-21-core-pages-sections-array-pilot.md` + the design-system plan). Copy structure in §4 was written to map 1:1 onto section components.
*Tool: `qplan` follow-up per page or extend existing page plans.*

---

## 6. Open decisions

1. ~~Booking tool~~ ✅ **Cal.com** (confirmed 2026-07-26). Still needed: event link, call length, form inbox.
2. **Case study depth** — separate `/projects/[slug]` pages per case (exists in routing already) vs single scrolling work page. Recommendation: cards + existing project detail routes; decide at Step 7.
3. **"Currently booking [quarter]" line** — real scarcity only if kept true; confirm you want to maintain it.

---

## 7. Anti-patterns (copy)

- Headline poetry on DECIDE surfaces ("We craft elevated digital experiences" — banned twice over)
- More than one competing CTA per viewport
- Feature lists in case studies; adjectives doing proof's job
- Hiding prices
- Gatekeeping tone on the contact page; forms longer than 5 fields
- "Boutique/premium/best-in-class/pixel-perfect" (COPY-VOICE), "solutions/leverage/optimize/stakeholders" (WORDS.md)
- Explaining the salt metaphor where someone is trying to decide
