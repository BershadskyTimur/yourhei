-- YourHEI: the "Data health" tab of the admin panel, in small steps. Run AFTER 0029. Safe to run again.
-- Paste into Supabase -> SQL Editor -> Run.
--
-- Why: admin_data_health() (0029) counted everything in one query and ran into the time limit of a request (a few seconds
-- on the free plan) now that the database has about 230,000 programmes. The admin panel now asks for the summary first,
-- then for one country at a time (each answer takes a fraction of a second).

drop function if exists public.admin_data_health();

create or replace function public.admin_data_health_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'institutions', (select coalesce(jsonb_object_agg(country, n), '{}'::jsonb) from (select country, count(*) n from public.institutions group by country) x),
    'institutions_total', (select count(*) from public.institutions),
    'levels', (select coalesce(jsonb_object_agg(level, n), '{}'::jsonb) from (select level, count(*) n from public.programs where status = 'published' group by level) x),
    'programmes_draft', (select count(*) from public.programs where status = 'draft'),
    -- countries that have at least one published programme (the admin panel then asks for each of them)
    'countries_with_programmes', (select coalesce(jsonb_agg(c order by c), '[]'::jsonb) from (
        select c.country as c from (select distinct country from public.institutions) c
        where exists (select 1 from public.institutions i join public.programs p on p.institution_id = i.id
                      where i.country = c.country and p.status = 'published')) y),
    'institutions_without_programmes', (select count(*) from public.institutions i where not exists (select 1 from public.programs p where p.institution_id = i.id and p.status = 'published'))
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_data_health_summary() from public, anon;
grant execute on function public.admin_data_health_summary() to authenticated;

create or replace function public.admin_data_health_country(p_country text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'country', upper(p_country),
    'institutions_with_programmes', count(distinct p.institution_id),
    'programmes', count(*),
    'priced', count(*) filter (where p.free or jsonb_array_length(p.tuition) > 0),
    'with_deadline', count(*) filter (where jsonb_array_length(p.deadlines) > 0),
    'with_language', count(*) filter (where cardinality(p.languages) > 0),
    'with_field', count(*) filter (where p.isced_f is not null)
  ) into result
  from public.institutions i
  join public.programs p on p.institution_id = i.id
  where i.country = upper(p_country) and p.status = 'published';
  return result;
end;
$$;
revoke all on function public.admin_data_health_country(text) from public, anon;
grant execute on function public.admin_data_health_country(text) to authenticated;
