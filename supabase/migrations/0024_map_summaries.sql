-- YourHEI: small summaries of the institutions for the home page, the map and the sitemap.
-- Run AFTER 0023. Safe to run again. Paste into Supabase -> SQL Editor -> Run.
--
-- Why: the site used to read ALL 12,500 institutions with every name in every language (about 5 MB) each time it
-- rebuilt the home page, a sitemap file or the map list: tens of times a day. That is a lot of data leaving the
-- database (the free Supabase plan includes only 5 GB a month). These functions let the database do the cutting:
--   map_counts()    numbers only (how many of each type and in each country),
--   map_points(loc) the map list in a compact form with only the names in the visitor's language, English and the original,
--   sitemap_points() address parts of the institutions that have programmes.
-- They return published institutions only, i.e. what everybody may see anyway.

create or replace function public.map_counts()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'total', (select count(*) from public.institutions where status = 'published'),
    'types', (select coalesce(jsonb_object_agg(type, n), '{}'::jsonb)
              from (select type, count(*) as n from public.institutions where status = 'published' group by type) t),
    'countries', (select coalesce(jsonb_object_agg(country, n), '{}'::jsonb)
                  from (select country, count(*) as n from public.institutions where status = 'published' group by country) c)
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
  where status = 'published'
    and location is not null
    and type in ('university', 'college', 'school', 'language_school', 'foundation', 'vocational');
$$;

create or replace function public.sitemap_points()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_array(i.slug, i.country) order by i.id), '[]'::jsonb)
  from public.institutions i
  where i.status = 'published'
    and exists (select 1 from public.programs p where p.institution_id = i.id and p.status = 'published');
$$;

revoke all on function public.map_counts() from public;
revoke all on function public.map_points(text) from public;
revoke all on function public.sitemap_points() from public;
grant execute on function public.map_counts() to anon, authenticated;
grant execute on function public.map_points(text) to anon, authenticated;
grant execute on function public.sitemap_points() to anon, authenticated;
