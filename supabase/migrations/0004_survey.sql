-- YourHEI, stage 3: the survey. Run AFTER 0002 and 0003. Safe to run again.
-- Paste the whole file into Supabase -> SQL Editor -> Run.
--
-- Every pass through the survey is one row ("attempt"). While it is in progress the answers are
-- saved after each question and the person can continue later. A completed attempt can no longer
-- be changed: to give other answers the person takes the survey again (a new attempt).

create table if not exists public.survey_attempts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  config_version int  not null,                       -- version of the question config
  status         text not null default 'in_progress'
                   check (status in ('in_progress', 'completed', 'abandoned')),
  answers        jsonb not null default '{}'::jsonb,  -- {question id: answer}
  started_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  completed_at   timestamptz
);

create index if not exists survey_attempts_user_idx on public.survey_attempts (user_id, started_at desc);

-- At most one unfinished attempt per person.
create unique index if not exists survey_attempts_one_open
  on public.survey_attempts (user_id) where status = 'in_progress';

alter table public.survey_attempts enable row level security;

drop policy if exists "own attempts: read" on public.survey_attempts;
create policy "own attempts: read" on public.survey_attempts for select using (auth.uid() = user_id);

drop policy if exists "own attempts: start" on public.survey_attempts;
create policy "own attempts: start" on public.survey_attempts for insert
  with check (auth.uid() = user_id and status = 'in_progress');

-- Only an attempt that is still in progress can be changed; a finished one is frozen.
drop policy if exists "own attempts: change while open" on public.survey_attempts;
create policy "own attempts: change while open" on public.survey_attempts for update
  using (auth.uid() = user_id and status = 'in_progress')
  with check (auth.uid() = user_id);

revoke all on public.survey_attempts from anon, authenticated;
grant select, insert on public.survey_attempts to authenticated;
grant update (answers, status) on public.survey_attempts to authenticated;

create or replace function public.survey_attempt_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if new.status = 'completed' and old.status <> 'completed' then
    new.completed_at := now();
  end if;
  return new;
end $$;

drop trigger if exists survey_attempts_touch on public.survey_attempts;
create trigger survey_attempts_touch before update on public.survey_attempts
  for each row execute function public.survey_attempt_touch();
