-- YourHEI: a fast, steady way to read the programmes for the matching page. Run AFTER 0011. Safe to run again.
-- Paste into Supabase -> SQL Editor -> Run.
--
-- Why: "bachelor + these countries" made the database walk through all 100,000+ programmes in order and the request
-- was cancelled ("statement timeout"), so "My matches" showed an error. This function starts from the institutions
-- of the chosen countries and reads a page by keyset (after the last row of the previous page). It runs with the
-- caller's rights, so only published rows are returned.

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
set search_path = public
as $$
declare
  result jsonb;
  sql text := 'select coalesce(jsonb_agg(t.r order by t.sort_inst, t.sort_prog), ''[]''::jsonb) from (
    select p.institution_id as sort_inst, p.id as sort_prog,
           jsonb_build_object(
             ''id'', p.id, ''names'', p.names, ''level'', p.level, ''isced_f'', p.isced_f, ''languages'', p.languages,
             ''duration_years'', p.duration_years, ''format'', p.format, ''intakes'', p.intakes, ''tuition'', p.tuition,
             ''free'', p.free, ''requirements'', p.requirements, ''application_fee'', p.application_fee, ''application_url'', p.application_url,
             ''institutions'', jsonb_build_object(
               ''id'', i.id, ''slug'', i.slug, ''type'', i.type, ''country'', i.country, ''city'', i.city, ''names'', i.names,
               ''ownership'', i.ownership, ''size'', i.size, ''city_size'', i.city_size, ''climate'', i.climate,
               ''dormitory'', i.dormitory, ''features'', i.features, ''verified_at'', i.verified_at,
               ''rankings'', coalesce((select jsonb_agg(jsonb_build_object(''name'', k.name, ''year'', k.year, ''position'', k.position, ''scope'', k.scope))
                                       from public.rankings k where k.institution_id = i.id), ''[]''::jsonb))
           ) as r
    from public.institutions i
    join public.programs p on p.institution_id = i.id
    where i.status = ''published'' and p.status = ''published''';
begin
  if p_countries is not null and cardinality(p_countries) > 0 then sql := sql || ' and i.country = any($2)'; end if;
  if p_types is not null and cardinality(p_types) > 0 then sql := sql || ' and i.type = any($3)'; end if;
  if p_level is not null then sql := sql || ' and p.level = $1'; end if;
  if p_prefixes is not null and cardinality(p_prefixes) > 0 then
    sql := sql || ' and exists (select 1 from unnest($4) pre where p.isced_f like pre || ''%'')';
  end if;
  if p_after_institution is not null and p_after_program is not null then
    sql := sql || ' and (p.institution_id, p.id) > ($5, $6)';
  end if;
  sql := sql || ' order by p.institution_id, p.id limit least(greatest($7, 1), 1500)) t';
  execute sql into result using p_level, p_countries, p_types, p_prefixes, p_after_institution, p_after_program, p_limit;
  return result;
end;
$$;
grant execute on function public.match_programs(text, text[], text[], text[], uuid, uuid, int) to anon, authenticated;
