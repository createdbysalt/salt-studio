# Developer Guide

> **Versão em Português:** [GUIA-DO-DESENVOLVEDOR.md](./GUIA-DO-DESENVOLVEDOR.md)

This guide covers everything you need to know to work on Salt Studio client projects built with this template.

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd <project-name>
npm install

# Set up environment
cp .env.example .env.local
# Fill in the Sanity credentials (ask team lead)

# Start development
npm run dev
# Opens at http://localhost:4000
```

## Tech Stack

| Technology   | Version | Purpose                             |
| ------------ | ------- | ----------------------------------- |
| Next.js      | 16      | React framework with App Router     |
| React        | 19      | UI library (React Compiler enabled) |
| Sanity       | 5       | Headless CMS at `/admin`            |
| Tailwind CSS | 4       | Utility-first CSS                   |
| TypeScript   | 5.9     | Type safety                         |

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (personal)/         # Public site routes
│   │   ├── page.tsx        # Homepage
│   │   ├── [slug]/         # Dynamic pages
│   │   └── layout.tsx      # Site layout (navbar, footer)
│   └── admin/              # Sanity Studio
├── components/             # React components (flat structure)
├── sanity/
│   ├── schemas/            # Content schemas
│   │   ├── documents/      # Page, Project, etc.
│   │   ├── singletons/     # Home, Settings
│   │   └── objects/        # Hero, CTA, FAQ, etc.
│   └── lib/                # Sanity utilities
├── lib/
│   ├── analytics/          # GTM, consent, tracking
│   └── seo/                # Structured data, sitemap
└── docs/                   # Developer documentation
```

## Key Conventions

### 1. Server Components by Default

Every component is a server component unless it needs client-side interactivity:

```tsx
import {useState} from 'react'

// Server component (default) - no directive needed
export function Header({title}: {title: string}) {
  return <h1>{title}</h1>
}

// Client component - only when needed
;('use client')

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 2. Sanity Data Fetching

Always use `sanityFetch` from `@/sanity/lib/live`, never `client.fetch`:

```tsx
import {sanityFetch} from '@/sanity/lib/live'
import {homePageQuery} from '@/sanity/lib/queries'

export default async function HomePage() {
  const {data} = await sanityFetch({query: homePageQuery})
  return <div>{data.title}</div>
}
```

### 3. Styling with Tailwind

Use inline classes, template literals for conditionals. No `cn()` or `clsx`:

```tsx
// Good
<div className="flex items-center gap-4">
<div className={`text-lg ${isActive ? 'font-bold' : 'font-normal'}`}>

// Avoid
<div className={cn('flex', isActive && 'font-bold')}>
```

### 4. Design Tokens

Use CSS variables for colors, not Tailwind color classes:

```tsx
// Good - uses design tokens
<button style={{backgroundColor: 'var(--color-primary)'}}>

// Avoid - hardcoded colors
<button className="bg-blue-600">
```

## Common Tasks

### Adding a New Page

1. Create file: `app/(personal)/your-page/page.tsx`
2. Fetch data with `sanityFetch`
3. Add to `sanity/plugins/resolve.ts` for Presentation tool

### Adding a New Block Type

1. Create schema: `sanity/schemas/objects/your-block.ts`
2. Register in `sanity.config.ts`
3. Add handler in `components/CustomPortableText.tsx`
4. Create component: `components/YourBlock.tsx`
5. Run `npm run typegen`

### Modifying a Schema

1. Edit the schema file in `sanity/schemas/`
2. Run `npm run typegen` to regenerate types
3. Update any components that use the changed fields
4. Test in Sanity Studio

## Git Workflow

### Branch Naming

```
feat/hero-section      # New feature
fix/contact-form-bug   # Bug fix
docs/setup-guide       # Documentation
chore/update-deps      # Maintenance
```

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(hero): add background image support
fix(contact): resolve email validation bug
docs(readme): update setup instructions
style(navbar): adjust mobile spacing
refactor(analytics): simplify consent logic
chore(deps): update dependencies
```

### Pull Request Process

1. Create branch from `main`
2. Make changes, commit often
3. Push and open PR using the template
4. Request review from team lead
5. Address feedback
6. Merge when approved

## Troubleshooting

### Types are out of date

```bash
npm run typegen
```

### Port 4000 is in use

```bash
lsof -ti:4000 | xargs kill -9
npm run dev
```

### Sanity Studio not loading

Check `.env.local` has correct:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`

### Changes not reflecting

1. Hard refresh: `Cmd+Shift+R`
2. Clear Next.js cache: `rm -rf .next`
3. Restart dev server

## Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Project CLAUDE.md](../CLAUDE.md) - Full codebase documentation

## Need Help?

- Check `CLAUDE.md` files in each folder for detailed conventions
- Ask in the team Slack channel
- Tag `@tech-lead` for architecture questions
