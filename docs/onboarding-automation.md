# Salt Studio onboarding automation

This branch adds the first safe vertical slice for routing shared Tally forms into Salt's internal review flow.

## What is live after merge?

Nothing activates by default. Existing portal links stay unchanged unless `ONBOARDING_ROUTING_SECRET` is configured. The webhook route also fails closed until its signing secret, routing secret, and a persistence adapter are configured.

## Environment variables

```bash
ONBOARDING_ROUTING_SECRET=... # Signs per-project/per-form route tokens for Tally links
TALLY_WEBHOOK_SECRET=... # Tally webhook signing secret; validates Tally-Signature
ONBOARDING_JOB_SECRET=... # Bearer token for retry jobs
ONBOARDING_AUTOMATION_STORE=supabase # Recommended production durable store
SUPABASE_URL=... # Server-side only
SUPABASE_SERVICE_ROLE_KEY=... # Server-side only; never expose to browser
ONBOARDING_PRIVATE_METADATA_STORE=supabase # Enables private portal password/link reads
NOTION_API_KEY=... # Salt-internal blockers only
NOTION_ONBOARDING_TASKS_DATABASE_ID=... # Database with the properties listed below
GOOGLE_DRIVE_ACCESS_TOKEN=... # Metadata-only checker; no file contents are fetched

# Optional fallback if Supabase is not approved/provisioned:
ONBOARDING_AUTOMATION_STORE=sanity
ONBOARDING_PRIVATE_SANITY_DATASET=... # Private dataset for portal-private data + submissions
SANITY_API_WRITE_TOKEN=... # Write token scoped to the private dataset

ONBOARDING_AUTOMATION_STORE=memory # Local/sandbox only. Do not use for production.
```

Tally hidden fields are routing metadata, not authentication. The automation validates `project_id`, `form_id`, and `item_key` against a signed `salt_route` token and then against the authoritative portal/form mapping.

The Notion database must have these properties: `Name` (title), `Status` (select), `Source` (select), `Reason` (select), `Dedupe Key` (rich text), `Project ID` (rich text), and `Submission ID` (rich text).

## Storage recommendation

Recommended: Supabase/Postgres.

| Option                 | Fit             | Notes                                                                                                                                                                                                                                                                 |
| ---------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase/Postgres      | Best fit        | Relational submission ledger, unique idempotency keys, collection status rows, and an outbox table are native. Works without storing secrets in the public Sanity dataset. Requires parent to finish Supabase OAuth/project setup and provide server-side env values. |
| Private Sanity dataset | Viable fallback | Reuses existing Sanity client patterns, but private dataset entitlement may require a paid Sanity plan and the actual project plan is unknown. Less natural for relational ledgers/outbox operations.                                                                 |
| Vercel storage         | Not chosen yet  | Vercel does not provide a native transactional database without selecting a storage provider/integration. Use only if parent provisions a specific Postgres provider and credentials.                                                                                 |

The repo includes the Supabase base migration at `supabase/migrations/202611080001_onboarding_automation.sql`. It was applied externally to the dedicated `salt-studio` Supabase project (`jnznsgkkteuuqwtscaxz`) as recorded version `20261108050017` with migration name `onboarding_automation`.

Because that applied version differs from the repo filename, future CLI deploys must treat the base migration as already applied in that project and apply only later forward migrations. Do not destructively reapply or rename the already-applied database migration. Follow-up migrations:

- `supabase/migrations/20261108050100_harden_onboarding_updated_at_function.sql`
- `supabase/migrations/20261108050200_portal_private_metadata.sql`

Private portal metadata migration:

```bash
# Dry-run, prints field presence only
npm run plan:onboarding:privacy

# One-time private copy after approval; does not remove public Sanity fields
CONFIRM_PRIVATE_PORTAL_WRITE=true npm run plan:onboarding:privacy -- --write
```

Rollback before public cleanup: unset `ONBOARDING_PRIVATE_METADATA_STORE` or set it away from `supabase`. Rollback after public cleanup requires restoring public fields from the approved secure backup, then disabling private mode.

## Tally setup

Use Tally's documented hidden-field behavior for URL parameters and webhook signing:

- Hidden fields: https://tally.so/help/hidden-fields
- Webhooks and `Tally-Signature`: https://tally.so/help/webhooks

Configure each form webhook to POST to:

```text
/api/onboarding/tally
```

Do not publish or change client-facing forms from this repo. The Staff form's unpublished hidden field can be expanded to the rest of the kit during cutover.

## Processing behavior

- Valid submissions become `received_for_review`.
- Unknown, missing, forwarded, tampered, disabled, or mismatched routing becomes `needs_review`.
- Duplicate Tally submission IDs are idempotent.
- A received form does not mark a checklist item done. Manual ticks remain compatible.
- Getting Started is the only single-intake form.
- Staff, ministry, crew, small group, event, course, story, and FAQ forms are repeatable. They maintain a per-project/form submission ledger with received time and an available entry label from form answers. Email is never used to infer a person's name.
- `3 submissions received` is not `complete`. A collection becomes complete only when an authenticated project user explicitly confirms it. Confirmation records actor and time, and reopening records actor and time.
- Submissions received after confirmation are flagged in summaries as received after confirmation so they can be reviewed instead of silently changing completeness.
- Drive arrivals are evidence only. A file in a known folder can be a candidate signal, but arbitrary file arrival cannot assign a specific asset without routing evidence.
- Notion is the internal task boundary for Salt blockers. Linear-owned work, including Simcoe House, is not duplicated into Notion.

## Current CLC portal form coverage

The current `/project/clc` portal has nine Tally form links covered by the synthetic tests:

| Portal item     | Form ID  | Routing coverage                                                                   |
| --------------- | -------- | ---------------------------------------------------------------------------------- |
| `gs-form`       | `yP5oEB` | CLC-specific Church Info; signed project route cannot be reused for another client |
| `f-staff`       | `814oZl` | Shared kit form; requires per-project signed route                                 |
| `f-ministry`    | `0QRre9` | Shared kit form; requires per-project signed route                                 |
| `f-crew`        | `zx5X7k` | Shared kit form; requires per-project signed route                                 |
| `f-small-group` | `5BPKZN` | Shared kit form; requires per-project signed route                                 |
| `f-event`       | `Y5lD4N` | Shared kit form; requires per-project signed route                                 |
| `f-course`      | `lbkD6o` | Shared kit form; requires per-project signed route                                 |
| `f-testimony`   | `RGyKPK` | Shared kit form; requires per-project signed route                                 |
| `f-faq`         | `obL6Gb` | Shared kit form; requires per-project signed route                                 |

The older June/Enjoy Life form IDs in `ENJOY_LIFE_TALLY_FORMS` are catalog-protected examples only. They are not current `/project/clc` portal links and are not modified by this automation.

## Local verification

```bash
npm run test:onboarding
npm run verify:onboarding:sandbox
npm run lint
NEXT_PUBLIC_SANITY_PROJECT_ID=jkqf2ng5 NEXT_PUBLIC_SANITY_DATASET=production SANITY_API_READ_TOKEN=dummy npm run type-check
```

Use only synthetic submissions in tests. Do not paste client submissions, passwords, Drive contents, or private links into fixtures or PR comments.

## Production cutover prerequisites

Before activating webhooks in production:

1. Make the Sanity dataset private or move portal secrets/links/statuses to a private store. The current public dataset contains portal-sensitive fields. Sanity private datasets may require paid-plan entitlement; confirm the actual project plan before provisioning or changing visibility.
2. Provision/authorize the chosen Supabase project and apply `supabase/migrations/202611080001_onboarding_automation.sql` after review. Do not use the service role key outside server-side environment variables.
3. Run `node scripts/onboarding/privacy-migration-plan.mjs` and review its dry-run output. It prints field presence only, never private values.
4. Copy private portal fields into `portal_private_metadata` using `CONFIRM_PRIVATE_PORTAL_WRITE=true npm run plan:onboarding:privacy -- --write`, verify `/project/[slug]` reads overlays, then unset the listed private fields from public portal docs.
5. Configure the Tally signing secret, routing secret, retry job secret, Supabase URL/service role key, and optional private portal store credentials in Vercel. Existing agent/MCP connectors are not deployed app credentials.
6. Add hidden fields to all nine active Tally forms (`project_id`, `form_id`, `item_key`, `salt_route`) and publish intentionally from Tally. A saved draft hidden field is not necessarily live on the published form.
7. Configure webhooks with signing secrets in Tally for all nine active forms. There is no Tally connector tool in this environment to manage webhooks automatically.
8. Connect the Notion adapter for Salt-internal blockers only, with deterministic dedupe keys. A verified Salt tasks database ID is still needed.
9. Connect the Google Drive metadata checker only after server-side Drive credentials are configured for metadata checks without reading unrelated customer contents.
