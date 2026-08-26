# lib/tally/

Shared Tally forms for Salt church website clients. The kit lives in Tally. This folder is the catalog and the rules for adding the next form.

## Catalog

[`church-forms.ts`](church-forms.ts)

| Export                     | What it is                                                         |
| -------------------------- | ------------------------------------------------------------------ |
| `PROTECTED_TALLY_FORM_IDS` | Enjoy Life + Before We Meet + MFI. Never PATCH, rename, or delete. |
| `ENJOY_LIFE_TALLY_FORMS`   | Example URLs. Do not send new clients here.                        |
| `CHURCH_TALLY_FORMS`       | The Salt Church kit. Use these in the portal template.             |
| `CHURCH_TALLY_FORM_META`   | Title, who fills it, what we expect.                               |

The church portal template imports `CHURCH_TALLY_FORMS` from here: `sanity/lib/portal-templates/church-website.ts`.

## Salt Church kit

| Key              | Form                          | URL                       |
| ---------------- | ----------------------------- | ------------------------- |
| `gettingStarted` | Salt Church — Getting Started | https://tally.so/r/XxPl4P |
| `staff`          | Salt Church — Staff Bio       | https://tally.so/r/814oZl |
| `ministry`       | Salt Church — Ministry        | https://tally.so/r/0QRre9 |
| `dreamTeam`      | Salt Church — Crew            | https://tally.so/r/zx5X7k |
| `smallGroup`     | Salt Church — Small Group     | https://tally.so/r/5BPKZN |
| `event`          | Salt Church — Event           | https://tally.so/r/Y5lD4N |
| `course`         | Salt Church — Course          | https://tally.so/r/lbkD6o |
| `testimony`      | Salt Church — Testimony       | https://tally.so/r/RGyKPK |
| `faq`            | Salt Church — FAQ             | https://tally.so/r/obL6Gb |

Getting Started is the only intake. Kickoff questions first, then mission through DNS. Voice samples are on that form. PCO secrets and registrar passwords stay off Tally — share those through 1Password.

## Create / refresh

```bash
export TALLY_API_KEY=$(op read "op://salt-studio-development/tally/credential")
node scripts/tally/church-kit.mjs
node scripts/tally/church-kit.mjs --refresh=faq
node scripts/tally/church-kit.mjs --refresh=gettingStarted
```

Create skips a form if that title already exists. `--refresh=<key>` PATCHes a listed kit form in place. It refuses to write any ID in `PROTECTED_TALLY_FORM_IDS`. FAQ is one category per submit, with Q: / A: pairs in one text box. Getting Started can skip church info, links, and media when the client asks us to pull that from the current site.

A Tally `Church kit` folder is preferred. If the account cannot create folders, forms go at the workspace root.

## Add a new church form

1. Describe the form in chat (who fills it, fields, required uploads).
2. Create it with Tally MCP, or add a builder in `scripts/tally/church-kit.mjs` and run the script.
3. Put the URL on `CHURCH_TALLY_FORMS` and a row on `CHURCH_TALLY_FORM_META`.
4. Link it from `sanity/lib/portal-templates/church-website.ts` if clients should see it on `/project`.
5. Update this file.

Do not clone a form per church. Every kit form asks “What is the name of your church?”
