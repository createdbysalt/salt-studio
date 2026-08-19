# Studio pair + growth portfolio

**Date:** 2026-08-17
**Status:** DRAFT — waiting on Matt’s content worksheet (proof, availability, whether Growth is for sale now)
**Trigger:** qplan
**Goal:** Combine Gabriella’s build practice with Matt’s Growth Marketing and Sales — without turning the studio site into a resume, and without turning his job-application link into an agency brochure.

**IA decision (2026-08-17):** The About panel *is* the sendable surface. A Gabi / Matt toggle shows each person separately. URLs are `createdbysalt.com/gabi` and `createdbysalt.com/matt`. No `/team/[slug]`, no combined “meet the couple” scroll.

---

## 1. What this actually is

Two jobs share one domain.

| Visitor | They arrived because | They need in 10 seconds | Wrong page feels like |
| --- | --- | --- | --- |
| Client / discovery-call booker | They want a site, an automation, or software | “This studio can ship it. Maybe they can also grow it.” | A LinkedIn profile with a hire-me button |
| Recruiter / hiring manager | He sent them a link on an application | “This person owns pipeline and revenue. I can picture them on my team.” | A studio homepage selling $2,500 websites |

Doing this well means **two people, one panel, two URLs** — not one mashed bio, and not a second site.

The unique pair story (told in the *chrome*, not in either bio):

> Gabriella builds the system. Matt grows the pipeline. Same household, one brief.

Every agency claims they can “also do marketing.” Almost none can say the person who ships the site and the person who runs outbound share a kitchen table. That is the offer. Not a fourth commodity door.

The toggle is how you honor both audiences: a client opens About and can meet either of you; a hiring manager is sent `/matt` and never has to hunt.

---

## 2. The trap (and the decision)

**Do not add Growth Marketing and Sales as a fourth homepage door in v1.**

Reasons, in order:

1. **Staffing honesty.** Matt is applying for full-time sales/marketing roles. A public “Growth from $X/mo” door sells a service you may not be able to staff next quarter.
2. **Recruiter optics.** A homepage that equally sells “hire the studio” and “hire him” makes hiring managers ask: will he stay?
3. **The three-door model is working.** `service` documents already power the homepage band and the Capabilities detail panel. The schema can take a fourth service later with almost no code.
4. **Growth is a different kind of offer.** Websites / AI / software are things you ship. Growth and sales are a motion you run.

**Do this instead:**

- **Studio (clients).** Keep the three doors. Nav “About” opens the panel on Gabi. A Gabi / Matt toggle is right there if they want him. Homepage never becomes a job board.
- **Matt (employers).** He sends `createdbysalt.com/matt`. Same panel, his profile, his CTAs, his OG card. Gabi is one toggle away — proof they work as a pair — without making the page about the studio.

**Phase 3 (later, only if you decide Growth is a real product you can staff):** add a `service` document for Growth. The CMS already supports it.

### Why not a separate personal site?

A second domain costs you the proof. His strongest current work *is* Salt. One domain, one panel, two first-name URLs.

---

## 3. Information architecture

```
createdbysalt.com/                    client home — three doors
  /capabilities                       still websites / AI / software
  /work                               still shipped studio work
  /contact                            interest form (not a calendar)

createdbysalt.com/gabi                About panel, Gabi selected   ← sendable
createdbysalt.com/matt                About panel, Matt selected   ← sendable
createdbysalt.com/about               308 → /gabi
```

Kill `/?about=1`. Today `/about` redirects to `/?about=1`, then the panel strips the query and the URL becomes `/`. That is the opposite of sendable. The first-name path *is* the About URL. It stays in the address bar until they close the panel or toggle.

| Action | What happens |
| --- | --- |
| Click About in nav | Panel opens on **Gabi**. URL becomes `/gabi`. |
| Toggle **Matt** | Panel stays open. Content swaps. URL becomes `/matt`. Scroll resets to top. |
| Toggle **Gabi** | Same, URL `/gabi`. |
| Land on `/matt` cold (he sent the link) | Homepage (or current studio chrome) underneath, panel already open on Matt. Document title + OG are Matt’s. |
| Close the panel | Navigate to `/`. Never leave them on `/matt` with the panel shut — that URL would be a lie. |
| Hit `/about` | Redirect to `/gabi`. |

- **About stays in the nav.** It is how clients meet you. Active on `/gabi`, `/matt`, and `/about`.
- **Both URLs in the sitemap.** Indexable. Their names should be findable.
- **Own Open Graph per URL.** Paste `/matt` in Greenhouse → preview is Matt’s name and title, not “Salt Studio — Subtle. Essential. Transformative.”
- **Reserved slugs:** `gabi`, `matt`, `about`. Do not create a CMS `page` with those slugs. `isAboutHref` in `lib/aboutPanel.ts` expands to all three.

No `/team/[slug]`. The user-facing URL is the first name.

---

## 4. The panel

Same drawer that already exists (`components/AboutPanel.tsx` — paper side panel, Monolog-shaped, GSAP slide). Do not invent a second chrome for “the husband page.”

### 4.1 Toggle (the only new chrome)

Segmented control at the top of the panel, after the close button:

```
[ GABI | MATT ]
```

- Two links, not a fake tab that forgets the URL. Gabi → `/gabi`, Matt → `/matt`.
- Active state is obvious (weight / underline / fill). Keyboard: the two links are enough; no custom roving tabindex unless the existing panel already has one.
- Switching must **not** close and reopen the drawer. Swap the inner content, reset `scrollRef` to top, replay the small `[data-about-reveal]` stagger on the new body if motion is on.
- Under the toggle, one quiet studio line — the pair story in the chrome, not in either bio. Something like “Salt Studio · Portland.” Not a manifesto.

This is “both of us, separately.” A client can meet either person. A recruiter sent `/matt` sees Matt first and can peek at Gabi if they’re curious. Neither bio has to do the other person’s job.

### 4.2 Gabi — job: studio trust

Migrate the current `lib/aboutPanel.ts` copy. It is already her voice. Do not replace it with a corporate team blurb.

| Section | Source |
| --- | --- |
| Name · role | Gabriella · design & software (or whatever she wants on the title line) |
| Bio | Existing `ABOUT_BIO` — origin, systems, the salt metaphor |
| Meta | EST 2025 · Portland |
| Video | Existing `/about/studio.mp4` stays on her side |
| Principles | Existing four: Reveal / few at a time / your hours / yours to keep |
| CTA | Studio interest form (primary) + Salt-product waitlist (secondary, red, already distinct) |

She may mention the pair in her bio (second beat) if it feels true. She does not have to. The toggle is already the pair.

### 4.3 Matt — job: 30-second scan, then proof

Hiring managers do not read. They scan for: title, a number, whether this person will show up on Monday.

| # | Section | What it does |
| --- | --- | --- |
| 1 | Name · title · one result line | “Growth marketing & sales. [One metric that would make a VP reply.]” |
| 2 | 3–5 highlights | Number + label only. Pipeline, revenue influenced, conversion, cycle time. No adjectives. |
| 3 | Selected work | 3–5 cases. Problem → what *he* did → result. Sales/growth, not websites. If a Salt client is used, his role is the headline. |
| 4 | How he works | 3–4 short process lines. Replaces Gabi’s principles — do not paste studio philosophy onto him. |
| 5 | Salt, as context | 4–6 sentences. Current collaboration, not a competing employer. |
| 6 | Close | Email, LinkedIn, résumé PDF. Optional availability line. |

**Do not put “Book a discovery call” on Matt.** That CTA tells a hiring manager the page is for clients. A quiet text link to `/contact` at the bottom is enough if someone landed here and actually wants the studio.

**Do not invent metrics.** Empty highlight slots stay unpublished.

**Availability lives only on `/matt`.** Not on Home, Capabilities, or Gabi. Clients should not read “open to roles” on the studio About.

### 4.4 Shared vs separate

| Shared (panel chrome) | Gabi only | Matt only |
| --- | --- | --- |
| Toggle, close, studio one-liner | Origin bio, studio video, principles, discovery CTA | Highlights, cases, how he works, résumé / LinkedIn / email, availability |
| Paper drawer, motion, type | | |

Homepage / Capabilities stay three doors. Optional later: one sentence that the studio can attach growth when that’s the brief. Not a fourth door.

---

## 5. Content model

### Why a `person` document (not two hardcoded files forever)

The panel already hardcodes Gabi in `lib/aboutPanel.ts`. Matt needs structured highlights, cases, a file résumé, and Person JSON-LD. Once there is a toggle, both sides should come from the same shape so the panel is one component, two documents.

The Studio desk already has a **People** divider (`sanity/plugins/deskStructure.tsx`) with Clients and Testimonials. `person` sits there.

v1 documents: **Gabi** (`slug: gabi`) and **Matt** (`slug: matt`). Gabi’s first published version can be the current hardcoded copy moved 1:1.

### `person` document

New: `sanity/schemas/documents/person.ts`

Groups: `overview` · `story` · `proof` · `contact` · `seo`

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | Required. Display name. |
| `shortName` | string | Toggle label. “Gabi” / “Matt”. |
| `slug` | slug | Required. URL = `/{slug}`. Reserved: `gabi`, `matt`. |
| `role` | string | e.g. “Growth Marketing & Sales” / “Design & software” |
| `headline` | string | Optional one result line under the name |
| `photo` | image + alt | Required for OG + Person schema |
| `location` | string | e.g. “Portland, Oregon” |
| `availability` | string | Optional. Hide if empty. Matt only, in practice. |
| `body` | portable text | Bio. Their voice. |
| `showStudioVideo` | boolean | On for Gabi (uses existing `/about/studio.mp4`). Off for Matt unless he has one. |
| `principles[]` | object: `title`, `body` | Gabi’s four. Empty for Matt. |
| `highlights[]` | object: `metric`, `label` | Max 5. Metric short (~12 chars). Empty for Gabi unless she wants them. |
| `cases[]` | object: `title`, `role`, `problem`, `whatTheyDid`, `result`, `year?`, `relatedProject?` | Embedded in v1. Optional project ref. |
| `howTheyWork[]` | string | Matt’s process lines. Empty for Gabi if principles cover it. |
| `studioNote` | text | Optional Salt-context paragraph (Matt). |
| `email` | string | |
| `linkedinUrl` | url | |
| `resume` | file (PDF) | Sanity asset. |
| `primaryCta` | reference → `callToAction` **or** enum `studio` / `personal` | `studio` = interest form + Salt-product waitlist (Gabi). `personal` = email / LinkedIn / résumé (Matt). Keep it obvious in Studio. |
| `seoTitle` / `seoDescription` | string | |
| `ogImage` | image | If empty, fall back to `photo` |
| `sortOrder` | number | Toggle order. Gabi `0`, Matt `1`. |

Client-friendly schema rules from `sanity/CLAUDE.md`: every field gets a plain-English `description`, validation messages explain why, groups on the document.

### Work categories — reuse projects, add a lane, don’t rename the old one

Live categories today (Sanity, 2026-08-17):

| Filter label | Slug | What the tagged work actually is |
| --- | --- | --- |
| AI & Automation | `ai-automation` | (empty so far) |
| Brand & Identity | `brand-identity` | Rebrands, visual systems |
| **Content & Marketing** | `content-marketing` | Copy, site strategy, SEO, quiz funnel — Enjoy Life, Cultivated, Photon, One Youth |
| Web & Software | `web-software` | Almost every project |

**Content & Marketing is already the right home for Gabi’s words-and-funnel work.** Those four projects are copywriting, SEO, site strategy, a Clarity quiz — not outbound, not pipeline, not a sales motion. Matt’s growth/sales cases should use the same `project` document type (case study sections, results, deliverables already exist). They should **not** be stuffed into that existing tag.

**Do not rename Content & Marketing → Growth Marketing.** That would relabel Enjoy Life’s volunteer-run site copy and Photon’s SEO as “growth,” which a hiring manager will smell and a client filter will lie about.

**Do add a fifth category: Growth Marketing** (`slug: growth-marketing`). Filter label: **Growth Marketing**. Headline later. No schema change — `workCategory` is already a document.

A project can wear both tags when both things happened (Cultivated’s quiz + Matt running the funnel). One Youth’s “Marketing” deliverable can pick up Growth *if* that work was campaign/pipeline, not just a marketing site.

**When the pill appears:** add the category in Studio whenever you want. Show it on `/work` only once at least one **published, unhidden** project uses it. Until then, set Work → filter pills to **Pick manually** and omit the empty Growth pill (and empty AI & Automation, if it still has no work). An empty fifth pill next to four real ones looks like a promise.

**Matt’s panel vs `/work`:**

- Salt growth work you’re allowed to show → a real `project`, tagged Growth Marketing, optional second tags. His `cases[].relatedProject` points at it. It appears on `/work/growth-marketing`.
- Pre-Salt / unnamed / no-permission work → stays an embedded case on his `person` doc only. Do not force it through the Work grid.

No new `growthCase` type. No `contributors[]` on `project` in v1 (add later if you want “Matt / Gabi” credits on the case page).

Optional later, not required: keep the `content-marketing` slug (so `/work/content-marketing` doesn’t break) and change the *filter label* to **Copy & Content** if “Marketing” next to “Growth Marketing” feels muddy. Don’t do that in the same breath as launching `/matt` unless the overlap bothers you on the live filter bar.

### What we are *not* changing in v1

- No new `service` for Growth (the Work category is not a priced door).
- No `contributors[]` on `project`.
- Do not migrate the unused `aboutPage` singleton. The live About *is* the person panel. `/about` just redirects to `/gabi`.

---

## 6. Routing + SEO brief

Match current Salt chrome (`design.md` + `.cursor/skills/salt-design/SKILL.md`). Same drawer. Not a new visual system.

### Why `/{slug}` and not `/team/{slug}`

The whole point is a link he can text. `createdbysalt.com/matt` is the link. A `/team/` prefix looks like an agency directory.

### How this avoids fighting `(personal)/[slug]`

`app/(personal)/[slug]/page.tsx` already serves generic CMS pages. **Person wins on slug collision.** The page does:

1. Fetch `person` by slug.
2. If found → render home (or the shared shell) + open the About panel on that person. Own `generateMetadata`.
3. Else fetch `page` as today.
4. Else `notFound()` (with the draft-mode escape hatch).

`generateStaticParams` unions person slugs + page slugs.

`/about` stays a dedicated folder and 308s to `/gabi`. `/about` is not a `person` slug.

Reserved collision list: `gabi`, `matt`, plus existing routes (`work`, `contact`, `capabilities`, `legal`, `quiz`, `projects`, `edit`, `brand`, `about`).

### Panel-on-home, URL honest

`/gabi` and `/matt` render the homepage underneath so the studio is still *there* (same as today’s About). The panel is open on load. Close → `router.replace('/')`.

Do **not** strip the path the way `AboutDeepLink` strips `?about=1`. The path is the shareable object.

### Metadata

Each person route:

- `title`: `{name} · {role}` (absolute if needed so it doesn’t become “Matt | Salt Studio | Salt Studio”)
- `description`: `seoDescription` or headline
- `alternates.canonical`: `/gabi` or `/matt`
- OG image from `ogImage` or `photo`

JSON-LD:

- `Person` — name, jobTitle, image, email, sameAs (LinkedIn), worksFor → Salt Studio
- `BreadcrumbList` — Home → [Name]
- Speakable: `h1`, headline, first highlight (Matt) or first bio paragraph (Gabi)

Do not change `NEXT_PUBLIC_BUSINESS_TYPE`. The site stays an Organization.

---

## 7. Phases

### Phase 0 — Content worksheet (human, blocker for *Matt*)

Gabi can ship from the copy already in `lib/aboutPanel.ts`. Matt does not publish empty.

Fill before `qcode` (Matt):

1. Title line, city, LinkedIn, public email.
2. **Availability line** — yes/no, and the exact sentence.
3. **3–5 highlights** he will stand behind in an interview. Number + label.
4. **3–5 cases** — context, what *he* did, result, year, can we name the company, Salt client + permission?
5. Headshot + résumé PDF.
6. Salt paragraph in his voice, 4–6 sentences.
7. **Growth for sale?** `not now` (recommended) / `yes, add a service door in this same build`.

### Phase 1 — Toggle + sendable URLs

`person` schema, both docs, panel toggle, `/gabi` `/matt` `/about→/gabi`, OG, sitemap. Gabi’s side can go live on existing copy while Matt stays draft.

### Phase 2 — Matt published

Highlights + at least two true cases. Résumé. Availability decision. Then he sends the link.

### Phase 3 — Growth as a studio product (optional, later)

New `service` in Sanity. Only when the staffing question has a real answer.

---

## 8. Implementation steps

**For each step: tool / skill / command is named. Do not write code until this plan is approved and Matt’s Phase 0 is filled enough to *model* the schema (copy can stay draft).**

### Step 1 — Lock remaining product calls

- Slugs are `gabi` and `matt`. About default is Gabi. Growth-for-sale = not now unless you say otherwise.
- Tool: you.

### Step 2 — `person` schema + desk

- Read `sanity/CLAUDE.md` before touching schemas.
- Create `sanity/schemas/documents/person.ts`.
- Register in `sanity.config.ts` `schema.types`.
- Add `S.documentTypeListItem('person')` under the existing People divider in `sanity/plugins/deskStructure.tsx`.
- Tool: Read + existing `service` / `client` schemas as the field-description pattern.

### Step 3 — Query, href, Presentation

- `personBySlugQuery`, `peopleQuery` (for the toggle list, ordered by `sortOrder`) in `sanity/lib/queries.ts` (`defineQuery` only).
- `resolveHref('person', slug)` → `/${slug}` in `sanity/lib/utils.ts`.
- `mainDocuments` for `/:slug` must resolve `person` *or* `page` (`_type in ["person", "page"] && slug.current == $slug`). Add `locations.person`.
- Tool: `sanity/CLAUDE.md` “New URL-backed document types” checklist.

### Step 4 — Typegen

- Command: `npm run typegen` (`qtypes`).
- Never hand-edit `sanity.types.ts` / `schema.json`.

### Step 5 — Routes

- Extend `app/(personal)/[slug]/page.tsx`: person first, then page. Person branch renders `<HomePage />` + opens the panel (or a thin wrapper that mounts the same provider state).
- `generateMetadata`: person title/OG when the slug is a person.
- `generateStaticParams`: union of person + page slugs (`stega: false`, `perspective: 'published'`).
- Change `app/(personal)/about/page.tsx` from `redirect('/?about=1')` to `redirect('/gabi')`.
- Delete the `?about=1` strip behavior in `AboutDeepLink` (or remap `/about` only).
- Next.js 16: `params: Promise<{slug: string}>`. Draft-mode 404 escape hatch stays.
- Tool: Context7 (`user-context7`) for Next.js 16 App Router metadata + `app/CLAUDE.md`. Pattern: `app/(personal)/projects/[slug]/page.tsx`.

### Step 6 — Panel UI

- Teach `AboutPanel` / `AboutPanelProvider` a selected person (`slug`), a people list, and the toggle.
- Nav About → `router.push('/gabi')` (or open + push). `isAboutHref` matches `/gabi`, `/matt`, `/about`.
- Close → `router.replace('/')`.
- Toggle → `router.push('/matt' | '/gabi')` without unmounting the drawer.
- Fetch people in the `(personal)` layout (already a server layout) and pass them into the provider, **or** have the person/`[slug]` page pass the active person and let the layout fetch the toggle list. Do not client-fetch Sanity.
- Images through `ImageBox` + `urlForImage`. Portable text through `CustomPortableText`. Tailwind inline, no `cn()`.
- Tool: Read `.cursor/skills/salt-design/SKILL.md`, `design.md`, `components/CLAUDE.md`. Motion: existing About GSAP only — no new pattern. Read `components/AboutPanel.tsx` and `components/Navbar.tsx` before editing.

### Step 7 — SEO / AEO / share card

- Add `generatePersonSchema` + `<PersonStructuredData />` in `lib/seo/structured-data.tsx`, export from `lib/seo/index.ts`.
- Person slugs in `app/sitemap.ts` as `/${slug}` (not `/team/...`).
- Tool: `lib/seo/CLAUDE.md`. Schema.org Person.

### Step 8 — Seed Gabi from existing copy

- Create the Gabi `person` document from `ABOUT_BIO`, `ABOUT_PRINCIPLES`, `ABOUT_CTA`, `ABOUT_META_LINE`. `primaryCta: studio`. `showStudioVideo: true`. `shortName: Gabi`.
- Then delete the hardcoded strings from `lib/aboutPanel.ts` (keep helpers like `isAboutHref`).
- Tool: Sanity MCP `create_documents` after `get_schema`, or Studio UI. No-placeholder rule: do not publish Matt until Phase 0 is real.

### Step 9 — Studio interest form (sitewide primary CTA)

See §18. Swap “Book a discovery call” → interest form. Do not advertise a calendar.
- Tool: `lib/contactMenu.ts`, `components/ContactMenu.tsx`, `components/ContactForm.tsx`, Sanity CTA docs + contact page success copy.

### Step 10 — Optional Growth service (Phase 3 only)

- Create a `service` document in Studio. No schema change.
- Door name: **Growth**. Retainer pricing, like AI Automations.
- Tool: Sanity MCP / Studio. Copy from the existing AI Automations service.

### Step 11 — Verify

- `npm run type-check`
- `npm run lint`
- Manual: `/gabi` opens Gabi; toggle to Matt updates URL and content without closing; close returns to `/`; `/about` → `/gabi`; nav About is active on both; `/matt` OG is Matt; résumé downloads; empty Matt sections omit; Escape closes; no `?about=1` leftover; no public Cal.com link; contact success copy is the list, not a 24-hour SLA.
- Tool: `qcheck` when you want the review pass.

---

## 9. Files

| Action | Path |
| --- | --- |
| Create | `sanity/schemas/documents/person.ts` |
| Edit | `app/(personal)/[slug]/page.tsx` (person-first) |
| Edit | `app/(personal)/about/page.tsx` (redirect → `/gabi`) |
| Edit | `components/AboutPanel.tsx` (toggle, person content, URL sync) |
| Edit | `lib/aboutPanel.ts` (href helpers; drop hardcoded bio once seeded) |
| Edit | `components/Navbar.tsx` (`isAboutHref` + About → `/gabi`) |
| Edit | `app/(personal)/layout.tsx` (pass people into the provider, if that’s the fetch point) |
| Edit | `sanity.config.ts` |
| Edit | `sanity/plugins/deskStructure.tsx` |
| Edit | `sanity/plugins/resolve.ts` |
| Edit | `sanity/lib/queries.ts` |
| Edit | `sanity/lib/utils.ts` |
| Edit | `lib/seo/structured-data.tsx` |
| Edit | `lib/seo/index.ts` |
| Edit | `app/sitemap.ts` |
| Edit | `lib/contactMenu.ts` (drop Cal.com as primary) |
| Edit | `components/ContactMenu.tsx` |
| Edit | `components/ContactForm.tsx` (success copy — no “one business day”) |
| Edit | Sanity `callToAction` + contact page + home/services CTA labels (Studio, not code if already CMS) |
| Generate | `sanity.types.ts`, `schema.json` via `npm run typegen` |

No `app/(personal)/team/` route. No vanity `redirects` in `next.config.ts` — the first name *is* the route.

---

## 10. Success criteria

- Matt can send **`createdbysalt.com/matt`**. The link preview is his name and title. The panel is already on him.
- Gabi can send **`createdbysalt.com/gabi`**. Same panel, her story, studio CTAs.
- Toggle switches person and URL without closing the drawer.
- Close never leaves a first-name URL up with the panel shut.
- A hiring manager can answer “what does he do and what has he done?” without reading the homepage.
- A client landing on `/` still sees a studio that builds websites, AI, and software.
- About in the nav still means About. It opens Gabi. Matt is one tap.
- No public Growth price until you decide you can deliver it if he takes a full-time seat.
- No invented metrics. No “Book a discovery call” on Matt. No public calendar on the studio side either — interest form only. Never say “not taking clients.”

---

## 11. Out of scope

- Long-form `/about` page (panel stays; `/about` redirects to `/gabi`).
- Migrating the unused `aboutPage` singleton.
- Fourth homepage door (unless Phase 3 is explicitly pulled in).
- `contributors` on `project`, combined “build + grow” packages.
- Renaming Content & Marketing. Growth Marketing is a *new* category, created in Studio (no code).
- Separate personal domain or subdomain.
- Blog / thought-leadership.
- Changing the quiz funnels or proposal engine to know about Growth.
- Bilingual (pt-BR) person fields.

---

## 12. Risks

| Risk | What we do |
| --- | --- |
| `/matt` looks like “the studio is for sale / he’s leaving” | Availability only on his profile. Gabi’s CTA stays the studio call. Homepage copy unchanged. |
| Recruiter toggles to Gabi and gets confused | Good. They see the pair. His bio still leads with him. Salt note is short. |
| Client toggles to Matt and hits a résumé | Fine — that’s who he is. His CTA is not “book a call” unless you later choose it. |
| `page` slug collides with `gabi` / `matt` | Person wins. Reserved list. Don’t create those pages. |
| Land on `/matt`, close, URL still `/matt` | Close always `replace`s to `/`. |
| Empty Matt ships as lorem | Draft until highlights + two true cases. Gabi can go live first. |
| `?about=1` bookmarks | `/about` → `/gabi`. Optional: keep reading `?about=1` once and replace with `/gabi`. |

---

## 13. Source of truth — LinkedIn (pasted 2026-08-17)

The spoken dump was useful. **LinkedIn is what we publish from.** It also corrects the dump:

| Dump said | LinkedIn says | Use |
| --- | --- | --- |
| Senaki, $5k/day, CPL $35→$25, 2,000 leads/mo | Trade MKT **flagship account** (unnamed): CPL ~$35 → $25–27, **1,500–2,000** leads/mo. Reach layer + converting layer. | Print Trade numbers. Do **not** name Senaki unless he confirms that’s the flagship. |
| $33k/day across YT/FB/IG/display/search | Same number, **senate campaign that won**. Largest single-day budget in the Trade book. | One case. Spend + win. |
| $3M paid media | Trade MKT portfolio, Meta + Google + native | Trade highlight. Not Salt revenue. |
| Food / Foot Summit | Salt: “largest online soccer summit in Brazil” (no brand name) | Case without a made-up name until he spells it. |
| 60+ niches / real estate | Trade: **40+ accounts, 20 industries** (contractors, housing, schools, law, studios, retail, municipal + political) | 20 industries, not 60 niches. |
| Freelance Jan 2021, Salt 2025 | LinkedIn: **SALT Studio Jan 2021–present** (his practice); Vida Plena **2018–2020**; Mannahouse **Aug 2024–present** | His *work* dates follow LinkedIn. Studio founding stays **2025** — see §14. |

Employers we can name (they’re on a public LinkedIn): **Mannahouse**, **SALT Studio**, **Trade MKT** (Trade \| Ideias que rendem), **Comunidade Vida Plena**.

Already on createdbysalt.com: project **One Youth Conference** (`one-youth-conference`, 2025) — logo, marketing, site, conference web app, 2,000 attendees. Matt’s Mannahouse bullet is the acquisition half of that same weekend. Tag **Growth Marketing** when the category exists; `cases[].relatedProject` → this doc.

---

## 14. Two facts. Both stay.

**LinkedIn is the source of truth for his work** — titles, employers, dates, numbers, About, cases.

**Salt Studio the studio — the thing on this site — was founded in 2025** when you joined forces. `EST 2025` stays. We do not backdate the studio to 2021. We do not ask him to rewrite LinkedIn.

How that reads, without a fight:

| Year | What happened |
| --- | --- |
| Feb 2018 | Gabi starts freelance |
| Jan 2018–Aug 2020 | Matt: Digital Marketing Manager, Comunidade Vida Plena |
| Jan 2021– | Matt’s growth practice (LinkedIn lists this as SALT Studio — Founder & Growth Marketer) |
| Oct 2021–Oct 2022 | Matt: Senior Marketing Manager, Trade MKT (Curitiba) |
| Aug 2024– | Matt: Director of Growth and Engagement, Mannahouse (Portland, current) |
| 2025 | You join forces and **found Salt Studio** — the husband-and-wife studio this site is |

On the chrome and on Gabi: **est. 2025**.

On Matt: his About and cases follow LinkedIn (practice since 2021, in market since 2018). The studio note is where 2025 lives for him — one line, not a rewrite of the About:

> I ran the growth practice from 2021. Gabi and I founded Salt Studio in 2025. She builds the system. I fill the pipeline.

Do not print “Salt Studio, founded 2021” anywhere on createdbysalt.com.

---

## 15. Draft copy — Matt (from LinkedIn)

Voice: Salt DECIDE. Current role first, then the book that proves he can run a large one.

### Title + headline

- **Title:** Director of Growth and Engagement · Founder, Salt Studio
- **Headline:** Why people do what they do — turned into a marketing engine a business can count on.
- **Location:** Portland, Oregon
- **Availability:** hide. He has a full-time seat at Mannahouse. Do not put “open to roles” on `/matt` unless he writes that sentence himself.
- **LinkedIn:** https://www.linkedin.com/in/matheushnm/
- **Email:** still needed

H1: **Matheus** (LinkedIn). Toggle: **Matt**. URL: `/matt`.

The About below is **his**. Do not rewrite it into a Salt-voice impersonation. Tighten line breaks only.

### Highlights (5)

Use the About’s scale numbers. Do not also show $2M+ (that’s inside ~$10M) or $3M media (that’s inside $3.6M).

| Metric | Label |
| --- | --- |
| ~$10M | Revenue and contract value, eight years |
| $3.6M | Paid media, three continents |
| $3M / yr | Budget across 40+ accounts, 20 verticals |
| 36 | Person team |
| 21% | ONE Conference registration growth (2,000+ attendees) — current, Portland |

CPL $35→$25–27, $33k/day, $150K save, 12 accounts stay in the cases. Both ends of the market (local till vs committee) stay in the bio — they’re the point, not a sixth tile.

### Cases (panel; promote to `/work` where noted)

**1. ONE Conference — Mannahouse + Salt** *(current · already a project)*
- Role: Own the full acquisition funnel. Salt also shipped brand, site, and the conference web app (existing deliverables).
- Problem: Largest youth conference in the Pacific Northwest. Registrations have to grow without losing the room.
- What he did: Full acquisition. Lifecycle and retention across 4 campuses (email/SMS, content tracks, cohort leadership pipelines) so first-timers come back.
- Result: 2,000+ attendees. Registrations **+21% YoY**.
- Also (same seat, not a second case): $150K+ vendor contract cancelled under a safety risk — full deposit converted to a zero-penalty credit, replacement event stood up in a week. 100+ staff, volunteers, contractors.
- On `/work`: yes. Add **Growth Marketing**. Point `relatedProject` at `one-youth-conference`.

**2. Trade MKT — the book**
- Role: Senior Marketing Manager. 36-person team. 40+ advertiser accounts, 20 industries.
- Problem: Parallel paid acquisition that had to hit CAC and ROAS, not reach. He owned the relationships and the renewals.
- What he did: Operating rhythm (experiment planning, weekly readouts, budget reallocation). Segmentation, targeting, A/B systems used across the book. Flagship quarterly: low-cost reach layer + converting layer.
- Result: **$3M annual** budget in this seat. Flagship CPL **~$35 → $25–27**, **1,500–2,000 leads/month** held. About’s “national education organization / state’s largest university / government agencies” is this end of the market — name them only if he wants proper nouns (spoken “Senaki” may be the education org).
- Name the flagship client: only if he confirms. Until then: “flagship account.”
- On `/work`: only with Trade’s / the advertiser’s permission. Fine on `/matt`.

**3. Senate campaign — Trade MKT**
- Role: Largest single-day budget in the book.
- What he did: **$33,333/day** across YouTube, Facebook, Instagram, Display.
- Result: **The campaign won.** National awards: Best Strategic Project and Technology Implementation; one campaign named best in the country.
- Name the senator / award body: `[VERIFY]` if he wants them on the page. LinkedIn already says “senate campaign that won.”

**4. The Salt practice — 2021–**
- Role: Founder & Growth Marketer. He sourced and closed **all** new business. 12 concurrent accounts. Retainers from first pitch through renewal. *(This is the sales proof. Keep it.)*
- Paid: Meta, Google, YouTube. Managed to CAC, ROAS, payback — not reach.
- Result: **$2M+** client revenue from funnels built, tested, and optimized end to end.
- Nested launches (one extra line each, not their own cases unless he wants pages): influencer courses at **10x ROI**; largest online soccer summit in Brazil. `[VERIFY]` summit name.
- On `/work`: only named clients with permission.

**5. Comunidade Vida Plena — 2018–2020** *(origin, shorter)*
- Role: Digital Marketing Manager (contract, alongside agency work).
- What he did: COVID digital transformation from zero — livestream, online giving, site, email, Meta, social. Onboarding → content → donor journey.
- Result: Online engagement **+40%**. Giving retention via structured touchpoints.
- On `/work`: optional. Strong on `/matt` as the start date.

### How he works

His closing graph, as four lines:

1. **Diagnose the constraint.** Not the channel. The thing that’s actually stuck.
2. **Test against it. Reallocate on evidence.** Weekly, not quarterly theater.
3. **CPA and payback, not reach.** A local till and a committee budget both have to clear this.
4. **Weeks of production, days.** AI-assisted pipelines for copy, creative variation, and analysis — same standard he runs at Mannahouse with Claude Code and multi-agent content.

### Bio (About — his words)

> I'm fascinated by why people do what they do, and what it takes to turn that into a marketing engine a business can count on.
>
> I've worked both ends of the market: 40+ local businesses and my own companies on one side, and some of Brazil's largest institutions on the other, including a national education organization, the state's largest university, and government agencies.
>
> A local business teaches you that every dollar has to show up in the till. A large institution teaches you stakeholders, procurement, and campaigns that survive a committee. Eight years in: $3.6M in paid media across three continents, a $3M annual budget across 40+ accounts in 20 verticals, a 36-person team, and roughly $10M in revenue and contract value.
>
> Diagnose the constraint, test against it, reallocate on evidence. Manage to CPA and payback, not reach. Build AI-assisted pipelines that turn weeks of campaign production into days.

Do not add a fifth paragraph that restates the numbers. The studio / Gabi / Mannahouse line is the studio note, not a rewrite of this.

### Studio note

> I ran the growth practice from 2021. Gabi and I founded Salt Studio in 2025. She builds the system. I fill the pipeline. I still hold a full-time growth seat at Mannahouse. The cases above are mine.

### Meta on his panel

`IN MARKET SINCE 2018` · `SALT STUDIO EST 2025` · `PORTLAND`

### CTAs

Email · LinkedIn · résumé. No discovery call. No “open to roles” by default.

---

## 16. Draft copy — Gabi timeline (unchanged intent)

Studio chrome stays **EST 2025**.

Her first bio beat:

> Hey, I'm Gabriella. I've been building for organizations since 2018 — sites, systems, the unglamorous work of making tools a small team can actually run. Matt and I founded Salt Studio in 2025 because I kept watching good organizations get stuck with the wrong tools. Websites nobody on their team could update without calling a developer. Hours every week going to repetitive work that didn't need a person. Small teams with more mission than time.

Keep paragraphs 2–3. Her meta: `BUILDING SINCE 2018` · `SALT STUDIO EST 2025` · `PORTLAND`

Toggle chrome: `Salt Studio · est. 2025 · Portland`

---

## 17. Still verify (short list)

- [ ] H1: Matheus or Matt
- [ ] Public email
- [ ] Leave LinkedIn as-is. Do not “fix” his 2021 Salt practice date.
- [ ] $10M / $3.6M / $3M annual — he stands behind all three as written (different things: career value, career media, one-year book)
- [ ] Name the education org, university, agencies — or keep generic as in the About
- [ ] Flagship Trade account: name it (Senaki / education org?) or leave unnamed
- [ ] Senate: name the race / award bodies, or keep generic
- [ ] Soccer summit: official name
- [ ] Permission to name Trade, Vida Plena, Mannahouse on `/matt` (LinkedIn already does)
- [ ] Add Growth Marketing to One Youth Conference when the category exists

Publish `/matt` from §15. Gabi’s 2018 line can ship with the toggle first.

---

## 18. Studio CTA — interest form, not a calendar

Amends the 2026-07-26 doctrine (“one CTA: book a discovery call”). You’re not taking clients right now. The site must not say that. It should feel like a line for something scarce.

The form already exists on `/contact`. The leak is everywhere else: nav popover, About, home, Capabilities, quizzes — all still say **Book a discovery call** and point at `https://cal.com/createdbysalt/discovery` (`CONTACT_BOOK_HREF` in `lib/contactMenu.ts`). WhatsApp is “usually same hour.” The form success line promises a reply in one business day. That is an open shop, not a line.

### How it should feel

A few projects a year. You write. If it’s a fit, we write back. Same filter the site already has — now the ask matches.

| Print | Do not print |
| --- | --- |
| Request a conversation | Book a discovery call |
| Tell us about the work | Schedule 25 minutes |
| You’re on the list. We take a few projects a year. If this is one of them, we’ll write. | We’ll be back within one business day |
| A few projects a year. We read every note. | Not taking clients / fully booked / closed / on pause |
| Join the Salt waitlist (product, red, already separate) | Merging the studio list with the Salt software waitlist |

**Primary label (studio):** `Request a conversation`  
**Submit:** `Send interest →`  
**Success:** `You're on the list.` + `We take a few projects a year. We read every note. If this is one of them, we'll write.`

Gabi’s panel primary goes to `/contact` (the form). Secondary stays the Salt-product waitlist (`/contact?subject=Salt%20waitlist` or whatever it is today). Two lists. Do not mix them.

### What we turn off

- Nav contact menu: remove “Book a discovery call · 25 minutes.” The menu opens `/contact` or the form. Drop or bury WhatsApp “same hour” — it kills the line. Email `hello@` can stay as a quiet fallback.
- `CONTACT_BOOK_HREF` — stop using it as the sitewide primary. Cal.com can stay in your pocket for people you choose to invite. Not on the site.
- Home / Capabilities / service `nextStep` / philosophy CTAs: same label, same `/contact`.
- Quiz result primaries (“Book an intro call”, “Book your automation audit”): same form. Audit as a paid product is a later decision; don’t put a Stripe/calendar door on a closed book.

### The form — Cal.com discovery questions, Resend delivery

Do not invent a second form stack. `/contact` already posts through `submitContactForm` in `app/actions/contact.ts` → **Resend** (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_EMAIL`). Quizzes already use the same Resend path. Reuse it.

What exists today:

| Surface | What it is |
| --- | --- |
| Cal.com `createdbysalt/discovery` | The real discovery intake (questions below). Calendar on top. |
| `/contact` fallback form | Weaker 6-field “Calls aren’t your thing?” form. Already emails via Resend. |
| `ContactForm.tsx` `fieldsForAskPath` | Looks for `projectType` / `company` / `message` — **does not match** the live Sanity field names. Must be fixed or bypassed so every discovery field actually renders. |

**Job:** `/contact` becomes the discovery form. Same questions as Cal.com. No slot picker. Submit → Resend to you, confirmation to them. Turn `contactBookingSection` off.

Pulled from Cal.com’s public event (`GET /v2/event-types?username=createdbysalt&eventSlug=discovery`) on 2026-08-17. Skip calendar-only fields (`location`, `guests`, `rescheduleReason`).

| # | Field | Type | Required | Options / notes |
| --- | --- | --- | --- | --- |
| 1 | Your name | text | yes | |
| 2 | Email | email | yes | `replyTo` on the Resend message to you |
| 3 | Your organization or business name | text | yes | |
| 4 | What industry are you in? | select | yes | Church or faith community · Coaching practice · Nonprofit or cause-driven organization · Creative studio or agency · Something else |
| 5 | Your website | text / url | no | placeholder `https://` |
| 6 | What type of project are you looking for? | **multiselect** | yes | Website · Software · AI Automation · Not sure yet |
| 7 | What is your budget range? | select | yes | Under $5,000 · $5,000–$10,000 · $10,000–$25,000 · $25,000–$50,000 · $50,000+ · Not sure yet — let's discuss |
| 8 | What is your timeline? | select | yes | ASAP — within the next month · 1 to 3 months · 3 to 6 months · 6 months or more · Flexible — no firm deadline |
| 9 | What is the primary goal for this project? | textarea | yes | “Tell us what you are hoping to achieve...” |
| 10 | Anything else we should know? | textarea | no | Cal.com’s default `notes` |
| 11 | How did you hear about us? | select | no | Referral · Existing or past client · Instagram · LinkedIn · Twitter / X · Google search · AI · Other |

Budget bands are Cal.com’s, not the old fallback form’s (`Under $5,500` / `$15,000–75,000`). Use the discovery list.

**Multiselect:** the contact schema today is text / email / tel / textarea / select. Add a `multiselect` field type (or a checkbox group) so “Website + AI” can both be true. Don’t collapse it to a single select.

**Resend (both directions):**

1. **To you** (`CONTACT_EMAIL` / hello@): subject `Interest — {name} · {org}`. Body is every answer, labeled. `replyTo` = their email.
2. **To them:** subject `You're on the list.` Body matches §18 success copy — few projects a year, we read every note, if this is one of them we’ll write. No “we’ll reply in 48 hours.” No calendar link.

If `RESEND_API_KEY` is missing in dev, keep the current console log — don’t fake a send.

**Sanity:** update `contactPage` → formConfig fields to the table above. Hero: not “Book a discovery call.” Form title: not “Calls aren’t your thing?” Disable the booking section. Footer response line: drop the 48-hour SLA.

**Optional later (not this build):** write the row to a Sanity `interestSubmission` so it sits next to quiz leads. v1 is Resend. You asked for email.

### What we do not do

- Do not add fake scarcity (“3 spots left”).
- Do not add a progress bar or “position in queue.”
- Do not say you’re at capacity.
- Do not keep the calendar one click behind a “prefer to book?” link.
- Do not build a new `/api/interest` if the server action already sends mail. Fix the action; don’t fork it.

Matt is unchanged: email, LinkedIn, résumé. If someone on `/matt` wants the studio, a quiet `Request a conversation →` to `/contact` is enough.
