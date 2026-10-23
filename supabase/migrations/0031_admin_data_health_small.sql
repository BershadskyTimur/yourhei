-- YourHEI: the "Data health" tab of the admin panel, in even smaller steps. Run AFTER 0030. Safe to run again.
-- Paste into Supabase -> SQL Editor -> Run.
--
-- The summary of 0030 still ran into the time limit while the database was busy cleaning up after the big loads of
-- programmes. Now every number is its own small request: the panel shows each one as soon as it arrives, and a number that
-- cannot be read right now does not stop the others.

drop function if exists public.admin_data_health_summary();

-- institutions: how many in each country (a small table, always fast)
create or replace function public.admin_dh_institutions()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'total', (select count(*) from public.institutions),
    'by_country', (select coalesce(jsonb_object_agg(country, n), '{}'::jsonb) from (select country, count(*) n from public.institutions group by country) x)
  );
end;
$$;
revoke all on function public.admin_dh_institutions() from public, anon;
grant execute on function public.admin_dh_institutions() to authenticated;

-- published programmes of one level
create or replace function public.admin_dh_level(p_level text)
returns bigint
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  return (select count(*) from public.programs where status = 'published' and level = p_level);
end;
$$;
revoke all on function public.admin_dh_level(text) from public, anon;
grant execute on function public.admin_dh_level(text) to authenticated;

-- programmes waiting for a check
create or replace function public.admin_dh_drafts()
returns bigint
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  return (select count(*) from public.programs where status = 'draft');
end;
$$;
revoke all on function public.admin_dh_drafts() from public, anon;
grant execute on function public.admin_dh_drafts() to authenticated;
