-- One institution added by hand from Wikidata (CC0): Poznań University of Technology (Q1678753), needed for its programme card (drafts_pl_put.sql).
-- Run BEFORE drafts_pl_put.sql. Safe to run again: an institution already in the database (same Wikidata id) is left as it is.
insert into public.institutions (slug, type, country, city, names, location, website, founded_year, external_ids)
select v.* from (values
  ('poznan-university-of-technology', 'university', 'PL', '{"en":"Poznań"}'::jsonb, '{"original":"Politechnika Poznańska","en":"Poznań University of Technology","ru":"Познанский технический университет"}'::jsonb, extensions.ST_SetSRID(extensions.ST_MakePoint(16.918333, 52.394167), 4326)::extensions.geography, 'https://www.put.poznan.pl/', 1919, '{"wikidata":"Q1678753"}'::jsonb)
) as v(slug, type, country, city, names, location, website, founded_year, external_ids)
where not exists (
  select 1 from public.institutions i where i.external_ids ->> 'wikidata' = v.external_ids ->> 'wikidata'
)
on conflict (country, slug) do nothing;
