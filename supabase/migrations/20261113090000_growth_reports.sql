-- Paid Business Growth Analysis reports (Black Friday 2026).
-- One row per quiz taker who clicks through to pay. Holds the answers the
-- report is written from, the $25 payment, the generated report, and the
-- optional $1,000 Revenue Diagnostic purchase made from the report.
-- Server-side service role only. Nothing here is readable by anon or authenticated.

create table if not exists public.growth_reports (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  email text not null,
  first_name text,
  business_name text,
  business_type text,
  website_url text,
  answers jsonb not null,
  scores jsonb not null,
  fit boolean not null default false,
  source jsonb,
  marketing_consent boolean not null default false,
  status text not null default 'open'
    check (status in ('open', 'paid', 'generating', 'ready', 'failed')),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  report jsonb,
  report_model text,
  report_error text,
  generation_started_at timestamptz,
  delivered_at timestamptz,
  diagnostic_session_id text unique,
  diagnostic_status text check (diagnostic_status in ('open', 'paid')),
  diagnostic_paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists growth_reports_email_idx
  on public.growth_reports (email, created_at desc);

create index if not exists growth_reports_status_idx
  on public.growth_reports (status, created_at desc);

alter table public.growth_reports enable row level security;

revoke all on table public.growth_reports from anon, authenticated;

comment on table public.growth_reports is
  'Business Growth Analysis: quiz answers, the $25 report payment, the generated report, and the Diagnostic purchase. Service role only.';
