-- YourHEI: how many institution pages each country has. Run AFTER 0024. Safe to run again.
-- Paste into Supabase -> SQL Editor -> Run.
--
-- Every institution page, country guide and study page asks "does this country have a list of institutions?". Until now
-- the answer was counted on the site from sitemap_points(): the address of every institution with programmes (231 KB),
-- 2.5 s on average to answer (Supabase log, 08.11.2026). This function returns only the counts by country (about 2 KB),
-- with the same rule as sitemap_points: published institutions that have a published programme.

create or replace function public.sitemap_country_counts()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_array(country, n) order by country), '[]'::jsonb)
  from (
    select i.country, count(*) as n
    from public.institutions i
    where i.status = 'published'
      and exists (select 1 from public.programs p where p.institution_id = i.id and p.status = 'published')
    group by i.country
  ) t;
$$;

revoke all on function public.sitemap_country_counts() from public;
grant execute on function public.sitemap_country_counts() to anon, authenticated;
