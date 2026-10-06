-- YourHEI: saved institutions ("My list"). Run AFTER 0001-0006. Safe to run again.
-- Paste into Supabase -> SQL Editor -> Run.
--
-- A person can only see and change their own rows. Saving is at institution level: programme rows are
-- replaced when a card is re-imported, so their ids are not stable.

create table if not exists public.favorites (
  user_id    uuid not null references auth.users (id) on delete cascade,
  institution_id uuid not null references public.institutions (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, institution_id)
);

alter table public.favorites enable row level security;

drop policy if exists "own favorites: read" on public.favorites;
create policy "own favorites: read" on public.favorites for select using (auth.uid() = user_id);
drop policy if exists "own favorites: insert" on public.favorites;
create policy "own favorites: insert" on public.favorites for insert with check (auth.uid() = user_id);
drop policy if exists "own favorites: delete" on public.favorites;
create policy "own favorites: delete" on public.favorites for delete using (auth.uid() = user_id);

grant select, insert, delete on public.favorites to authenticated;
