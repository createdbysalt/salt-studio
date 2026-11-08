create table if not exists public.portal_private_metadata (
  id uuid primary key default gen_random_uuid(),
  portal_id text not null unique,
  password_hash text not null,
  password_salt text not null,
  password_iterations integer not null default 210000,
  shared_folder_url text,
  branding_folder_url text,
  media_folder_url text,
  preview_url text,
  production_url text,
  whatsapp_group_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_portal_private_metadata_updated_at on public.portal_private_metadata;
create trigger set_portal_private_metadata_updated_at
  before update on public.portal_private_metadata
  for each row
  execute function public.set_onboarding_updated_at();

alter table public.portal_private_metadata enable row level security;

revoke all on table public.portal_private_metadata from anon, authenticated;

comment on table public.portal_private_metadata is
  'Private project portal metadata moved out of public Sanity. Access from deployed app uses server-side service role only.';
