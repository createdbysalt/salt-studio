-- Forward migration for preview project jnznsgkkteuuqwtscaxz.
-- portal_private_metadata already exists there (remote version 20261108050728).
-- Fresh databases create it in 20261108050200_portal_private_metadata.sql, then this
-- adds the checklist ticks write mode copies. Do not unset Sanity checklist before
-- this column exists and the copy has been verified.
-- This file is not applied by the change that adds it.

alter table public.portal_private_metadata
  add column if not exists checklist jsonb;

comment on column public.portal_private_metadata.checklist is
  'Per-client checklist ticks copied from Sanity clientPortal.checklist. Null until that copy runs.';

revoke all on table public.portal_private_metadata from anon, authenticated;
