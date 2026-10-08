-- YourHEI: faster catalog for rare filters (language other than English, free of tuition). Run AFTER 0011. Safe to run again.

create or replace function public.catalog_programs(
  p_country text default null,
  p_level text default null,
  p_language text default null,
  p_field text default null,
  p_free boolean default false,
  p_q text default null,
  p_after_institution uuid default null,
  p_after_program uuid default null,
  p_limit int default 40
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
             ''duration_years'', p.duration_years, ''tuition'', p.tuition, ''free'', p.free,
             ''institutions'', jsonb_build_object(''id'', i.id, ''slug'', i.slug, ''type'', i.type, ''country'', i.country, ''city'', i.city, ''names'', i.names)
           ) as r
    from public.institutions i
    join %PROGS% p on p.institution_id = i.id
    where i.status = ''published'' and p.status = ''published''';
begin
  -- Rare filters (a language other than English, free of tuition): the database first picks the few matching programmes
  -- by the index and only then orders them. Without this it walks all 100,000 programmes in order and times out.
  if p_free or (p_language is not null and p_language <> 'en') then
    sql := replace(sql, '%PROGS%', '(select * from public.programs where status = ''published''' ||
      case when p_free then ' and free' else '' end ||
      case when p_language is not null then ' and languages @> array[$3]' else '' end || ' offset 0)');
  else
    sql := replace(sql, '%PROGS%', 'public.programs');
  end if;
  if p_country is not null then sql := sql || ' and i.country = $1'; end if;
  if p_level is not null then sql := sql || ' and p.level = $2'; end if;
  if p_language is not null then sql := sql || ' and p.languages @> array[$3]'; end if;
  if p_field is not null then sql := sql || ' and p.isced_f like $4 || ''%'''; end if;
  if p_free then sql := sql || ' and p.free'; end if;
  if p_q is not null and p_q <> '' then
    sql := sql || ' and (p.names->>''en'' ilike ''%'' || $5 || ''%'' or p.names->>''original'' ilike ''%'' || $5 || ''%'')';
  end if;
  if p_after_institution is not null and p_after_program is not null then
    sql := sql || ' and (p.institution_id, p.id) > ($6, $7)';
  end if;
  sql := sql || ' order by p.institution_id, p.id limit least(greatest($8, 1), 100)) t';
  execute sql into result using p_country, p_level, p_language, p_field, p_q, p_after_institution, p_after_program, p_limit;
  return result;
end;
$$;
grant execute on function public.catalog_programs(text, text, text, text, boolean, text, uuid, uuid, int) to anon, authenticated;
