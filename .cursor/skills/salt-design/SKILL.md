---
name: salt-design
description: >-
  Legacy Salt Studio site chrome (still Photon visual system) — full-bleed media,
  Pitch Sans, ghost CTAs. Use when editing existing public UI under app/(personal)/
  until the Salt redesign ships. Do not invent a new look from this skill alone.
---

# Salt Design (legacy look)

Read **`design.md`** at the repo root before inventing layout or type. Tokens live in **`app/globals.css`**. Canonical spacing page: **`/work`**.

> Visual redesign is planned separately. This skill documents the **current** inherited Photon system so edits stay consistent until then.

## Non-negotiables

1. **Media bleeds; chrome insets.** Photography, video, and product touch the viewport edge. Only UI (titles, filters, forms, nav) gets horizontal padding — `.page-chrome` (`px-5` / `md:px-6`).
2. **No padded product cards.** Work/product grids use `.media-bleed` + `.gap-hairline` (2px). Never wrap media in `max-w-*` + side gutters.
3. **Type sits on or beside media**, not in a caption band below a padded image. Default recipe: bottom-left stack inside the tile (`.media-caption`) — bold uppercase title → mono credit → muted mono tags.
4. **Pitch Sans only** (`font-sans` / `font-mono`). Uppercase for display, nav, labels, CTAs. Sentence case only for editorial body.
5. **Ghost CTAs** — `.btn-ghost` / `.btn-solid`. Sharp corners. Trailing `→` or `+`. No pills on primary actions.
6. **Template-literal Tailwind** — no `cn()` / `clsx`.
7. Follow **`frontend-design`** for craft, but **this file + `design.md` win** on spacing and type placement for the current system.

## Spacing cheat sheet

| Surface       | Class / token    | Notes                             |
| ------------- | ---------------- | --------------------------------- |
| Page chrome   | `.page-chrome`   | H1, search, filters, empty states |
| Media band    | `.media-bleed`   | Zero inline padding; full width   |
| Tile gap      | `.gap-hairline`  | 2px contact sheet                 |
| Type on media | `.media-caption` | `p-4` / `md:p-5` inside the frame |

```
chrome (inset) → media wall (bleed) → type inset ON tiles
```
