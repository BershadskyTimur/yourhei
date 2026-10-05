// Reference lists for the survey (SPEC.md section 10). Names are given in English and, where the
// name is not simply an abbreviation, in the other site languages; a missing translation falls
// back to English. Languages and currencies use the browser's own names (Intl.DisplayNames).
import iscedData from '../../../data/reference/isced-f.json';

export type Label = { en: string } & Partial<Record<'ru' | 'ka' | 'es' | 'zh', string>>;

export function labelFor(label: Label, locale: string): string {
  return (label as Record<string, string | undefined>)[locale] ?? label.en;
}

// ------------------------------------------------------------------ specialties (ISCED-F 2013)
export interface IscedEntry {
  c: string;
  en: string;
  ru: string;
  ka: string;
  es: string;
  zh: string;
}
export const ISCED: IscedEntry[] = iscedData as IscedEntry[];
const ISCED_BY_CODE = new Map(ISCED.map((e) => [e.c, e]));

export function iscedEntry(code: string): IscedEntry | undefined {
  return ISCED_BY_CODE.get(code);
}
export function iscedLevel(code: string): 'broad' | 'narrow' | 'detailed' {
  return code.length === 2 ? 'broad' : code.length === 3 ? 'narrow' : 'detailed';
}
/** "0613" -> ["06", "061", "0613"] (broad, narrow, detailed). */
export function iscedPath(code: string): string[] {
  return [2, 3, 4].filter((n) => n <= code.length).map((n) => code.slice(0, n));
}

// ------------------------------------------------------------------ grading systems
export interface GradingSystem {
  id: string;
  min: number;
  max: number;
  /** true when a LOWER number is better (German 1-6) */
  reverse?: boolean;
  label: Label;
}
export const GRADING_SYSTEMS: GradingSystem[] = [
  { id: 'five', min: 1, max: 5, label: { en: '5-point scale (5 is best)', ru: '5-балльная (5 — лучшая)', ka: '5-ბალიანი (5 საუკეთესოა)', es: 'Escala de 5 puntos (5 es la mejor)', zh: '5 分制（5 分最高）' } },
  { id: 'ten', min: 1, max: 10, label: { en: '10-point scale', ru: '10-балльная', ka: '10-ბალიანი', es: 'Escala de 10 puntos', zh: '10 分制' } },
  { id: 'twelve', min: 1, max: 12, label: { en: '12-point scale', ru: '12-балльная', ka: '12-ბალიანი', es: 'Escala de 12 puntos', zh: '12 分制' } },
  { id: 'twenty', min: 0, max: 20, label: { en: '20-point scale', ru: '20-балльная', ka: '20-ბალიანი', es: 'Escala de 20 puntos', zh: '20 分制' } },
  { id: 'hundred', min: 0, max: 100, label: { en: '100-point scale', ru: '100-балльная', ka: '100-ბალიანი', es: 'Escala de 100 puntos', zh: '百分制' } },
  { id: 'gpa4', min: 0, max: 4, label: { en: 'GPA (0-4.0)', ru: 'GPA (0–4,0)', ka: 'GPA (0–4.0)', es: 'GPA (0-4,0)', zh: 'GPA（0–4.0）' } },
  { id: 'percent', min: 0, max: 100, label: { en: 'Percent (0-100%)', ru: 'Проценты (0–100 %)', ka: 'პროცენტი (0–100%)', es: 'Porcentaje (0-100 %)', zh: '百分比（0–100%）' } },
  { id: 'ib', min: 1, max: 7, label: { en: 'IB (1-7 per subject)', ru: 'IB (1–7 по предмету)', ka: 'IB (1–7 საგნის მიხედვით)', es: 'IB (1-7 por asignatura)', zh: 'IB（每科 1–7）' } },
  { id: 'german', min: 1, max: 6, reverse: true, label: { en: 'German scale 1-6 (1 is best)', ru: 'Немецкая 1–6 (1 — лучшая)', ka: 'გერმანული 1–6 (1 საუკეთესოა)', es: 'Escala alemana 1-6 (1 es la mejor)', zh: '德国 1–6 分制（1 分最高）' } },
];

// ------------------------------------------------------------------ national and international exams
export interface Exam {
  id: string;
  min: number;
  max: number;
  /** true when a LOWER number is better (Abitur) */
  reverse?: boolean;
  label: Label;
}
export const EXAMS: Exam[] = [
  { id: 'ege', min: 0, max: 100, label: { en: 'EGE (Russia)', ru: 'ЕГЭ (Россия)' } },
  { id: 'oge', min: 2, max: 5, label: { en: 'OGE (Russia)', ru: 'ОГЭ (Россия)' } },
  { id: 'ent', min: 0, max: 140, label: { en: 'ENT (Kazakhstan)', ru: 'ЕНТ (Казахстан)' } },
  { id: 'ct_by', min: 0, max: 100, label: { en: 'CE / CT (Belarus)', ru: 'ЦЭ / ЦТ (Беларусь)' } },
  { id: 'nmt', min: 100, max: 200, label: { en: 'NMT (Ukraine)', ru: 'НМТ (Украина)' } },
  { id: 'ge_unified', min: 0, max: 100, label: { en: 'Unified National Exams (Georgia)', ru: 'Единые национальные экзамены (Грузия)', ka: 'ერთიანი ეროვნული გამოცდები' } },
  { id: 'ort', min: 0, max: 245, label: { en: 'ORT (Kyrgyzstan)', ru: 'ОРТ (Кыргызстан)' } },
  { id: 'gaokao', min: 0, max: 750, label: { en: 'Gaokao (China)', ru: 'Гаокао (Китай)', zh: '高考（中国）' } },
  { id: 'csat', min: 0, max: 100, label: { en: 'CSAT (South Korea), percentile', ru: 'CSAT (Южная Корея), процентиль' } },
  { id: 'jee', min: 0, max: 100, label: { en: 'JEE Main (India), percentile', ru: 'JEE Main (Индия), процентиль' } },
  { id: 'neet', min: 0, max: 720, label: { en: 'NEET (India)', ru: 'NEET (Индия)' } },
  { id: 'abitur', min: 1, max: 4, reverse: true, label: { en: 'Abitur (average mark 1.0-4.0)', ru: 'Abitur (средний балл 1,0–4,0)' } },
  { id: 'bac', min: 0, max: 20, label: { en: 'Baccalauréat (France, 0-20)', ru: 'Baccalauréat (Франция, 0–20)' } },
  { id: 'matura', min: 0, max: 100, label: { en: 'Matura (%)', ru: 'Matura (%)' } },
  { id: 'alevel', min: 0, max: 168, label: { en: 'A-levels (UCAS points)', ru: 'A-levels (баллы UCAS)' } },
  { id: 'ib_diploma', min: 0, max: 45, label: { en: 'IB Diploma (total points)', ru: 'IB Diploma (сумма баллов)' } },
  { id: 'ap', min: 1, max: 5, label: { en: 'AP (per exam)', ru: 'AP (по экзамену)' } },
  { id: 'sat', min: 400, max: 1600, label: { en: 'SAT', ru: 'SAT' } },
  { id: 'act', min: 1, max: 36, label: { en: 'ACT', ru: 'ACT' } },
  { id: 'gre', min: 260, max: 340, label: { en: 'GRE (Verbal + Quantitative)', ru: 'GRE (Verbal + Quantitative)' } },
  { id: 'gmat', min: 205, max: 805, label: { en: 'GMAT', ru: 'GMAT' } },
];

// ------------------------------------------------------------------ language certificates
export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export interface Certificate {
  id: string;
  label: Label;
  /** a numeric score: [lowest score of the band, CEFR level], ascending */
  scoreBands?: { min: number; max: number; bands: [number, Cefr][] };
  /** a level or grade the person names: [value, CEFR level] */
  levels?: [string, Cefr][];
}
const CEFR_LEVELS: [string, Cefr][] = [['A1', 'A1'], ['A2', 'A2'], ['B1', 'B1'], ['B2', 'B2'], ['C1', 'C1'], ['C2', 'C2']];

// The conversions are approximate and only used to compare a person with a programme's requirement.
export const CERTIFICATES: Certificate[] = [
  { id: 'ielts', label: { en: 'IELTS' }, scoreBands: { min: 0, max: 9, bands: [[0, 'A1'], [3, 'A2'], [4, 'B1'], [5.5, 'B2'], [7, 'C1'], [8.5, 'C2']] } },
  { id: 'toefl', label: { en: 'TOEFL iBT' }, scoreBands: { min: 0, max: 120, bands: [[0, 'A1'], [10, 'A2'], [42, 'B1'], [72, 'B2'], [95, 'C1'], [114, 'C2']] } },
  { id: 'det', label: { en: 'Duolingo English Test' }, scoreBands: { min: 10, max: 160, bands: [[10, 'A1'], [45, 'A2'], [80, 'B1'], [105, 'B2'], [125, 'C1'], [150, 'C2']] } },
  { id: 'cambridge', label: { en: 'Cambridge (KET / PET / FCE / CAE / CPE)' }, levels: [['A2', 'A2'], ['B1', 'B1'], ['B2', 'B2'], ['C1', 'C1'], ['C2', 'C2']] },
  { id: 'testdaf', label: { en: 'TestDaF (TDN 3-5)' }, levels: [['3', 'B2'], ['4', 'C1'], ['5', 'C1']] },
  { id: 'goethe', label: { en: 'Goethe-Zertifikat' }, levels: CEFR_LEVELS },
  { id: 'dsh', label: { en: 'DSH (1-3)' }, levels: [['1', 'B2'], ['2', 'C1'], ['3', 'C2']] },
  { id: 'delf_dalf', label: { en: 'DELF / DALF' }, levels: CEFR_LEVELS },
  { id: 'dele', label: { en: 'DELE' }, levels: CEFR_LEVELS },
  { id: 'siele', label: { en: 'SIELE' }, levels: CEFR_LEVELS },
  { id: 'hsk', label: { en: 'HSK (1-6)', zh: 'HSK（1–6 级）' }, levels: [['1', 'A1'], ['2', 'A1'], ['3', 'A2'], ['4', 'B1'], ['5', 'B2'], ['6', 'C1']] },
  { id: 'jlpt', label: { en: 'JLPT (N5-N1)' }, levels: [['N5', 'A1'], ['N4', 'A2'], ['N3', 'B1'], ['N2', 'B2'], ['N1', 'C1']] },
  { id: 'topik', label: { en: 'TOPIK (1-6)' }, levels: [['1', 'A1'], ['2', 'A2'], ['3', 'B1'], ['4', 'B2'], ['5', 'C1'], ['6', 'C2']] },
  { id: 'torfl', label: { en: 'TORFL', ru: 'ТРКИ' }, levels: [['elementary', 'A1'], ['basic', 'A2'], ['1', 'B1'], ['2', 'B2'], ['3', 'C1'], ['4', 'C2']] },
  { id: 'cils_celi', label: { en: 'CILS / CELI' }, levels: CEFR_LEVELS },
];

const CEFR_ORDER: Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const cefrRank = (level: Cefr): number => CEFR_ORDER.indexOf(level);

/** CEFR level of a certificate result (a score or a named level), or null if it does not apply. */
export function cefrOfCertificate(certId: string, value: string | number): Cefr | null {
  const cert = CERTIFICATES.find((c) => c.id === certId);
  if (!cert) return null;
  if (cert.scoreBands) {
    const score = typeof value === 'number' ? value : Number(value);
    const { min, max, bands } = cert.scoreBands;
    if (!Number.isFinite(score) || score < min || score > max) return null;
    return [...bands].reverse().find(([from]) => score >= from)?.[1] ?? null;
  }
  return cert.levels?.find(([v]) => v.toLowerCase() === String(value).toLowerCase())?.[1] ?? null;
}

/** The self-assessment scale of SPEC.md question 12, from "a few phrases" to "native". */
export const SELF_LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'native'] as const;
export type SelfLevel = (typeof SELF_LEVELS)[number];
/** Can the person study in this language? (self-assessment B2 or better, SPEC.md section 11) */
export function canStudyIn(level: SelfLevel): boolean {
  return SELF_LEVELS.indexOf(level) >= SELF_LEVELS.indexOf('b2');
}

// ------------------------------------------------------------------ subjects, school profiles, currencies, languages
export const SUBJECTS: { id: string; label: Label }[] = [
  { id: 'math', label: { en: 'Mathematics', ru: 'Математика', ka: 'მათემატიკა', es: 'Matemáticas', zh: '数学' } },
  { id: 'physics', label: { en: 'Physics', ru: 'Физика', ka: 'ფიზიკა', es: 'Física', zh: '物理' } },
  { id: 'chemistry', label: { en: 'Chemistry', ru: 'Химия', ka: 'ქიმია', es: 'Química', zh: '化学' } },
  { id: 'biology', label: { en: 'Biology', ru: 'Биология', ka: 'ბიოლოგია', es: 'Biología', zh: '生物' } },
  { id: 'informatics', label: { en: 'Computer science', ru: 'Информатика', ka: 'ინფორმატიკა', es: 'Informática', zh: '信息技术' } },
  { id: 'native_language', label: { en: 'Native language', ru: 'Родной язык', ka: 'დედაენა', es: 'Lengua materna', zh: '母语' } },
  { id: 'literature', label: { en: 'Literature', ru: 'Литература', ka: 'ლიტერატურა', es: 'Literatura', zh: '文学' } },
  { id: 'foreign_language', label: { en: 'Foreign language', ru: 'Иностранный язык', ka: 'უცხო ენა', es: 'Lengua extranjera', zh: '外语' } },
  { id: 'history', label: { en: 'History', ru: 'История', ka: 'ისტორია', es: 'Historia', zh: '历史' } },
  { id: 'geography', label: { en: 'Geography', ru: 'География', ka: 'გეოგრაფია', es: 'Geografía', zh: '地理' } },
  { id: 'social_studies', label: { en: 'Social studies', ru: 'Обществознание', ka: 'სამოქალაქო განათლება', es: 'Ciencias sociales', zh: '社会科学' } },
  { id: 'economics', label: { en: 'Economics', ru: 'Экономика', ka: 'ეკონომიკა', es: 'Economía', zh: '经济' } },
  { id: 'law', label: { en: 'Law', ru: 'Право', ka: 'სამართალი', es: 'Derecho', zh: '法律' } },
  { id: 'art', label: { en: 'Art', ru: 'Искусство', ka: 'ხელოვნება', es: 'Arte', zh: '美术' } },
  { id: 'music', label: { en: 'Music', ru: 'Музыка', ka: 'მუსიკა', es: 'Música', zh: '音乐' } },
  { id: 'pe', label: { en: 'Physical education', ru: 'Физкультура', ka: 'ფიზკულტურა', es: 'Educación física', zh: '体育' } },
  { id: 'technology', label: { en: 'Technology / engineering', ru: 'Технология / инженерия', ka: 'ტექნოლოგია / ინჟინერია', es: 'Tecnología / ingeniería', zh: '技术 / 工程' } },
  { id: 'philosophy', label: { en: 'Philosophy', ru: 'Философия', ka: 'ფილოსოფია', es: 'Filosofía', zh: '哲学' } },
];

export const SCHOOL_PROFILES: { id: string; label: Label }[] = [
  { id: 'physmath', label: { en: 'Physics and mathematics', ru: 'Физико-математический', ka: 'ფიზიკა-მათემატიკური', es: 'Física y matemáticas', zh: '理科（数理）' } },
  { id: 'chembio', label: { en: 'Chemistry and biology', ru: 'Химико-биологический', ka: 'ქიმია-ბიოლოგიური', es: 'Química y biología', zh: '化学生物' } },
  { id: 'humanities', label: { en: 'Humanities', ru: 'Гуманитарный', ka: 'ჰუმანიტარული', es: 'Humanidades', zh: '人文' } },
  { id: 'socioeconomic', label: { en: 'Social studies and economics', ru: 'Социально-экономический', ka: 'სოციალურ-ეკონომიკური', es: 'Ciencias sociales y economía', zh: '社会经济' } },
  { id: 'linguistic', label: { en: 'Languages', ru: 'Лингвистический', ka: 'ლინგვისტური', es: 'Lenguas', zh: '语言' } },
  { id: 'arts', label: { en: 'Arts', ru: 'Художественный', ka: 'ხელოვნების', es: 'Artes', zh: '艺术' } },
  { id: 'ib', label: { en: 'IB Diploma', ru: 'IB', ka: 'IB', es: 'Bachillerato Internacional', zh: 'IB 课程' } },
  { id: 'alevel', label: { en: 'A-levels', ru: 'A-levels', ka: 'A-levels', es: 'A-levels', zh: 'A-level 课程' } },
  { id: 'general', label: { en: 'General', ru: 'Общеобразовательный', ka: 'ზოგადსაგანმანათლებლო', es: 'General', zh: '普通' } },
  { id: 'other', label: { en: 'Other', ru: 'Другое', ka: 'სხვა', es: 'Otro', zh: '其他' } },
];

export const CURRENCIES = [
  'GEL', 'KZT', 'UZS', 'AMD', 'AZN', 'RUB', 'KGS', 'TJS', 'TMT', 'BYN', 'MDL', 'UAH',
  'CNY', 'KRW', 'INR', 'JPY', 'TRY', 'USD', 'EUR', 'GBP', 'CHF', 'PLN', 'CZK',
] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

/** ISO 639-1 codes: the full list of two-letter language codes. */
export const LANGUAGE_CODES = (
  'aa ab ae af ak am an ar as av ay az ba be bg bh bi bm bn bo br bs ca ce ch co cr cs cu cv cy da de dv dz ee el en eo es et eu fa ff fi fj fo fr fy ga gd gl gn gu gv ha he hi ho hr ht hu hy hz ia id ie ig ii ik io is it iu ja jv ka kg ki kj kk kl km kn ko kr ks ku kv kw ky la lb lg li ln lo lt lu lv mg mh mi mk ml mn mr ms mt my na nb nd ne ng nl nn no nr nv ny oc oj om or os pa pi pl ps pt qu rm rn ro ru rw sa sc sd se sg si sk sl sm sn so sq sr ss st su sv sw ta te tg th ti tk tl tn to tr ts tt tw ty ug uk ur uz ve vi vo wa wo xh yi yo za zh zu'
).split(' ');

/** Languages most people ask for, shown first in the pickers. */
export const COMMON_LANGUAGES = ['en', 'ru', 'ka', 'es', 'zh', 'de', 'fr', 'tr', 'ar', 'kk', 'uz', 'hy', 'az', 'uk', 'pl', 'it', 'ja', 'ko'];

export const OLYMPIAD_LEVELS = ['school', 'regional', 'national', 'international'] as const;
