// Drafts of institution and country cards (format: DATA_COLLECTION.md): validation, a readable
// review report, and the SQL that stores them in the database. No browser or database code here.
// Self-contained on purpose: scripts/import-drafts.ts runs it directly with Node.
import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const url = z.string().url();
const text = z.record(z.string(), z.string().nullable());
const confidence = z.enum(['high', 'medium', 'low']);

const money = z.object({
  amount: z.number().nonnegative().nullable(),
  currency: z.string().regex(/^[A-Z]{3}$/),
});
const tuition = money.extend({
  period: z.enum(['year', 'semester', 'credit', 'total']),
  applies_to: z.enum(['domestic', 'international', 'eu', 'all']),
});

const program = z.object({
  names: z.object({ original: z.string().min(1) }).catchall(z.string().nullable()),
  level: z.enum(['school', 'college', 'foundation', 'bachelor', 'master', 'phd', 'language_course']),
  isced_f: z.string().regex(/^\d{2,4}$/).nullable(),
  languages: z.array(z.string().regex(/^[a-z]{2}$/)),
  duration_years: z.number().positive().max(12).nullable(),
  format: z.enum(['on_campus', 'online', 'blended']).nullable(),
  intakes: z.array(z.string().regex(/^(0[1-9]|1[0-2])$/)),
  tuition: z.array(tuition),
  requirements: z
    .object({
      documents: z.array(z.string()).default([]),
      min_scores: z.array(z.object({ exam: z.string(), min: z.number().nullable() })).default([]),
      min_gpa: z.object({ system: z.string(), value: z.number().nullable() }).nullable().default(null),
      entrance_exams: z.unknown().optional(),
      interview: z.unknown().optional(),
      portfolio: z.unknown().optional(),
    })
    .default({ documents: [], min_scores: [], min_gpa: null }),
  deadlines: z.array(z.object({ intake: z.string(), applies_to: z.string(), date: isoDate.nullable() })).default([]),
  application_fee: money.nullable().default(null),
  application_url: url.nullable().default(null),
});

const source = z.object({ field: z.string().min(1), url, accessed_at: isoDate, confidence });

export const institutionDraftSchema = z.object({
  schema_version: z.literal(1),
  collected_at: isoDate,
  academic_year: z.string().regex(/^\d{4}\/\d{4}$/),
  institution: z.object({
    external_ids: z.record(z.string(), z.string().nullable()).default({}),
    names: z.object({ original: z.string().min(1) }).catchall(z.string().nullable()),
    type: z.enum(['university', 'college', 'school', 'language_school', 'foundation', 'vocational']),
    country: z.string().regex(/^[A-Z]{2}$/),
    city: text.default({}),
    ownership: z.enum(['public', 'private']).nullable(),
    founded_year: z.number().int().min(800).max(2100).nullable(),
    website: url.nullable(),
    description: z.record(z.string(), z.string()).default({}),
    dormitory: z.object({ available: z.boolean().nullable(), cost: money.partial().nullable().optional() }).nullable().default(null),
    rankings: z.array(z.object({ name: z.string(), year: z.number().int(), position: z.string(), source_url: url, scope: z.enum(['world', 'country']).default('world') })).default([]),
    // optional extras used by the matching (not in the first version of the format)
    city_size: z.enum(['megapolis', 'medium', 'small_student']).nullable().optional(),
    climate: z.enum(['warm', 'temperate', 'cold']).nullable().optional(),
    size: z.enum(['large', 'small']).nullable().optional(),
    features: z.array(z.enum(['internship', 'double_degree', 'exchange'])).optional(),
  }),
  programs: z.array(program),
  scholarships: z.array(z.object({ names: z.object({ original: z.string() }).catchall(z.string().nullable()), covers: z.enum(['tuition', 'living', 'full', 'partial']).nullable(), eligibility: z.record(z.string(), z.string()).default({}), url: url.nullable() })).default([]),
  sources: z.array(source),
  notes_for_reviewer: z.string().default(''),
});
export type InstitutionDraft = z.infer<typeof institutionDraftSchema>;

export const countryDraftSchema = z.object({
  schema_version: z.literal(1),
  collected_at: isoDate,
  country: z.string().regex(/^[A-Z]{2}$/),
  currency: z.string().regex(/^[A-Z]{3}$/),
  academic_year_start: z.string().regex(/^(0[1-9]|1[0-2])$/).nullable(),
  study_visa: z.object({ summary: text, official_url: url.nullable() }),
  work_during_study: z.object({ allowed: z.boolean().nullable(), summary: text }),
  post_study_work_visa: z.object({ available: z.boolean().nullable(), summary: text }),
  cost_of_living: z.array(z.object({ city: text, amount_per_month: z.number().nonnegative().nullable(), currency: z.string().regex(/^[A-Z]{3}$/) })).default([]),
  diploma_recognition: z.object({ summary: text, official_url: url.nullable(), recognised: z.boolean().nullable().optional() }),
  application_systems: z.array(z.object({ name: z.string(), url })).default([]),
  sources: z.array(source),
  notes_for_reviewer: z.string().default(''),
});
export type CountryDraft = z.infer<typeof countryDraftSchema>;

export type Validation<T> = { ok: true; data: T; warnings: string[] } | { ok: false; errors: string[] };

const fmt = (e: z.ZodError) => e.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);

/** Facts that matching relies on should have a source: list the ones that do not. */
function sourceWarnings(d: InstitutionDraft): string[] {
  const covered = new Set(d.sources.map((s) => s.field));
  const out: string[] = [];
  d.programs.forEach((p, i) => {
    p.tuition.forEach((t, j) => {
      if (t.amount !== null && !covered.has(`programs[${i}].tuition[${j}].amount`)) out.push(`programs[${i}].tuition[${j}].amount has no source`);
    });
    if (p.requirements.min_gpa?.value != null && !covered.has(`programs[${i}].requirements.min_gpa`)) out.push(`programs[${i}].requirements.min_gpa has no source`);
  });
  if (d.institution.dormitory?.available != null && !covered.has('institution.dormitory')) out.push('institution.dormitory has no source');
  return out;
}

export function validateInstitutionDraft(json: unknown): Validation<InstitutionDraft> {
  const r = institutionDraftSchema.safeParse(json);
  return r.success ? { ok: true, data: r.data, warnings: sourceWarnings(r.data) } : { ok: false, errors: fmt(r.error) };
}
export function validateCountryDraft(json: unknown): Validation<CountryDraft> {
  const r = countryDraftSchema.safeParse(json);
  return r.success ? { ok: true, data: r.data, warnings: [] } : { ok: false, errors: fmt(r.error) };
}

// ------------------------------------------------------------------ SQL
const q = (v: string | number | boolean | null | undefined): string =>
  v === null || v === undefined ? 'null' : typeof v === 'number' ? String(v) : typeof v === 'boolean' ? String(v) : `'${v.replace(/'/g, "''")}'`;
const j = (v: unknown): string => `${q(JSON.stringify(v))}::jsonb`;
const arr = (v: string[]): string => `array[${v.map(q).join(', ')}]::text[]`;

export interface SqlOptions {
  /** true: the rows become public and are used by the matching; false: stored as drafts */
  publish: boolean;
}

/** One DO block that stores one institution card. The institution itself must exist (imported from Wikidata). */
export function institutionDraftToSql(d: InstitutionDraft, slug: string, { publish }: SqlOptions): string {
  const i = d.institution;
  const status = publish ? 'published' : 'draft';
  const verified = publish ? 'now()' : 'null';
  const lines: string[] = [];
  lines.push(`do $draft$`, `declare v uuid;`, `begin`);
  lines.push(`  select id into v from public.institutions where country = ${q(i.country)} and slug = ${q(slug)};`);
  lines.push(`  if v is null then raise exception 'Institution ${i.country}/${slug} is not in the database: run the institutions import first'; end if;`);
  lines.push(
    `  update public.institutions set`,
    `    website = coalesce(${q(i.website)}, website), ownership = ${q(i.ownership)}, founded_year = coalesce(${q(i.founded_year)}, founded_year),`,
    `    dormitory = ${q(i.dormitory?.available ?? null)}, description = ${j(i.description)}, city_size = ${q(i.city_size ?? null)},`,
    `    climate = ${q(i.climate ?? null)}, size = ${q(i.size ?? null)}, features = ${arr(i.features ?? [])},`,
    `    status = ${q(status)}, verified_at = ${verified}`,
    `  where id = v;`,
  );

  lines.push(`  delete from public.programs where institution_id = v;`);
  for (const p of d.programs) {
    const free = p.tuition.length > 0 && p.tuition.every((t) => t.amount === 0);
    const req = {
      documents: p.requirements.documents,
      min_scores: p.requirements.min_scores.filter((s) => s.min !== null),
      min_gpa: p.requirements.min_gpa && p.requirements.min_gpa.value !== null ? p.requirements.min_gpa : null,
      entrance_exams: p.requirements.entrance_exams ?? null,
      interview: p.requirements.interview ?? null,
      portfolio: p.requirements.portfolio ?? null,
    };
    lines.push(
      `  insert into public.programs (institution_id, names, level, isced_f, languages, duration_years, format, intakes, tuition, free, requirements, deadlines, application_fee, application_url, academic_year, status, verified_at) values (`,
      `    v, ${j(p.names)}, ${q(p.level)}, ${q(p.isced_f)}, ${arr(p.languages)}, ${q(p.duration_years)}, ${q(p.format)}, ${arr(p.intakes)},`,
      `    ${j(p.tuition)}, ${q(free)}, ${j(req)}, ${j(p.deadlines)}, ${p.application_fee ? j(p.application_fee) : 'null'}, ${q(p.application_url)}, ${q(d.academic_year)}, ${q(status)}, ${verified});`,
    );
  }

  lines.push(`  delete from public.scholarships where institution_id = v;`);
  for (const s of d.scholarships) {
    lines.push(`  insert into public.scholarships (institution_id, names, covers, eligibility, url, status, verified_at) values (v, ${j(s.names)}, ${q(s.covers)}, ${j(s.eligibility)}, ${q(s.url)}, ${q(status)}, ${verified});`);
  }

  lines.push(`  delete from public.rankings where institution_id = v;`);
  for (const r of i.rankings) {
    lines.push(`  insert into public.rankings (institution_id, name, year, position, scope, source_url) values (v, ${q(r.name)}, ${r.year}, ${q(r.position)}, ${q(r.scope)}, ${q(r.source_url)});`);
  }

  lines.push(`  delete from public.sources where entity = 'institution' and entity_id = v::text;`);
  for (const s of d.sources) {
    lines.push(`  insert into public.sources (entity, entity_id, field, url, accessed_at, confidence) values ('institution', v::text, ${q(s.field)}, ${q(s.url)}, ${q(s.accessed_at)}, ${q(s.confidence)});`);
  }
  lines.push(`end`, `$draft$;`);
  return lines.join('\n');
}

export function countryDraftToSql(d: CountryDraft, { publish }: SqlOptions): string {
  const status = publish ? 'published' : 'draft';
  const verified = publish ? 'now()' : 'null';
  const summary = {
    study_visa: d.study_visa.summary,
    work_during_study: d.work_during_study.summary,
    post_study_work_visa: d.post_study_work_visa.summary,
    diploma_recognition: d.diploma_recognition.summary,
  };
  const urls = { study_visa: d.study_visa.official_url, diploma_recognition: d.diploma_recognition.official_url, application_systems: d.application_systems };
  return [
    `insert into public.country_data (country, currency, academic_year_start, work_during_study, post_study_work_visa, recognition, cost_of_living, summary, official_urls, status, verified_at) values (`,
    `  ${q(d.country)}, ${q(d.currency)}, ${q(d.academic_year_start)}, ${q(d.work_during_study.allowed)}, ${q(d.post_study_work_visa.available)}, ${q(d.diploma_recognition.recognised ?? null)},`,
    `  ${j(d.cost_of_living)}, ${j(summary)}, ${j(urls)}, ${q(status)}, ${verified})`,
    `on conflict (country) do update set currency = excluded.currency, academic_year_start = excluded.academic_year_start, work_during_study = excluded.work_during_study,`,
    `  post_study_work_visa = excluded.post_study_work_visa, recognition = excluded.recognition, cost_of_living = excluded.cost_of_living, summary = excluded.summary,`,
    `  official_urls = excluded.official_urls, status = excluded.status, verified_at = excluded.verified_at;`,
    `delete from public.sources where entity = 'country' and entity_id = ${q(d.country)};`,
    ...d.sources.map((s) => `insert into public.sources (entity, entity_id, field, url, accessed_at, confidence) values ('country', ${q(d.country)}, ${q(s.field)}, ${q(s.url)}, ${q(s.accessed_at)}, ${q(s.confidence)});`),
  ].join('\n');
}

// ------------------------------------------------------------------ review report for the owner
const money2 = (m: { amount: number | null; currency: string }) => (m.amount === null ? 'не найдено' : `${m.amount} ${m.currency}`);

/** A readable summary of one draft: what was found, from where, how sure, and what to double-check. */
export function institutionReview(d: InstitutionDraft, slug: string, warnings: string[]): string {
  const i = d.institution;
  const out: string[] = [`### ${i.names.en ?? i.names.original} (${i.country}/${slug})`, ''];
  out.push(`- Сайт: ${i.website ?? 'не найден'} · форма: ${i.ownership ?? '?'} · основано: ${i.founded_year ?? '?'} · общежитие: ${i.dormitory?.available == null ? 'нет данных' : i.dormitory.available ? 'есть' : 'нет'}`);
  out.push(`- Учебный год данных: ${d.academic_year}; собрано: ${d.collected_at}`);
  for (const [n, p] of d.programs.entries()) {
    const t = p.tuition.map((x) => `${money2(x)} / ${x.period} (${x.applies_to})`).join('; ') || 'стоимость не найдена';
    const req = [p.requirements.min_gpa?.value != null ? `средний балл ≥ ${p.requirements.min_gpa.value} (${p.requirements.min_gpa.system})` : null, ...p.requirements.min_scores.filter((s) => s.min !== null).map((s) => `${s.exam} ≥ ${s.min}`)].filter(Boolean).join(', ') || 'требования не найдены';
    out.push(`- **Программа ${n + 1}:** ${p.names.en ?? p.names.original} — ${p.level}, ISCED-F ${p.isced_f ?? '?'}, языки: ${p.languages.join(', ') || '?'}, ${p.duration_years ?? '?'} лет, ${p.format ?? '?'}, набор: ${p.intakes.join('/') || '?'}`);
    out.push(`  - Стоимость: ${t}`, `  - Требования: ${req}`);
  }
  const low = d.sources.filter((s) => s.confidence !== 'high');
  if (low.length) out.push(`- Значения с неполной уверенностью: ${low.map((s) => `${s.field} (${s.confidence})`).join(', ')}`);
  if (warnings.length) out.push(`- ⚠️ Без источника: ${warnings.join('; ')}`);
  if (d.notes_for_reviewer) out.push(`- Заметки сборщика: ${d.notes_for_reviewer}`);
  out.push(`- Источников: ${d.sources.length}; главные: ${[...new Set(d.sources.map((s) => s.url))].slice(0, 3).join(' · ')}`, '');
  return out.join('\n');
}
