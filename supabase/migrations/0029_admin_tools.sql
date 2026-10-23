-- YourHEI: more tools for the admin panel. Run AFTER 0028. Safe to run again. Paste into Supabase -> SQL Editor -> Run.
--
--   admin_data_health()          how complete the data is, by country (programmes, prices, deadlines, languages, fields)
--   admin_top_institutions(days) which institution pages are viewed and clicked most
--   admin_system()               size of the database and of the biggest tables (the free plan allows 500 MB)
--   admin_duplicates()           institutions with the same name in the same country (probably duplicates)
--   error_reports                "Report an error" messages from visitors, with a status; submit_error_report() for the site
-- Everything for administrators only, except submit_error_report (anyone may send a report, with limits).

-- ------------------------------------------------------------ data health
create or replace function public.admin_data_health()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
set statement_timeout = '60s'
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'countries', (select coalesce(jsonb_agg(to_jsonb(c) order by c.programmes desc), '[]'::jsonb) from (
        select i.country,
               count(distinct i.id) as institutions_with_programmes,
               count(*) as programmes,
               count(*) filter (where p.free or jsonb_array_length(p.tuition) > 0) as priced,
               count(*) filter (where jsonb_array_length(p.deadlines) > 0) as with_deadline,
               count(*) filter (where cardinality(p.languages) > 0) as with_language,
               count(*) filter (where p.isced_f is not null) as with_field
        from public.programs p
        join public.institutions i on i.id = p.institution_id
        where p.status = 'published'
        group by i.country) c),
    'institutions', (select coalesce(jsonb_object_agg(country, n), '{}'::jsonb) from (select country, count(*) n from public.institutions group by country) x),
    'levels', (select coalesce(jsonb_object_agg(level, n), '{}'::jsonb) from (select level, count(*) n from public.programs where status = 'published' group by level) x),
    'programmes_draft', (select count(*) from public.programs where status = 'draft'),
    'institutions_total', (select count(*) from public.institutions),
    'institutions_without_programmes', (select count(*) from public.institutions i where not exists (select 1 from public.programs p where p.institution_id = i.id and p.status = 'published'))
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_data_health() from public, anon;
grant execute on function public.admin_data_health() to authenticated;

-- ------------------------------------------------------------ the most viewed institutions
create or replace function public.admin_top_institutions(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  since timestamptz := now() - make_interval(days => least(greatest(coalesce(p_days, 30), 1), 365));
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(to_jsonb(r) order by r.views desc, r.clicks desc), '[]'::jsonb) into result from (
    select v.country, v.slug, i.names ->> 'en' as name, v.views, v.visitors, coalesce(c.clicks, 0) as clicks
    from (
      select upper(m[1]) as country, m[2] as slug, count(*) as views, count(distinct session) as visitors
      from (select session, regexp_match(path, '^/[a-z]{2}/institutions/([a-z]{2})/([^/?#]+)') as m
            from public.site_events where event = 'page_view' and at >= since) e
      where m is not null
      group by 1, 2 order by count(*) desc limit 40) v
    left join (
      select meta ->> 'country' as country, meta ->> 'slug' as slug, count(*) as clicks
      from public.site_events where event = 'apply_click' and at >= since and meta ? 'slug' group by 1, 2) c
      on c.slug = v.slug and c.country = v.country
    left join public.institutions i on i.slug = v.slug and i.country = v.country
  ) r;
  return result;
end;
$$;
revoke all on function public.admin_top_institutions(int) from public, anon;
grant execute on function public.admin_top_institutions(int) to authenticated;

-- ------------------------------------------------------------ database size
create or replace function public.admin_system()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'database_bytes', pg_database_size(current_database()),
    'tables', (select coalesce(jsonb_agg(to_jsonb(t) order by t.bytes desc), '[]'::jsonb) from (
        select c.relname as name, pg_total_relation_size(c.oid) as bytes, c.reltuples::bigint as rows
        from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind = 'r'
        order by pg_total_relation_size(c.oid) desc limit 12) t),
    'events_last_30_days', (select count(*) from public.site_events where at >= now() - interval '30 days'),
    'users', (select count(*) from public.profiles)
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_system() from public, anon;
grant execute on function public.admin_system() to authenticated;

-- ------------------------------------------------------------ probable duplicates
create or replace function public.admin_duplicates()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
set statement_timeout = '60s'
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(to_jsonb(g) order by g.n desc, g.country, g.name), '[]'::jsonb) into result from (
    select i.country, lower(i.names ->> 'en') as name, count(*) as n,
           jsonb_agg(jsonb_build_object('slug', i.slug, 'type', i.type, 'city', i.city ->> 'en',
                                        'programmes', (select count(*) from public.programs p where p.institution_id = i.id and p.status = 'published'))) as items
    from public.institutions i
    where coalesce(i.names ->> 'en', '') <> ''
    group by i.country, lower(i.names ->> 'en')
    having count(*) > 1
    order by count(*) desc, i.country, lower(i.names ->> 'en')
    limit 150) g;
  return result;
end;
$$;
revoke all on function public.admin_duplicates() from public, anon;
grant execute on function public.admin_duplicates() to authenticated;

-- ------------------------------------------------------------ "Report an error" messages
create table if not exists public.error_reports (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  path        text not null check (char_length(path) <= 300),
  note        text not null check (char_length(note) between 5 and 1500),
  contact     text check (contact is null or char_length(contact) <= 200),
  locale      text check (locale is null or locale ~ '^[a-z]{2}$'),
  status      text not null default 'new' check (status in ('new', 'in_progress', 'done', 'rejected')),
  admin_note  text check (admin_note is null or char_length(admin_note) <= 1500)
);
create index if not exists error_reports_status_idx on public.error_reports (status, created_at desc);
alter table public.error_reports enable row level security;
revoke all on public.error_reports from anon, authenticated;
grant select, update (status, admin_note) on public.error_reports to authenticated;
drop policy if exists "admin: read reports" on public.error_reports;
create policy "admin: read reports" on public.error_reports for select using (public.is_admin());
drop policy if exists "admin: update reports" on public.error_reports;
create policy "admin: update reports" on public.error_reports for update using (public.is_admin()) with check (public.is_admin());

-- Anyone may send a report (no account needed). Lengths are checked, and at most 200 reports an hour are accepted in
-- total, so that a script cannot fill the table.
create or replace function public.submit_error_report(p_path text, p_note text, p_contact text default null, p_locale text default null)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if p_path is null or char_length(p_path) > 300 or p_path !~ '^/' then
    raise exception 'bad path' using errcode = '22023';
  end if;
  if p_note is null or char_length(trim(p_note)) < 5 or char_length(p_note) > 1500 then
    raise exception 'bad note' using errcode = '22023';
  end if;
  if (select count(*) from public.error_reports where created_at > now() - interval '1 hour') >= 200 then
    raise exception 'too many reports' using errcode = '54000';
  end if;
  insert into public.error_reports (path, note, contact, locale)
  values (p_path, trim(p_note), nullif(left(trim(coalesce(p_contact, '')), 200), ''), case when p_locale ~ '^[a-z]{2}$' then p_locale else null end);
end;
$$;
revoke all on function public.submit_error_report(text, text, text, text) from public;
grant execute on function public.submit_error_report(text, text, text, text) to anon, authenticated;
