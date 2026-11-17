-- The list of thin institution pages for data/generated/thin-institutions.json (the sitemap leaves them out).
-- Thin = a published institution with published programmes, none of which has a yearly price for students from abroad, is free,
-- or has an application deadline from today on. The same rule as isThinInstitution in src/lib/seo/institution-meta.ts, which each
-- page applies to itself (that one decides the noindex; this list only keeps the sitemap in step).
--
-- When to run: after loading or changing programmes (prices, deadlines), and now and then as deadlines pass.
-- How: Supabase -> SQL Editor -> paste this file -> Run (about 35 seconds; it reads every programme), copy the single value of the
-- "file" column into data/generated/thin-institutions.json, commit. Reads only; changes nothing in the database.

with known as (
  select distinct p.institution_id
  from public.programs p
  where p.status = 'published'
    and (
      p.free is true
      -- a price line for students from abroad that gives a yearly figure (as tuitionRange in src/lib/seo/tuition-range.ts)
      or exists (
        select 1 from jsonb_array_elements(case when jsonb_typeof(p.tuition) = 'array' then p.tuition else '[]'::jsonb end) t
        where nullif(t->>'currency', '') is not null
          and coalesce(t->>'applies_to', 'all') not in ('eu', 'domestic')
          and (t->>'amount') ~ '^[0-9]+(\.[0-9]+)?$' and (t->>'amount')::numeric > 0
          and (t->>'period' in ('year', 'semester') or (t->>'period' = 'total' and coalesce(p.duration_years, 0) > 0))
      )
      -- an application date from today on
      or exists (
        select 1 from jsonb_array_elements(case when jsonb_typeof(p.deadlines) = 'array' then p.deadlines else '[]'::jsonb end) d
        where coalesce(d->>'intake', '') <> '' and coalesce(d->>'date', '') >= to_char(current_date, 'YYYY-MM-DD')
      )
    )
), thin as (
  select lower(i.country) as country, i.slug
  from public.institutions i
  where i.status = 'published'
    and exists (select 1 from public.programs p where p.institution_id = i.id and p.status = 'published')
    and not exists (select 1 from known k where k.institution_id = i.id)
), by_country as (
  select country, jsonb_agg(slug order by slug) as slugs from thin group by country
)
select jsonb_pretty(jsonb_build_object(
  'generated', to_char(current_date, 'YYYY-MM-DD'),
  'count', (select count(*) from thin),
  'rule', 'Published institutions with published programmes, none of which has a yearly price for students from abroad, is free, or has an application deadline from the generation date on. Their pages carry noindex (src/lib/seo/institution-meta.ts, isThinInstitution) and are left out of the sitemap. Regenerate with scripts/sql/thin-institutions.sql after loading data.',
  'items', (select coalesce(jsonb_object_agg(country, slugs), '{}'::jsonb) from by_country)
)) as file;
