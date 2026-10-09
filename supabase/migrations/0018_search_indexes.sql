-- YourHEI: indexes so that "language" and "name contains" searches stay fast with ~150,000 programmes.
-- Run AFTER 0016/0017. Safe to run again. Paste into Supabase -> SQL Editor -> Run (it can take 10-60 seconds).
--
-- 1. The language index (GIN) collected thousands of un-merged entries during the big data loads, which makes every
--    search by language slow until they are merged: gin_clean_pending_list does that.
-- 2. A trigram index makes "name contains ..." (ILIKE '%text%') use an index instead of reading every programme.

create extension if not exists pg_trgm with schema extensions;

create index if not exists programs_name_en_trgm on public.programs using gin ((names ->> 'en') extensions.gin_trgm_ops) where status = 'published';
create index if not exists programs_name_orig_trgm on public.programs using gin ((names ->> 'original') extensions.gin_trgm_ops) where status = 'published';

select gin_clean_pending_list('public.programs_languages_idx'::regclass);

analyze public.programs;
analyze public.institutions;
