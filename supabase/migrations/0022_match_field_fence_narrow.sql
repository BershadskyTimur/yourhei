-- YourHEI: matches with a chosen field: pick the matching programmes by the field index FIRST, then order them. Run AFTER 0021.
-- (Replaces 0021: the first version carried the full wide rows through the sort, which was slower. Now only the ids travel.) Safe to run again.
-- Same function as 0017 (and still security definer, see 0019), but the field filter is written as separate "starts with" tests
-- joined by OR, which the database can answer from the index instead of reading every programme.
-- Same idea as 0016: first pick the ids of the page (cheap), then build the JSON cards (with rankings) only for those rows.
-- Before, "master + a field" built the cards of every matching programme before taking 1000 and was cancelled (timeout).

create or replace function public.match_programs(
  p_level text default null,
  p_countries text[] default null,
  p_types text[] default null,
  p_prefixes text[] default null,
  p_after_institution uuid default null,
  p_after_program uuid default null,
  p_limit int default 1000
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
  sql text := 'with page as materialized (
    select p.institution_id as inst, p.id as prog
    from public.institutions i
    join %PROGS% p on p.institution_id = i.id
    where i.status = ''published'' and p.status = ''published''';
begin
  if p_countries is not null and cardinality(p_countries) > 0 then sql := sql || ' and i.country = any($2)'; end if;
  if p_types is not null and cardinality(p_types) > 0 then sql := sql || ' and i.type = any($3)'; end if;
  if p_level is not null then sql := sql || ' and p.level = $1'; end if;
  if p_prefixes is not null and cardinality(p_prefixes) > 0 then
    -- the fence (offset 0) makes the database take the programmes of these fields from the index first; without it it may walk
    -- all programmes in order and filter, which is slow for a rare field
    sql := replace(sql, '%PROGS%', '(select id, institution_id, level, status from public.programs where status = ''published''' || case when p_level is not null then ' and level = $1' else '' end || ' and (' ||
      (select string_agg(format('isced_f like $4[%s] || ''%%''', g), ' or ') from generate_series(1, least(cardinality(p_prefixes), 40)) g) || ') offset 0)');
  else
    sql := replace(sql, '%PROGS%', 'public.programs');
  end if;
  if p_after_institution is not null and p_after_program is not null then
    sql := sql || ' and (p.institution_id, p.id) > ($5, $6)';
  end if;
  sql := sql || ' order by p.institution_id, p.id limit least(greatest($7, 1), 1500))
    select coalesce(jsonb_agg(jsonb_build_object(
             ''id'', p.id, ''names'', p.names, ''level'', p.level, ''isced_f'', p.isced_f, ''languages'', p.languages,
             ''duration_years'', p.duration_years, ''format'', p.format, ''intakes'', p.intakes, ''tuition'', p.tuition,
             ''free'', p.free, ''requirements'', p.requirements, ''application_fee'', p.application_fee, ''application_url'', p.application_url,
             ''institutions'', jsonb_build_object(
               ''id'', i.id, ''slug'', i.slug, ''type'', i.type, ''country'', i.country, ''city'', i.city, ''names'', i.names,
               ''ownership'', i.ownership, ''size'', i.size, ''city_size'', i.city_size, ''climate'', i.climate,
               ''dormitory'', i.dormitory, ''features'', i.features, ''verified_at'', i.verified_at,
               ''rankings'', coalesce((select jsonb_agg(jsonb_build_object(''name'', k.name, ''year'', k.year, ''position'', k.position, ''scope'', k.scope))
                                       from public.rankings k where k.institution_id = i.id), ''[]''::jsonb))
           ) order by page.inst, page.prog), ''[]''::jsonb)
    from page
    join public.programs p on p.id = page.prog
    join public.institutions i on i.id = page.inst';
  execute sql into result using p_level, p_countries, p_types, p_prefixes, p_after_institution, p_after_program, p_limit;
  return result;
end;
$$;
revoke all on function public.match_programs(text, text[], text[], text[], uuid, uuid, int) from public;
grant execute on function public.match_programs(text, text[], text[], text[], uuid, uuid, int) to anon, authenticated;



