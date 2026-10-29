-- YourHEI: programmes taught in Czech at Czech PUBLIC universities are tuition-free.
-- Paste into Supabase -> SQL Editor -> Run. Safe to run again (it only fills what is still empty).
--
-- Sources (checked on 29 October 2026):
--   * Study in Czechia (Czech Ministry of Education): "If you are admitted to a Czech-taught programme at a public
--     university, you do not pay tuition fees." https://studyin.gov.cz/plan-your-studies/learn-czech-study-tuition-free/
--   * The list of the 26 public universities (veřejné vysoké školy), MŠMT:
--     https://msmt.gov.cz/vzdelavani/vysoke-skolstvi/prehled-vysokych-skol-v-cr-2
-- Only programmes taught in Czech alone, read from Study in Czechia, with no price yet. State universities (defence,
-- police) and private ones are not touched. Fees for studying longer than the standard length are not covered here.

begin;

create temporary table cz_public (slug text primary key) on commit drop;
insert into cz_public (slug) values
  ('academy-of-performing-arts-in-prague'),            -- AMU
  ('academy-of-fine-arts-in-prague'),                  -- AVU
  ('czech-university-of-life-sciences-prague'),        -- ČZU
  ('czech-technical-university-in-prague'),            -- ČVUT
  ('janacek-academy-of-performing-arts'),              -- JAMU
  ('university-of-south-bohemia-in-ceske-budejovice'), -- JU
  ('masaryk-university'),                              -- MU
  ('mendel-university-in-brno'),                       -- MENDELU
  ('university-of-ostrava'),                           -- OU
  ('silesian-university-in-opava'),                    -- SU
  ('technical-university-of-liberec'),                 -- TUL
  ('university-of-hradec-kralove'),                    -- UHK
  ('jan-evangelista-purkyne-university-in-usti-nad-labem'), -- UJEP
  ('charles-university'),                              -- UK
  ('palacky-university-olomouc'),                      -- UP
  ('university-of-pardubice'),                         -- UPCE
  ('tomas-bata-university-in-zlin-cz'),                -- UTB
  ('university-of-veterinary-science-brno'),           -- VETUNI
  ('vsb-technical-university-of-ostrava'),             -- VŠB-TUO
  ('prague-university-of-economics-and-business'),     -- VŠE
  ('university-of-chemistry-and-technology-prague'),   -- VŠCHT
  ('college-of-polytechnics-jihlava'),                 -- VŠPJ
  ('institute-of-technology-and-business-in-ceske-budejovice'), -- VŠTE
  ('academy-of-arts-architecture-and-design-in-prague'), -- UMPRUM
  ('brno-university-of-technology'),                   -- VUT
  ('university-of-west-bohemia');                      -- ZČU

-- the 26 are public universities (an official fact): fill the ownership where it is still empty
update public.institutions i set ownership = 'public'
 where i.country = 'CZ' and i.slug in (select slug from cz_public) and i.ownership is null;

-- the Czech-taught programmes of these universities: tuition 0 for everybody
with changed as (
  update public.programs p
     set tuition = '[{"amount": 0, "currency": "CZK", "period": "year", "applies_to": "all"}]'::jsonb,
         free = true
    from public.institutions i
   where p.institution_id = i.id
     and i.country = 'CZ'
     and i.slug in (select slug from cz_public)
     and p.languages = array['cs']
     and p.tuition = '[]'::jsonb
     and p.requirements ->> 'source' = 'studyin_cz'
  returning p.id
)
insert into public.sources (entity, entity_id, field, url, accessed_at, confidence)
select 'program', c.id::text, 'tuition', 'https://studyin.gov.cz/plan-your-studies/learn-czech-study-tuition-free/', date '2026-10-29', 'high'
  from changed c
 where not exists (select 1 from public.sources s where s.entity = 'program' and s.entity_id = c.id::text and s.field = 'tuition');

commit;

-- How many Czech-taught programmes of public universities are free now (should be several thousand):
select count(*) as free_czech_taught
  from public.programs p join public.institutions i on i.id = p.institution_id
 where i.country = 'CZ' and p.free and p.languages = array['cs'];
