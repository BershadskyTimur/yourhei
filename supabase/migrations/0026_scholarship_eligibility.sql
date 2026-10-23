-- YourHEI: who a scholarship is open to. Run AFTER 0025. Safe to run again. Paste into Supabase -> SQL Editor -> Run.
--
-- eligible_countries: ISO codes of the countries whose citizens may apply, as the official page of the programme says
-- (for example Bolashak: only Kazakhstan). Empty (null) = the conditions are not listed here: the person must check the
-- official page. The lists change with every call, so the page always sends the reader to the official source.
alter table public.scholarships add column if not exists eligible_countries text[];
