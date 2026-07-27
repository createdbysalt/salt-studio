/**
 * Isolated layout for Sanity Studio at /edit
 *
 * Does NOT import globals.css or Tailwind — the Studio uses its own design system.
 * Fonts are applied on <html> in the root layout so Presentation previews match the site.
 *
 * Must not render <html> or <body>; only the root layout owns those tags.
 */

export default function AdminLayout({children}: {children: React.ReactNode}) {
  return children
}
