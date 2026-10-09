-- YourHEI: the real reason the catalog and matches were slow for visitors. Run AFTER 0017. Safe to run again.
-- Paste into Supabase -> SQL Editor -> Run.
--
-- For a visitor (anon) the database applies row-level security, and under it a search such as "language contains de" or
-- "name contains ..." may NOT use its index (those operators are not marked leakproof), so it read the whole table: 3 s
-- and a timeout. The same query as the database owner takes 3 ms.
-- The two functions below already return ONLY published programmes of published institutions and take every filter as
-- a bound parameter, so they can safely run with the owner's rights (security definer) and use the indexes.

alter function public.catalog_programs(text, text, text, text, boolean, text, uuid, uuid, int) security definer;
alter function public.match_programs(text, text[], text[], text[], uuid, uuid, int) security definer;
alter function public.catalog_programs(text, text, text, text, boolean, text, uuid, uuid, int) set search_path = public;
alter function public.match_programs(text, text[], text[], text[], uuid, uuid, int) set search_path = public;
revoke all on function public.catalog_programs(text, text, text, text, boolean, text, uuid, uuid, int) from public;
revoke all on function public.match_programs(text, text[], text[], text[], uuid, uuid, int) from public;
grant execute on function public.catalog_programs(text, text, text, text, boolean, text, uuid, uuid, int) to anon, authenticated;
grant execute on function public.match_programs(text, text[], text[], text[], uuid, uuid, int) to anon, authenticated;
