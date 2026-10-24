-- YourHEI: faster matches with a chosen field in the biggest countries. Run AFTER 0038. Safe to run again.
-- Paste into Supabase -> SQL Editor -> Run. It builds an index and may take up to a minute.
--
-- "A field in the US" (bachelor business is about 15 000 programmes) used to be cancelled by the time limit: the database had to find all
-- of them and sort them by institution for every page. Here the programmes of ONE field prefix are read straight from an index that is
-- already in the right order (field, institution, programme), 1000 at a time, however big the field is. The page asks for each chosen
-- field prefix one after another, and only for the big countries (the small ones are read whole and cut in the browser).

create index if not exists programs_pub_level_field_idx
  on public.programs (level, isced_f, institution_id, id)
  where status = 'published';

create or replace function public.match_programs_field(
  p_level text,
  p_prefix text,
  p_countries text[] default null,
  p_types text[] default null,
  p_after_field text default null,
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
  v_upper text;
  sql text;
begin
  if p_prefix is null or p_prefix !~ '^[0-9]{1,4}$' then
    raise exception 'bad prefix' using errcode = '22023';
  end if;
  -- the first string that is after every field starting with the prefix: "06" -> "07", "0613" -> "0614"
  v_upper := left(p_prefix, length(p_prefix) - 1) || chr(ascii(right(p_prefix, 1)) + 1);
  -- the conditions are put into the text (not "x is null or ...") so that the database can use the index in order
  sql := 'with page as materialized (
    select p.isced_f as field, p.institution_id as inst, p.id as prog
      from public.programs p
      join public.institutions i on i.id = p.institution_id
     where p.status = ''published'' and i.status = ''published''
       and p.isced_f >= $2 and p.isced_f < $3';
  if p_level is not null then sql := sql || ' and p.level = $1'; end if;
  if p_countries is not null and cardinality(p_countries) > 0 then sql := sql || ' and i.country = any($4)'; end if;
  if p_types is not null and cardinality(p_types) > 0 then sql := sql || ' and i.type = any($5)'; end if;
  if p_after_field is not null and p_after_institution is not null and p_after_program is not null then
    sql := sql || ' and (p.isced_f, p.institution_id, p.id) > ($6, $7, $8)';
  end if;
  sql := sql || ' order by p.isced_f, p.institution_id, p.id limit least(greatest($9, 1), 1500)
  ),
  progs as (
    select page.field, page.inst, page.prog, jsonb_build_object(
             ''id'', p.id, ''institution_id'', p.institution_id, ''names'', p.names, ''level'', p.level, ''isced_f'', p.isced_f, ''languages'', p.languages,
             ''duration_years'', p.duration_years, ''format'', p.format, ''intakes'', p.intakes, ''tuition'', p.tuition,
             ''free'', p.free, ''requirements'', p.requirements, ''application_fee'', p.application_fee, ''application_url'', p.application_url) as j
      from page join public.programs p on p.id = page.prog
  ),
  insts as (
    select i.id, jsonb_build_object(
             ''id'', i.id, ''slug'', i.slug, ''type'', i.type, ''country'', i.country, ''city'', i.city, ''names'', i.names,
             ''ownership'', i.ownership, ''size'', i.size, ''city_size'', i.city_size, ''climate'', i.climate,
             ''dormitory'', i.dormitory, ''features'', i.features, ''verified_at'', i.verified_at,
             ''rankings'', coalesce((select jsonb_agg(jsonb_build_object(''name'', k.name, ''year'', k.year, ''position'', k.position, ''scope'', k.scope))
                                     from public.rankings k where k.institution_id = i.id), ''[]''::jsonb)) as j
      from public.institutions i where i.id in (select inst from page)
  )
  select jsonb_build_object(
           ''programs'', coalesce((select jsonb_agg(j order by field, inst, prog) from progs), ''[]''::jsonb),
           ''institutions'', coalesce((select jsonb_object_agg(id, j) from insts), ''{}''::jsonb))';
  execute sql into result using p_level, p_prefix, v_upper, p_countries, p_types, p_after_field, p_after_institution, p_after_program, p_limit;
  return result;
end;
$$;
revoke all on function public.match_programs_field(text, text, text[], text[], text, uuid, uuid, int) from public;
grant execute on function public.match_programs_field(text, text, text[], text[], text, uuid, uuid, int) to anon, authenticated;
