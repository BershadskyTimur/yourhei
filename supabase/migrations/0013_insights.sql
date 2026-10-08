-- YourHEI: more analytics for the admin panel (funnel, what people search for, clicks on "apply", quality of matches).
-- Run AFTER 0009. Safe to run again. Paste into Supabase -> SQL Editor -> Run.
--
-- Still anonymous: no names, no e-mails, no IP addresses. The site records these events only for visitors who pressed
-- "Accept all" in the cookie banner. A free-text search is kept only up to 40 characters.

-- ------------------------------------------------------------ more kinds of events
alter table public.site_events drop constraint if exists site_events_event_check;
alter table public.site_events add constraint site_events_event_check
  check (event in ('page_view', 'catalog_search', 'apply_click', 'matches_view'));
alter table public.site_events add column if not exists meta jsonb;
alter table public.site_events drop constraint if exists site_events_meta_check;
alter table public.site_events add constraint site_events_meta_check
  check (meta is null or pg_column_size(meta) <= 700);
create index if not exists site_events_event_idx on public.site_events (event, at desc);

-- ------------------------------------------------------------ visits: now only page views are counted as views
create or replace function public.admin_traffic(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  days int := least(greatest(coalesce(p_days, 30), 1), 365);
  since timestamptz := now() - make_interval(days => least(greatest(coalesce(p_days, 30), 1), 365));
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'days',     days,
    'views',    (select count(*) from public.site_events where event = 'page_view' and at >= since),
    'visitors', (select count(distinct session) from public.site_events where event = 'page_view' and at >= since),
    'by_day',   (select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'views', coalesce(s.views, 0), 'visitors', coalesce(s.visitors, 0)) order by d), '[]'::jsonb)
                 from generate_series(current_date - (days - 1), current_date, interval '1 day') d
                 left join (select at::date as day, count(*) views, count(distinct session) visitors from public.site_events where event = 'page_view' and at >= since group by 1) s on s.day = d::date),
    'top_pages', (select coalesce(jsonb_agg(jsonb_build_object('path', p, 'n', n) order by n desc), '[]'::jsonb) from (
                 select regexp_replace(path, '^/[a-z]{2}(/|$)', '/') as p, count(*) n from public.site_events where event = 'page_view' and at >= since group by 1 order by count(*) desc limit 15) x),
    'countries', (select coalesce(jsonb_agg(jsonb_build_object('country', country, 'n', n) order by n desc), '[]'::jsonb) from (
                 select country, count(*) n from public.site_events where event = 'page_view' and at >= since and country is not null group by 1 order by count(*) desc limit 15) x),
    'devices',  (select coalesce(jsonb_object_agg(coalesce(device, 'unknown'), n), '{}'::jsonb) from (select device, count(*) n from public.site_events where event = 'page_view' and at >= since group by 1) x),
    'locales',  (select coalesce(jsonb_object_agg(coalesce(locale, 'unknown'), n), '{}'::jsonb) from (select locale, count(*) n from public.site_events where event = 'page_view' and at >= since group by 1) x),
    'referrers', (select coalesce(jsonb_agg(jsonb_build_object('host', referrer, 'n', n) order by n desc), '[]'::jsonb) from (
                 select referrer, count(*) n from public.site_events where event = 'page_view' and at >= since and referrer is not null group by 1 order by count(*) desc limit 10) x)
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_traffic(int) from public, anon;
grant execute on function public.admin_traffic(int) to authenticated;

-- ------------------------------------------------------------ the new numbers
create or replace function public.admin_insights(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  days int := least(greatest(coalesce(p_days, 30), 1), 365);
  since timestamptz := now() - make_interval(days => least(greatest(coalesce(p_days, 30), 1), 365));
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'days', days,

    -- how many visits (sessions) reached each step; the people counts come from the accounts themselves
    'funnel', jsonb_build_object(
      'visitors',     (select count(distinct session) from public.site_events where event = 'page_view' and at >= since),
      'catalog',      (select count(distinct session) from public.site_events where event = 'page_view' and at >= since and path ~ '^/[a-z]{2}/catalog'),
      'institution',  (select count(distinct session) from public.site_events where event = 'page_view' and at >= since and path ~ '^/[a-z]{2}/institutions/'),
      'register',     (select count(distinct session) from public.site_events where event = 'page_view' and at >= since and path ~ '^/[a-z]{2}/register'),
      'survey',       (select count(distinct session) from public.site_events where event = 'page_view' and at >= since and path ~ '^/[a-z]{2}/survey'),
      'matches',      (select count(distinct session) from public.site_events where event = 'page_view' and at >= since and path ~ '^/[a-z]{2}/matches'),
      'new_accounts', (select count(*) from public.profiles where created_at >= since),
      'surveys_done', (select count(*) from public.survey_attempts where status = 'completed' and completed_at >= since)
    ),

    'searches', jsonb_build_object(
      'total',     (select count(*) from public.site_events where event = 'catalog_search' and at >= since),
      'empty',     (select count(*) from public.site_events where event = 'catalog_search' and at >= since and (meta->>'results')::int = 0),
      'with_text', (select count(*) from public.site_events where event = 'catalog_search' and at >= since and meta ? 'q'),
      'free_only', (select count(*) from public.site_events where event = 'catalog_search' and at >= since and meta->>'free' = 'true'),
      'countries', (select coalesce(jsonb_agg(jsonb_build_object('label', v, 'n', n) order by n desc), '[]'::jsonb) from (
                      select meta->>'country' v, count(*) n from public.site_events where event = 'catalog_search' and at >= since and meta ? 'country' group by 1 order by count(*) desc limit 12) x),
      'levels',    (select coalesce(jsonb_agg(jsonb_build_object('label', v, 'n', n) order by n desc), '[]'::jsonb) from (
                      select meta->>'level' v, count(*) n from public.site_events where event = 'catalog_search' and at >= since and meta ? 'level' group by 1 order by count(*) desc limit 8) x),
      'languages', (select coalesce(jsonb_agg(jsonb_build_object('label', v, 'n', n) order by n desc), '[]'::jsonb) from (
                      select meta->>'language' v, count(*) n from public.site_events where event = 'catalog_search' and at >= since and meta ? 'language' group by 1 order by count(*) desc limit 8) x),
      'fields',    (select coalesce(jsonb_agg(jsonb_build_object('label', v, 'n', n) order by n desc), '[]'::jsonb) from (
                      select meta->>'field' v, count(*) n from public.site_events where event = 'catalog_search' and at >= since and meta ? 'field' group by 1 order by count(*) desc limit 8) x),
      'queries',   (select coalesce(jsonb_agg(jsonb_build_object('label', v, 'n', n) order by n desc), '[]'::jsonb) from (
                      select lower(meta->>'q') v, count(*) n from public.site_events where event = 'catalog_search' and at >= since and meta ? 'q' group by 1 order by count(*) desc limit 15) x),
      -- searches that found nothing: the list of what the database is missing
      'empty_list', (select coalesce(jsonb_agg(jsonb_build_object('label', v, 'n', n) order by n desc), '[]'::jsonb) from (
                      select concat_ws(' · ', meta->>'country', meta->>'level', meta->>'language', case when meta ? 'field' then 'field ' || (meta->>'field') end,
                                       case when meta->>'free' = 'true' then 'free' end, case when meta ? 'q' then '"' || lower(meta->>'q') || '"' end) v, count(*) n
                      from public.site_events where event = 'catalog_search' and at >= since and (meta->>'results')::int = 0 group by 1 order by count(*) desc limit 15) x)
    ),

    'applies', jsonb_build_object(
      'total', (select count(*) from public.site_events where event = 'apply_click' and at >= since),
      'kinds', (select coalesce(jsonb_object_agg(k, n), '{}'::jsonb) from (
                  select coalesce(meta->>'kind', 'other') k, count(*) n from public.site_events where event = 'apply_click' and at >= since group by 1) x),
      'top',   (select coalesce(jsonb_agg(jsonb_build_object('label', v, 'n', n) order by n desc), '[]'::jsonb) from (
                  select concat_ws(' / ', meta->>'country', meta->>'slug') v, count(*) n from public.site_events where event = 'apply_click' and at >= since group by 1 order by count(*) desc limit 15) x)
    ),

    'matches', jsonb_build_object(
      'views',   (select count(*) from public.site_events where event = 'matches_view' and at >= since),
      'empty',   (select count(*) from public.site_events where event = 'matches_view' and at >= since and (meta->>'passed')::int = 0),
      'avg_passed', (select round(avg((meta->>'passed')::numeric), 1) from public.site_events where event = 'matches_view' and at >= since)
    )
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_insights(int) from public, anon;
grant execute on function public.admin_insights(int) to authenticated;
