-- YourHEI: the "Foundation programmes" filter on the map also finds universities and colleges that offer a foundation
-- (preparatory) programme. Run AFTER 0027. Safe to run again. Paste into Supabase -> SQL Editor -> Run.
--
-- Before, the filter showed only institutions whose TYPE is "foundation" (a handful). Now every point also says whether
-- the institution has a published foundation programme (an extra 0/1 at the end of its row), and the count of the filter
-- counts those institutions too.

create or replace function public.map_counts()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with f as (
    select distinct institution_id from public.programs where level = 'foundation' and status = 'published'
  )
  select jsonb_build_object(
    'total', (select count(*) from public.institutions),
    'types', (select coalesce(jsonb_object_agg(type, n), '{}'::jsonb)
              from (
                select t.type, t.n + case when t.type = 'foundation'
                  then (select count(*) from public.institutions i where i.type <> 'foundation' and i.id in (select institution_id from f))
                  else 0 end as n
                from (select type, count(*) as n from public.institutions group by type) t
              ) u),
    'countries', (select coalesce(jsonb_object_agg(country, n), '{}'::jsonb)
                  from (select country, count(*) as n from public.institutions group by country) c)
  );
$$;

create or replace function public.map_points(p_locale text default 'en')
returns jsonb
language sql
stable
security definer
set search_path = public, extensions
as $$
  -- one row = [type number, country, lat, lng, slug, [name original, en, locale], [city original, en, locale], has foundation programme 0/1]
  with f as (
    select distinct institution_id from public.programs where level = 'foundation' and status = 'published'
  )
  select coalesce(jsonb_agg(jsonb_build_array(
    case i.type
      when 'university' then 0 when 'college' then 1 when 'school' then 2
      when 'language_school' then 3 when 'foundation' then 4 when 'vocational' then 5
    end,
    i.country,
    round(extensions.st_y(i.location::extensions.geometry)::numeric, 5),
    round(extensions.st_x(i.location::extensions.geometry)::numeric, 5),
    i.slug,
    jsonb_build_array(coalesce(i.names ->> 'original', ''), coalesce(i.names ->> 'en', ''),
                      case when p_locale = 'en' then '' else coalesce(i.names ->> p_locale, '') end),
    jsonb_build_array(coalesce(i.city ->> 'original', ''), coalesce(i.city ->> 'en', ''),
                      case when p_locale = 'en' then '' else coalesce(i.city ->> p_locale, '') end),
    case when f.institution_id is not null then 1 else 0 end
  ) order by i.id), '[]'::jsonb)
  from public.institutions i
  left join f on f.institution_id = i.id
  where i.location is not null
    and i.type in ('university', 'college', 'school', 'language_school', 'foundation', 'vocational');
$$;

revoke all on function public.map_counts() from public;
grant execute on function public.map_counts() to anon, authenticated;
revoke all on function public.map_points(text) from public;
grant execute on function public.map_points(text) to anon, authenticated;
