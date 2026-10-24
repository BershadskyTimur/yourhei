-- YourHEI: faster matches. Run AFTER 0035 (works without it). Safe to run again.
-- Paste into Supabase -> SQL Editor -> Run.
--
-- How many published programmes each country has (at one level). The matches page reads the countries at the same time, the
-- biggest first, instead of one long list page after page: this function tells it which countries there are and how big they are.

create or replace function public.programme_country_counts(p_level text default null)
returns table (country text, n bigint)
language sql
stable
security definer
set search_path = public
as $$
  select i.country::text, count(*)::bigint
    from public.programs p
    join public.institutions i on i.id = p.institution_id
   where p.status = 'published' and i.status = 'published'
     and (p_level is null or p.level = p_level)
   group by i.country
   order by 2 desc;
$$;

revoke all on function public.programme_country_counts(text) from public;
grant execute on function public.programme_country_counts(text) to anon, authenticated;
