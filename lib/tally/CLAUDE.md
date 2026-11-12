# lib/tally/

Shared Tally forms for Salt church website clients. The kit lives in Tally. This folder is the catalog accessors and the rules for adding the next form.

## Where the form IDs live

**Form IDs and URLs are client data and stay out of the repo.** The whole catalog is one JSON env var, `NEXT_PUBLIC_TALLY_CHURCH_FORMS` — real values in `.env.local` (untracked) and Vercel, shape documented in `.env.example`. The repo is public; never hardcode a Tally form ID or URL in a tracked file (including this one).

## Catalog

[`church-forms.ts`](church-forms.ts) parses the env var and exports:

| Export                             | What it is                                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| `PROTECTED_TALLY_FORM_IDS`         | Enjoy Life + Before We Meet + MFI live form IDs. Never PATCH, rename, or delete.    |
| `ENJOY_LIFE_TALLY_FORMS`           | Example URLs. Do not send new clients here.                                          |
| `CHURCH_TALLY_FORMS`               | The Salt Church kit, keyed by `ChurchTallyFormKey`. `'#'` when the env var is unset. |
| `CHURCH_TALLY_FORM_META`           | Title, who fills it, what we expect.                                                 |
| `CLIENT_GETTING_STARTED_OVERRIDES` | Per-client Getting Started swaps, keyed by portal slug.                              |

The church portal template imports `CHURCH_TALLY_FORMS` from here: `sanity/lib/portal-templates/church-website.ts`. `components/ClientPortalPage.tsx` reads the overrides.

## Salt Church kit

Nine forms keyed `gettingStarted`, `staff`, `ministry`, `dreamTeam`, `smallGroup`, `event`, `course`, `testimony`, `faq` — see `CHURCH_TALLY_FORM_META` for who fills each one. Getting Started is the only intake. Kickoff questions first, then mission through DNS. Design direction and voice samples are on that form. PCO secrets and registrar passwords stay off Tally — share those through 1Password.

## Create / refresh

```bash
export TALLY_API_KEY=$(op read "op://salt-studio-development/tally/credential")
node scripts/tally/church-kit.mjs
node scripts/tally/church-kit.mjs --refresh=faq
node scripts/tally/church-kit.mjs --refresh=gettingStarted
```

The script reads the catalog from `NEXT_PUBLIC_TALLY_CHURCH_FORMS` (env or `.env.local`) and refuses to run without it — an empty protected list could let it PATCH live client forms. Create skips a form if that title already exists. `--refresh=<key>` PATCHes a kit form in place and refuses any ID in `PROTECTED_TALLY_FORM_IDS`. FAQ is one category per submit, with Q: / A: pairs in one text box. Getting Started can skip church info, links, and media when the client asks us to pull that from the current site. Both paths still hit Design, voice, Planning Center, and domain.

A Tally `Church kit` folder is preferred. If the account cannot create folders, forms go at the workspace root.

## Add a new church form

1. Describe the form in chat (who fills it, fields, required uploads).
2. Create it with Tally MCP, or add a builder in `scripts/tally/church-kit.mjs` and run the script.
3. Add the key to `CHURCH_TALLY_FORM_KEYS` and a row to `CHURCH_TALLY_FORM_META` in `church-forms.ts`, and put the URL in the `church` object of `NEXT_PUBLIC_TALLY_CHURCH_FORMS` (`.env.local` **and** Vercel).
4. Link it from `sanity/lib/portal-templates/church-website.ts` if clients should see it on `/project`.
5. Update this file.

Do not clone a form per church. Every kit form asks “What is the name of your church?”
