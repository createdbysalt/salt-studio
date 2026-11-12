-- Signed-and-paid proposal email packet storage.
-- Incremental on top of 20261111220000_proposal_payments.sql for deployed DBs.

alter table public.proposal_acceptances
  add column if not exists signer_legal_name text,
  add column if not exists signer_address jsonb,
  add column if not exists msa_pdf_sha256 text,
  add column if not exists msa_pdf_bytes_base64 text,
  add column if not exists msa_pdf_filename text,
  add column if not exists msa_pdf_content_type text,
  add column if not exists msa_pdf_missing_reason text,
  add column if not exists agreed_document jsonb;

alter table public.proposal_payments
  add column if not exists stripe_receipt_url text;

create table if not exists public.proposal_emails (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.proposal_payments (id),
  acceptance_id uuid not null references public.proposal_acceptances (id),
  kind text not null check (kind in ('signed_docs', 'studio_notice')),
  status text not null check (status in ('pending', 'claimed', 'sent', 'failed')) default 'pending',
  to_email text,
  resend_id text,
  idempotency_key text not null,
  error text,
  claimed_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (payment_id, kind)
);

create index if not exists proposal_emails_status_idx
  on public.proposal_emails (status, created_at);

create index if not exists proposal_emails_claimed_idx
  on public.proposal_emails (claimed_at)
  where status = 'claimed';

drop trigger if exists set_proposal_emails_updated_at on public.proposal_emails;
create trigger set_proposal_emails_updated_at
  before update on public.proposal_emails
  for each row
  execute function public.set_onboarding_updated_at();

alter table public.proposal_emails enable row level security;

revoke all on table public.proposal_emails from anon, authenticated;

comment on table public.proposal_acceptances is
  'Signed proposal acceptances with the frozen quote and document packet. Immutable. Service role only.';
comment on table public.proposal_emails is
  'Idempotent signed-and-paid proposal email sends. Service role only.';
