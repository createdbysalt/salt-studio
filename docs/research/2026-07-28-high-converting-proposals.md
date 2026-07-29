# Research: What makes a proposal convert — applied to Salt's proposal engine

**Date:** 2026-07-28
**Purpose:** Evidence base for the content, structure, and design of the Salt proposal engine (`docs/plans/2026-07-28-proposal-engine.md`).
**Method:** Web research against proposal-software benchmark reports (Proposify, Better Proposals, PandaDoc, Qwilr) + pricing/social-proof psychology sources. Confidence noted per claim.

---

## The headline finding: an interactive, selectable, pay-inline proposal is the highest-leverage thing we could build

Nearly every top benchmark points the same direction — the exact model in our plan (web page, client selects deliverables, e-sign + Stripe inline, matched case study) is what the data says wins.

| Finding | Number | Confidence | Source |
| --- | --- | --- | --- |
| **Interactive pricing** (client selects options) vs static | **Win 2× more; +21% close rate** | HIGH | Proposify State of Proposals 2026 |
| **Recurring fees in a proposal** (i.e. care plans / retainers) | **18× lift in deal value** | HIGH | Proposify 2026 |
| **E-signature** vs none | **+15% close rate, 60% faster to close** | HIGH | Proposify 2026 |
| **Seller signs before sending** | **+65% close rate, 25% faster** | HIGH | Proposify 2026 |
| Interactive/web proposals (Qwilr customers) | **20%+ win-rate increase** | MEDIUM (vendor-reported) | Qwilr |
| E-signature tech generally | **70% faster cycles, +18% conversion** | MEDIUM | PandaDoc |
| Proposals with e-sign signed **<24h** of opening | **47%** | HIGH | Better Proposals 2022 |
| Proposals won within 24h of opening | **43%** | HIGH | Proposify (State of Proposals 2024) |
| **Standardized templates** vs ad-hoc | win rate **56% vs ~42% avg** | HIGH | Proposify 2024 |
| Overall close rate using proposal software | **34%** (vs ~20% industry) | HIGH | Proposify 2026 |
| **Watched video** in a proposal | **3.3× more likely to close** | MEDIUM (only 20% include video; selection bias) | Proposify 2026 |
| **Client input form** in proposal | close rate **41%** | MEDIUM | Proposify 2026 |
| Discounts present | **+75% avg deal value** ($35k vs $20k) | MEDIUM | Proposify 2026 |
| Revision rounds | 1 rev +18%, 2 rev +28%, **3 rev +45%** close | MEDIUM | Proposify 2026 |

> ⚠️ Contradiction to note: Better Proposals found video converts only **+3.8% better** (2022), while Proposify says watched video → 3.3× close (2026). Reconcile: Proposify measures *watched* video (engagement proxy), not *presence* of video. **Implication:** an embedded personal intro video is worth offering but is not a silver bullet; don't block launch on it.

---

## 1. Section order & narrative arc (what actually wins)

Proposify 2026: **winning proposals average 11 pages and 7 sections** (losers average 13 pages — longer is worse). Most common winning section order:

1. Cover
2. Executive summary / introduction
3. Approach / solution / scope
4. Deliverables / timeline
5. About us / team
6. Pricing / investment
7. Terms / next steps

**But** the persuasion literature says lead with the *outcome/transformation*, not the mechanics. Synthesized arc for Salt (outcome-forward variant):

1. **Hero / cover** — personalized to the client, breathtaking (their name, one line about their goal).
2. **"Here's what we heard"** — mirror their problem/goal in their words (executive summary). Buyers who feel understood read further.
3. **Where you'll be** — the *outcome/transformation* up front (time saved / revenue / risk removed). Lead with the destination.
4. **How we get there** — the approach (light; this is the "how," not the star).
5. **Deliverables** — grouped *under the outcome each one produces* (see §2), selectable.
6. **Proof** — the case study matched to this exact service, placed **right before pricing** (see §4).
7. **Investment** — good-better-best + care plans + payment options (see §5).
8. **Next step** — e-sign + pay inline, with an expiry date.

Engagement data backing "make each section pull its weight": winning proposals get **12 views and 25 min of view time** (losers: 8 views, 16 min), and buyers view **93%** of proposals they sign — the myth that "they only read the pricing page" is false. Every section is read; every section must earn attention.

---

## 2. Deliverables as *value*, not a shopping list

- **Group deliverables by the outcome they produce**, not by task type. Each item leads with the benefit, then the mechanism. (Our `service.deliverables[].title` = the value line, `.detail` = the mechanism — the schema already supports this.)
- Quantified > generic everywhere. "Specific always beats vague." (Instantly / Proposify social-proof guidance.)
- **Selectable deliverables = the interactive-pricing 2× win.** Let optional items be toggled; the running total is the interactive moment.
- Keep it scannable — the existing `.max(10)` validation warning ("six clear deliverables beat twelve vague ones") is on-strategy.

---

## 3. Outcomes / ROI framing per service

Change the "currency" from tasks/hours → **results**. (Agency-retainer best practice: "clients don't care about hours — they care about results.") Three outcome axes to hit for every service: **time saved · revenue gained · risk removed** (plus an emotional/identity line).

### Websites (from $2,500)
- **Time saved:** reclaim the hours/month currently spent fighting/DIY-ing the site (care plan removes it entirely).
- **Revenue:** a site that converts more visitors into inquiries; credibility that lets them charge/close higher.
- **Risk removed:** won't break, is secure, is backed up, loads fast — no more "the site's down" panic.
- **Identity:** "Finally looks like the business we know we are."
- **Quantify:** "Turn more of your existing traffic into inquiries," "load in <2s instead of 6s," "reclaim ~N hrs/mo."

### AI Automations (retainer from $600/mo) — *time saved is the whole pitch*
- **Time saved (headline):** hours/week reclaimed from repetitive work (follow-ups, data entry, scheduling, reporting). Ladder it: hrs/week → hrs/month → **FTE-equivalent** → dollar value.
- **Revenue:** faster response = more conversions; freed capacity redirected to billable/growth work.
- **Risk removed:** fewer human errors; nothing falls through the cracks; consistent follow-up 24/7.
- **Killer framing (build an ROI calculator — Qwilr/Proposify both push embedded ROI calculators):** "Save ~10 hrs/week ≈ 40 hrs/month — a part-time hire's output — for $600/mo." Inputs: hours × their hourly value → payback shown live. This *is* the interactive wow for this service.

### Software (from $25k)
- **Time saved:** replaces the stitched-together spreadsheet/multi-tool workflow; the team works in one place.
- **Revenue:** unlocks a capability/model that scales without adding headcount.
- **Risk removed:** you *own* the platform (vs. renting SaaS forever); security built in; no per-seat tax as you grow.
- **Quantify:** "Stop paying $X/mo across N tools and hand-stitching them," "a platform that scales with you and that you own."

---

## 4. Case study placement & anatomy

- **Where:** matched to the prospect's service, placed **at the proposal stage, right before pricing / adjacent to the CTA** — case studies at the decision moment "move more conversations forward than homepage testimonials." (Instantly, Proposify.)
- **Relevance beats shine:** a same-service/same-sector case study outperforms a flashier one from a different context. **Implication for us:** the proposal must pull a case study tied to *this* service — our `service.featuredProjects` reference already models exactly this. Auto-select the top featured project for the service.
- **Anatomy that converts — Problem → Solution → Result:**
  - Problem: the client's specific *before* state.
  - Solution: the one thing we did.
  - Result: **a single quantified outcome with a time frame** (e.g. "bookings up 38% in 90 days").
- Recognizable client logos at the decision moment add trust. (Our `service.clients` proof strip.)

**Gap / honesty flag:** per project memory `[[services-three-door-restructure]]`, **Software has no shipped proof yet.** Design the proposal to degrade gracefully — if no matched case study exists, show a "what success looks like" outcomes block or a relevant adjacent project, never an empty section. (Consistent with `[[no-placeholder-cms-content]]`.)

---

## 5. Pricing psychology

- **Good-Better-Best (3 tiers):** three-tier pages convert ~**1.4× two-tier**; 4+ tiers convert worse. ~**60%+ pick the middle** (Goldilocks / center-stage effect). Highest tier anchors; middle looks reasonable. (Multiple pricing-psych sources.)
- **Anchor high:** show the premium option to make the target tier feel sensible.
- **Care plans = the recurring-revenue 18× deal-value lever.** Present them as a *default part of the website*, not an upsell afterthought.
- **Payment-plan framing:** offer "pay in full / deposit + balance / monthly split" — the cadence selector is itself an interactive-pricing element. Frame monthly as the small number ("$X/mo") next to the total.
- **Discount lever exists** (+75% deal value with discounts present) but use sparingly — a small, time-boxed "sign by {expiry}" incentive doubles as the urgency mechanism.

### Care-plan tiers (Websites) — results-currency, not hours; fold hosting in
Recommended 3-tier structure (fill Salt's real numbers; care plans currently have **no public price** per `[[services-three-door-restructure]]` — this is where they become a clear, priced offer *inside the proposal*):

| Tier | Framed as | Typically includes |
| --- | --- | --- |
| **Essential** | "Peace of mind" | Hosting, security + backups, uptime monitoring, core updates, monthly report |
| **Growth** *(most popular — anchor here)* | "Kept fresh & fast" | Everything in Essential + N content edits/mo, performance monitoring, priority response, quarterly check-in |
| **Partner** | "We grow it with you" | Everything in Growth + conversion/iteration work, monthly strategy, analytics review, first in line |

Industry ranges for context: solo/basic $40–$100/mo, popular tier $150–$250/mo, premium $400+/mo; **agencies commonly $500–$10k/mo**. Move the "currency" from hours → results (leads, speed, uptime, pages shipped).

---

## 6. Design principles for a *breathtaking* proposal

The premium feel comes from treating it as a **landing page, not a PDF** (Qwilr's whole thesis). Evidence-aligned principles:

- **Big imagery:** 83% of winning proposals use images; winners average **12 images**. Use real project shots, hero moments.
- **One idea per screen / scroll section.** Whitespace and pacing = premium. Winners are *shorter* (11 vs 13 pages) — restraint reads as confidence.
- **A hero moment up top** personalized to the client (their name/logo/goal). First 5 seconds decide whether they keep scrolling.
- **Motion on scroll** (you already have GSAP/Lenis in the stack) — reveal outcomes and the case-study metric with intention, not decoration.
- **The interactive selection IS the wow** — a live-updating total as they pick deliverables/tiers is the single most memorable, most-converting interaction (2× win data).
- **Inline e-sign + pay** so momentum never breaks (sign <24h = 47%). **Salt counter-signs before sending** (+65% close).
- **Expiry date** on the proposal — creates urgency and speed-to-close, and doubles as our data-model `expiresAt`.
- Typography restraint + the existing brand system; don't decorate — direct attention.

---

## Build implications (feed back into the plan)

1. **ROI/time-saved calculator** as a proposal block, especially for AI Automations — becomes a proposal-template section type. *(New section object; interactive.)*
2. **Auto-pull the matched case study** from `service.featuredProjects`, rendered Problem→Solution→Result with one metric, placed before pricing. Graceful empty state for Software.
3. **Care plans become a priced, 3-tier, good-better-best block** shown as part of every Websites proposal (not optional afterthought) — captures the 18× recurring lift.
4. **Selectable deliverables + live total + payment-cadence selector** = the core interactive surface (already in Phase 2/3).
5. **Salt counter-signs first; proposals carry an expiry date.** (Phase 4 + `expiresAt` in Phase 2.)
6. Keep proposals **~7 sections / short.** Offer an optional personal intro video slot, don't require it.
7. **Outcome-forward narrative order** (outcome before deliverables) — encode as the default `proposalTemplate` section sequence.

---

## Sources

- [Proposify — State of Proposals 2026](https://www.proposify.com/state-of-proposals-2026)
- [Proposify — State of Proposals 2024](https://www.proposify.com/state-of-proposals-2024)
- [Proposify — Beyond Case Studies: Social Proof in Proposals](https://www.proposify.com/blog/social-proof-sales-proposals)
- [Better Proposals — 2022 Report](https://betterproposals.io/reports/2022/)
- [Better Proposals — 2021 Report](https://betterproposals.io/reports/2021/)
- [PandaDoc — Proposal Software / e-signature stats](https://www.pandadoc.com/proposal-software/)
- [Qwilr — Interactive Quotes](https://qwilr.com/product/quotes/)
- [Instantly — Where to place testimonials, case studies, proof points](https://instantly.ai/blog/proposal-email-social-proof-where-to-place-testimonials-case-studies-and-proof-points/)
- [Monetizely — Good-Better-Best vs À-la-carte pricing](https://www.getmonetizely.com/articles/good-better-best-vs-a-la-carte-pricing-which-model-converts-better)
- [Evelance — Psychology behind pricing tiers](https://evelance.io/blog/psychology-behind-pricing-tiers-that-sell/)
- [BugHerd — Agency retainers: package, price, prove value](https://bugherd.com/blog/agency-retainers-that-work-how-to-package-price-prove-ongoing-value)
- [FatLab — Website maintenance packages compared](https://fatlabwebsupport.com/blog/website-maintenance/website-maintenance-packages-compared-your-complete-buyers-guide/)
