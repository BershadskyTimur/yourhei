-- YourHEI: which institutions have published programmes. Run AFTER 0022. Safe to run again.
-- Paste into Supabase -> SQL Editor -> Run.
--
-- Used for the sitemap: only institutions with programmes are offered to search engines (the thousands of bare map
-- entries are thin pages). Fewer pages for the crawlers to fetch means less traffic and fewer page regenerations.
-- Returns published institutions only, and it is safe to call for visitors: it reveals only ids that are public anyway.

create or replace function public.institution_ids_with_programmes()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select distinct p.institution_id
  from public.programs p
  join public.institutions i on i.id = p.institution_id
  where p.status = 'published' and i.status = 'published';
$$;

revoke all on function public.institution_ids_with_programmes() from public;
grant execute on function public.institution_ids_with_programmes() to anon, authenticated;
