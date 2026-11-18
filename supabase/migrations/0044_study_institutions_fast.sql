-- YourHEI: pages "Study <field> in <country>" (/study/us/<field>) built in 9-29 s; the database function took 5-17 s for the US.
-- Run AFTER 0043. Safe to run again. Paste into Supabase -> SQL Editor -> Run. It builds a small index (about 3 MB, a second or two).
--
-- Two causes (measured 18.11.2026 with EXPLAIN ANALYZE on the live database):
-- 1. "p.isced_f like p_prefix || '%'" with the prefix as a function parameter: the database cannot use an index for it and reads the
--    whole table of 223 000 programmes (30 800 pages in memory). The same query with the prefix written in (like '061%') takes 1.7 s.
-- 2. Even then it read the names of all 12 000 programmes of the field and sorted them, to show three examples for each of 40 institutions.
-- The fix: the field is read as a range (>= '061' and < '062') from a narrow index that holds only (field, institution), the institutions
-- are counted first, and the three example names are read for the 40 chosen institutions only.
-- Measured on a copy of the columns: counting the US institutions of field 061 takes 15 ms with the index (was 1700-17000 ms).
-- The answer has the same shape as before (src/lib/study/get.ts reads it unchanged).

create index if not exists programs_pub_field_inst_idx
  on public.programs (isced_f text_pattern_ops, institution_id)
  where status = 'published';

create or replace function public.study_institutions(p_country text, p_prefix text, p_limit int default 40)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
set statement_timeout = '20s'
as $$
declare
  v_upper text;
  result jsonb;
begin
  if p_prefix is null or p_prefix !~ '^[0-9]{2,4}$' then
    return '[]'::jsonb;
  end if;
  -- the first string after every field that starts with the prefix: '06' -> '07', '0613' -> '0614'
  v_upper := left(p_prefix, length(p_prefix) - 1) || chr(ascii(right(p_prefix, 1)) + 1);

  select coalesce(jsonb_agg(jsonb_build_object(
           'slug', t.slug,
           'names', t.names,
           'city', t.city,
           'n', t.n,
           'sample', (select coalesce(jsonb_agg(s.nm), '[]'::jsonb)
                        from (select p.names ->> 'en' as nm
                                from public.programs p
                               where p.institution_id = t.id
                                 and p.status = 'published'
                                 and p.isced_f ~>=~ p_prefix and p.isced_f ~<~ v_upper
                               order by p.names ->> 'en'
                               limit 3) s)
         ) order by t.n desc, t.slug), '[]'::jsonb)
    into result
    from (
      select i.id, i.slug, i.names, i.city, count(*) as n
        from public.programs p
        join public.institutions i on i.id = p.institution_id
       where p.status = 'published'
         and i.country = upper(p_country)
         and p.isced_f ~>=~ p_prefix and p.isced_f ~<~ v_upper
       group by i.id
       order by count(*) desc, i.slug
       limit greatest(1, least(p_limit, 100))
    ) t;
  return result;
end;
$$;

revoke all on function public.study_institutions(text, text, int) from public;
grant execute on function public.study_institutions(text, text, int) to anon, authenticated;
