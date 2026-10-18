-- YourHEI: fix for 0024. Run AFTER 0024. Safe to run again. Paste into Supabase -> SQL Editor -> Run.
--
-- 0024 counted and listed only institutions with status = 'published' (5,668), but the map shows ALL institutions
-- (12,549: the 'draft' ones are the open base data and are public too). These versions count and list all of them again.

create or replace function public.map_counts()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'total', (select count(*) from public.institutions),
    'types', (select coalesce(jsonb_object_agg(type, n), '{}'::jsonb)
              from (select type, count(*) as n from public.institutions group by type) t),
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
  -- one row = [type number, country, lat, lng, slug, [name original, en, locale], [city original, en, locale]]
  select coalesce(jsonb_agg(jsonb_build_array(
    case type
      when 'university' then 0 when 'college' then 1 when 'school' then 2
      when 'language_school' then 3 when 'foundation' then 4 when 'vocational' then 5
    end,
    country,
    round(extensions.st_y(location::extensions.geometry)::numeric, 5),
    round(extensions.st_x(location::extensions.geometry)::numeric, 5),
    slug,
    jsonb_build_array(coalesce(names ->> 'original', ''), coalesce(names ->> 'en', ''),
                      case when p_locale = 'en' then '' else coalesce(names ->> p_locale, '') end),
    jsonb_build_array(coalesce(city ->> 'original', ''), coalesce(city ->> 'en', ''),
                      case when p_locale = 'en' then '' else coalesce(city ->> p_locale, '') end)
  ) order by id), '[]'::jsonb)
  from public.institutions
  where location is not null
    and type in ('university', 'college', 'school', 'language_school', 'foundation', 'vocational');
$$;

revoke all on function public.map_counts() from public;
grant execute on function public.map_counts() to anon, authenticated;
revoke all on function public.map_points(text) from public;
grant execute on function public.map_points(text) to anon, authenticated;
