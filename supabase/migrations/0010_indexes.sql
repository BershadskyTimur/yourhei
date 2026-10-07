-- YourHEI: indexes and statistics for a large catalogue (100,000+ programmes). Run AFTER 0001-0009.
-- Safe to run again. Paste into Supabase -> SQL Editor -> Run.
--
-- Why: the matching page asks for "published programmes of this level, in these countries, in these fields".
-- With 100,000 programmes the database needs these indexes (and fresh statistics after the big data load),
-- otherwise the request is cancelled with "statement timeout".

create index if not exists programs_institution_level_idx
  on public.programs (institution_id, level) where status = 'published';

-- prefix search on the ISCED-F field code ("061%")
create index if not exists programs_isced_idx
  on public.programs (isced_f text_pattern_ops) where status = 'published';

create index if not exists institutions_country_idx on public.institutions (country);
create index if not exists institutions_type_idx on public.institutions (type);

-- fresh statistics for the query planner (needed after loading lots of rows)
analyze public.programs;
analyze public.institutions;
analyze public.sources;
analyze public.rankings;
