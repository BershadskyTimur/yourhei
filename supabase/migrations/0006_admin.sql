-- YourHEI: admin panel (role "admin", write access to the catalogue, audit log, statistics).
-- Run AFTER 0001-0005. Safe to run again. Paste into Supabase -> SQL Editor -> Run.
--
-- How a person becomes an admin: see docs/SETUP_GUIDE.md (one SQL line with your e-mail).
-- Nobody can make themselves an admin through the website: the "role" column of profiles
-- cannot be changed with the public key (see 0002_accounts.sql).

-- ------------------------------------------------------------ who is an admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ------------------------------------------------------------ admin may read profiles (counts only in the UI)
drop policy if exists "admin: read profiles" on public.profiles;
create policy "admin: read profiles" on public.profiles for select using (public.is_admin());

-- ------------------------------------------------------------ admin may read and write the catalogue
-- (Ordinary visitors and signed-in users keep read-only access to published rows, as before.)
do $$
declare t text;
begin
  foreach t in array array['institution_types', 'institutions', 'programs', 'scholarships',
                           'rankings', 'sources', 'country_data']
  loop
    execute format('drop policy if exists "admin: all" on public.%I', t);
    execute format('create policy "admin: all" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- ------------------------------------------------------------ audit log
create table if not exists public.audit_log (
  id         bigint generated always as identity primary key,
  at         timestamptz not null default now(),
  actor      uuid,                      -- auth.users id of who made the change (null = SQL editor / scripts)
  action     text not null,             -- INSERT / UPDATE / DELETE
  table_name text not null,
  row_id     text,
  details    jsonb not null default '{}'::jsonb
);
create index if not exists audit_log_at_idx on public.audit_log (at desc);

alter table public.audit_log enable row level security;
drop policy if exists "admin: read audit log" on public.audit_log;
create policy "admin: read audit log" on public.audit_log for select using (public.is_admin());
grant select on public.audit_log to authenticated;

create or replace function public.log_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r   jsonb := to_jsonb(coalesce(new, old)) - 'location' - 'description' - 'requirements' - 'summary' - 'cost_of_living';
  rid text  := coalesce(r ->> 'id', r ->> 'country', r ->> 'code');
begin
  -- Only changes made by a signed-in admin from the website are logged here.
  -- Bulk imports from the SQL editor have no signed-in user and would flood the log.
  if auth.uid() is null then
    return coalesce(new, old);
  end if;
  insert into public.audit_log (actor, action, table_name, row_id, details)
  values (auth.uid(), tg_op, tg_table_name, rid,
          case when tg_op = 'UPDATE'
               then jsonb_build_object('status_before', to_jsonb(old) ->> 'status', 'row', r)
               else jsonb_build_object('row', r) end);
  return coalesce(new, old);
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['institutions', 'programs', 'scholarships', 'country_data', 'institution_types']
  loop
    execute format('drop trigger if exists %I on public.%I', t || '_audit', t);
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.log_change()', t || '_audit', t);
  end loop;
end $$;

-- ------------------------------------------------------------ dashboard numbers
create or replace function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'users',                (select count(*) from public.profiles),
    'users_last_7_days',    (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'surveys_completed',    (select count(*) from public.survey_attempts where status = 'completed'),
    'institutions',         (select count(*) from public.institutions),
    'institutions_published', (select count(*) from public.institutions where status = 'published'),
    'programs',             (select count(*) from public.programs),
    'programs_published',   (select count(*) from public.programs where status = 'published'),
    'programs_draft',       (select count(*) from public.programs where status = 'draft'),
    'countries_published',  (select count(*) from public.country_data where status = 'published'),
    'countries_draft',      (select count(*) from public.country_data where status = 'draft')
  );
end;
$$;
revoke all on function public.admin_stats() from public;
grant execute on function public.admin_stats() to authenticated;
