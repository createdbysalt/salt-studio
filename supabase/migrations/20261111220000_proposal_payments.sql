-- Proposal acceptances and first payments.
-- Server-side service role only. Nothing here is readable by anon or authenticated.

create table if not exists public.proposal_acceptances (
  id uuid primary key default gen_random_uuid(),
  proposal_id text not null,
  token_hash text not null,
  signer_name text not null,
  signer_email text not null,
  client_name text,
  package_id text not null,
  package_name text,
  addon_ids text[] not null default '{}',
  selection_key text not null,
  kickoff_date date,
  same_day_percent integer,
  total_cents integer not null check (total_cents >= 0),
  first_cents integer not null check (first_cents >= 0),
  steps jsonb not null,
  schedule_name text,
  msa_version text,
  agreed_text_sha256 text not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists proposal_acceptances_proposal_id_idx
  on public.proposal_acceptances (proposal_id, created_at desc);

-- An acceptance is a signature record. It never changes after it is written.
create or replace function public.proposal_acceptances_immutable()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'proposal_acceptances rows are immutable';
end;
$$;

drop trigger if exists proposal_acceptances_no_update on public.proposal_acceptances;
create trigger proposal_acceptances_no_update
  before update or delete on public.proposal_acceptances
  for each row
  execute function public.proposal_acceptances_immutable();

create table if not exists public.proposal_payments (
  id uuid primary key default gen_random_uuid(),
  acceptance_id uuid not null references public.proposal_acceptances (id),
  proposal_id text not null,
  step_index integer not null default 0,
  method text not null check (method in ('checkout', 'wire')),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  status text not null check (status in ('open', 'processing', 'paid', 'failed', 'pending_wire', 'expired')),
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists proposal_payments_proposal_id_idx
  on public.proposal_payments (proposal_id, created_at desc);

drop trigger if exists set_proposal_payments_updated_at on public.proposal_payments;
create trigger set_proposal_payments_updated_at
  before update on public.proposal_payments
  for each row
  execute function public.set_onboarding_updated_at();

-- One row per Stripe event we have acted on. The primary key is the idempotency check.
create table if not exists public.proposal_payment_events (
  event_id text primary key,
  payment_id uuid references public.proposal_payments (id),
  event_type text not null,
  received_at timestamptz not null default now()
);

alter table public.proposal_acceptances enable row level security;
alter table public.proposal_payments enable row level security;
alter table public.proposal_payment_events enable row level security;

revoke all on table public.proposal_acceptances from anon, authenticated;
revoke all on table public.proposal_payments from anon, authenticated;
revoke all on table public.proposal_payment_events from anon, authenticated;

comment on table public.proposal_acceptances is
  'Signed proposal acceptances with the frozen quote. Immutable. Service role only.';
comment on table public.proposal_payments is
  'Stripe Checkout Sessions and wire requests for proposal payment steps. Service role only.';
comment on table public.proposal_payment_events is
  'Stripe webhook event ids already applied, for idempotency. Service role only.';
