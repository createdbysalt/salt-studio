create or replace function public.set_onboarding_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_onboarding_updated_at() from public;
revoke all on function public.set_onboarding_updated_at() from anon;
revoke all on function public.set_onboarding_updated_at() from authenticated;
