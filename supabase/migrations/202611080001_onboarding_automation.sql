create extension if not exists pgcrypto;

create or replace function public.set_onboarding_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.onboarding_submissions (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  provider text not null check (provider = 'tally'),
  project_id text,
  form_id text,
  item_key text,
  submission_id text,
  entry_title text,
  status text not null check (status in ('received_for_review', 'needs_review', 'queued_for_retry')),
  review_reason text,
  received_at timestamptz not null,
  attempts integer not null default 0,
  last_error text,
  last_synced_at timestamptz,
  last_failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists onboarding_submissions_project_form_idx
  on public.onboarding_submissions (project_id, item_key, received_at desc);

create index if not exists onboarding_submissions_retry_idx
  on public.onboarding_submissions (status, received_at)
  where status = 'queued_for_retry';

drop trigger if exists set_onboarding_submissions_updated_at on public.onboarding_submissions;
create trigger set_onboarding_submissions_updated_at
  before update on public.onboarding_submissions
  for each row
  execute function public.set_onboarding_updated_at();

create table if not exists public.onboarding_collection_status (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  item_key text not null,
  collection_complete boolean not null default false,
  confirmed_at timestamptz,
  confirmed_by text,
  reopened_at timestamptz,
  reopened_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, item_key)
);

create table if not exists public.onboarding_outbox (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.onboarding_submissions(id) on delete cascade,
  sink text not null,
  dedupe_key text not null unique,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed')),
  attempts integer not null default 0,
  last_error text,
  available_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists onboarding_outbox_submission_id_idx
  on public.onboarding_outbox (submission_id);

create index if not exists onboarding_outbox_worker_idx
  on public.onboarding_outbox (status, available_at)
  where status in ('pending', 'failed');

drop trigger if exists set_onboarding_collection_status_updated_at on public.onboarding_collection_status;
create trigger set_onboarding_collection_status_updated_at
  before update on public.onboarding_collection_status
  for each row
  execute function public.set_onboarding_updated_at();

drop trigger if exists set_onboarding_outbox_updated_at on public.onboarding_outbox;
create trigger set_onboarding_outbox_updated_at
  before update on public.onboarding_outbox
  for each row
  execute function public.set_onboarding_updated_at();

alter table public.onboarding_submissions enable row level security;
alter table public.onboarding_collection_status enable row level security;
alter table public.onboarding_outbox enable row level security;

revoke all on table public.onboarding_submissions from anon, authenticated;
revoke all on table public.onboarding_collection_status from anon, authenticated;
revoke all on table public.onboarding_outbox from anon, authenticated;
revoke all on function public.set_onboarding_updated_at() from public;

comment on table public.onboarding_submissions is
  'Private Salt onboarding submission ledger. Access from deployed app uses server-side service role only.';

comment on table public.onboarding_collection_status is
  'Client-authenticated declaration that a repeatable form collection is complete or reopened.';

comment on table public.onboarding_outbox is
  'Retry-safe side-effect queue for Notion/internal integrations.';
