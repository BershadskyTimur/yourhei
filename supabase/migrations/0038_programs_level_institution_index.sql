-- YourHEI: faster matches in the biggest countries. Run AFTER 0037. Safe to run again.
-- Paste into Supabase -> SQL Editor -> Run. It may take up to a minute: it builds an index.
--
-- Matches read the published programmes of one country and level in the order (institution, programme). For the US and the UK at
-- bachelor level that is 50 000 - 70 000 programmes, and without an index in exactly this order the database sorts all of them for every
-- page and is cancelled by the time limit. The index lets it walk the programmes already in order and stop after 1000.
create index if not exists programs_pub_level_inst_idx
  on public.programs (level, institution_id, id)
  where status = 'published';
