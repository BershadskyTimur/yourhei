-- YourHEI: institutions of one country with the number of programmes in one field (for the pages "Study <field> in <country>").
-- Run AFTER 0026. Safe to run again. Paste into Supabase -> SQL Editor -> Run.
--
-- p_prefix is the start of the ISCED-F code of the field (for example '061' = information and communication
-- technologies). Only published programmes of published-or-draft institutions are counted (the base data of an
-- institution is public, see 0001). The answer is small: at most p_limit institutions with up to three programme names each.

create or replace function public.study_institutions(p_country text, p_prefix text, p_limit int default 40)
returns jsonb
language sql
stable
security definer
set search_path = public
set statement_timeout = '20s'
as $$
  select coalesce(jsonb_agg(r order by (r ->> 'n')::int desc, r ->> 'slug'), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'slug', i.slug,
      'names', i.names,
      'city', i.city,
      'n', count(*),
      'sample', (array_agg(p.names ->> 'en' order by p.names ->> 'en'))[1:3]
    ) as r
    from public.programs p
    join public.institutions i on i.id = p.institution_id
    where p.status = 'published'
      and i.country = upper(p_country)
      and p_prefix ~ '^[0-9]{2,4}$'
      and p.isced_f like p_prefix || '%'
    group by i.id
    order by count(*) desc, i.slug
    limit greatest(1, least(p_limit, 100))
  ) t;
$$;

revoke all on function public.study_institutions(text, text, int) from public;
grant execute on function public.study_institutions(text, text, int) to anon, authenticated;
