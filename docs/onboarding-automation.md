# Salt Studio onboarding automation

This branch adds the first safe vertical slice for routing shared Tally forms into Salt's internal review flow.

## What is live after merge?

Nothing activates by default. Existing portal links stay unchanged unless `ONBOARDING_ROUTING_SECRET` is configured. The webhook route also fails closed until its signing secret, routing secret, and a persistence adapter are configured.

## Environment variables

```bash
ONBOARDING_ROUTING_SECRET=... # Signs per-project/per-form route tokens for Tally links
TALLY_WEBHOOK_SECRET=... # Tally webhook signing secret; validates Tally-Signature
ONBOARDING_JOB_SECRET=... # Bearer token for retry jobs
ONBOARDING_AUTOMATION_STORE=memory # Local/sandbox only. Do not use for production.
```

Tally hidden fields are routing metadata, not authentication. The automation validates `project_id`, `form_id`, and `item_key` against a signed `salt_route` token and then against the authoritative portal/form mapping.

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
- Multi-entity forms such as staff/ministry are treated as one received submission for review, not as completion of every expected person/ministry.
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
npm run lint
NEXT_PUBLIC_SANITY_PROJECT_ID=jkqf2ng5 NEXT_PUBLIC_SANITY_DATASET=production SANITY_API_READ_TOKEN=dummy npm run type-check
```

Use only synthetic submissions in tests. Do not paste client submissions, passwords, Drive contents, or private links into fixtures or PR comments.

## Production cutover prerequisites

Before activating webhooks in production:

1. Make the Sanity dataset private or move portal secrets/links/statuses to a private store. The current public dataset contains portal-sensitive fields.
2. Replace the memory repository with durable private persistence for onboarding records, idempotency keys, and retry state.
3. Configure the Tally signing secret, routing secret, and retry job secret in Vercel.
4. Add hidden fields to the remaining Tally kit forms and publish them intentionally from Tally.
5. Connect a Notion adapter for Salt-internal blockers only, with deterministic dedupe keys.
6. Add a Google Drive changes/watch integration only after it can verify folder/project evidence without reading unrelated customer contents.
