# Photon copy v3 — R2 edits tracking

**Date:** 2026-05-17  
**Source feedback:** `051726 - PHOTON WEB COPY R2 FEEDBACK.md` (Liam)  
**Frozen archive:** `docs/2026-04-10-photon-website-copy-v2.md` (unchanged)  
**Working deliverable:** `docs/2026-04-10-photon-website-copy-v3.md`  
**Out of scope:** HTML mirrors, Sanity, `app/`, Google Sheet row imports

---

## Rentals IA (SALT recommendation → documented in v3)

**Decision:** Hybrid — three indexable URLs + one **Rentals** nav item with hover/focus dropdown.

| Route              | Purpose                                                            |
| ------------------ | ------------------------------------------------------------------ |
| `/rentals/studio`  | Portland studio rental                                             |
| `/rentals/podcast` | Portland podcast room                                              |
| `/rentals/gear`    | Gear list + PDFs                                                   |
| `/rentals`         | Optional thin hub (three cards) or default redirect — dev at build |

Liam deferred IA to SALT; his only concern was nav clutter — dropdown resolves it.

---

## Section checklist (v3)

| Section | R2 action                                                         | Status |
| ------- | ----------------------------------------------------------------- | ------ |
| §00     | v3 changelog; email forwarding closed (Liam sets up Google)       | Done   |
| §01     | Rentals nav dropdown; CTA routes to `/rentals/*`                  | Done   |
| §02     | Option C relationship line; homepage meta 6,000 sq ft             | Done   |
| §03     | High-speed / Music / Fashion / Art Dept meta; all pills at launch | Done   |
| §04–§05 | Sheet handoff note only (no row paste)                            | Done   |
| §06     | No copy edits (looks great)                                       | Done   |
| §07     | Tab 3 tile labels deferred; note in §11                           | Done   |
| §08     | Three rental page templates + Good to know; hub optional          | Done   |
| §09–§10 | No changes                                                        | Done   |
| §11     | R2 closures + deferred handoffs + dev punch list                  | Done   |
| §12     | Short pre-launch list only                                        | Done   |
| §13     | Terms from R2 (build/Sanity, not footer)                          | Done   |

---

## R2 closures

| Item                               | Resolution                           |
| ---------------------------------- | ------------------------------------ |
| O1 Relationship line               | Option C                             |
| O2 Sq ft                           | 6,000 throughout                     |
| O3 Launch pills                    | All 10 categories                    |
| O4 Music / Fashion / Art Dept meta | R2 verbatim (avant-garde normalized) |
| O10 Email                          | hello@ → Chris + Liam; form to both  |
| Rentals IA                         | Hybrid three-page + dropdown         |
| Legal Terms                        | §13 appendix                         |

---

## Still open (pre-launch, not blocking v3 doc review)

| Item                                         | Owner                   |
| -------------------------------------------- | ----------------------- |
| Footwear + Studio category meta descriptions | Liam (v1 drafts in §03) |
| Podcast mic models                           | Liam                    |
| Testimonials (5 hero projects)               | Liam                    |
| Gear + studio PDFs                           | Liam                    |
| Privacy / Cookies / Accessibility            | Liam / SALT             |
| Sheet → Sanity                               | Phase 2                 |
| Photography                                  | Dropbox / shoot         |

---

## Verification

- [x] v2 MD not modified
- [x] No `*-v3.html` created
- [x] v3 title and status line updated
- [x] Grep v3: no `5,000 sq ft` (only historical notes if any)
- [x] Option C + R2 category meta present
- [x] §08 hybrid rentals + Good to know
- [x] Liam note: `docs/photon-r2-liam-review-note.md`

---

## Phase 2 (after copy lock)

1. Liam reviews v3 MD
2. Locked v3 → Sanity (page copy)
3. Google Sheet → Sanity (projects, Photon handled, capabilities tab 3)
4. Build: rental routes, nav dropdown, JSON-LD, legal `/terms` from §13
