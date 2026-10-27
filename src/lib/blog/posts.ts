import { plainText } from './inline';
import type { Article, ArticleBody, Block, BlogLang } from './types';
import { TRANSLATED_LANGS } from './types';
import { TRANSLATIONS } from '@/content/blog/i18n';
import { workDuringStudies } from '@/content/blog/work-during-studies';
import { afterGraduation } from '@/content/blog/after-graduation';
import { proofOfFunds } from '@/content/blog/proof-of-funds';
import { fullyFundedScholarships } from '@/content/blog/fully-funded-scholarships';
import { scholarshipsByCitizenship } from '@/content/blog/scholarships-by-citizenship';
import { chooseCountry } from '@/content/blog/choose-country';
import { freeTuition } from '@/content/blog/free-tuition';
import { germanyApplication } from '@/content/blog/germany-application';
import { finlandApplication } from '@/content/blog/finland-application';
import { czechiaApplication } from '@/content/blog/czechia-application';
import { netherlandsApplication } from '@/content/blog/netherlands-application';
import { turkiyeScholarshipsApply } from '@/content/blog/turkiye-scholarships-apply';
import { daadScholarshipsApply } from '@/content/blog/daad-scholarships-apply';
import { erasmusMundusApply } from '@/content/blog/erasmus-mundus-apply';
import { eiffelApply } from '@/content/blog/eiffel-apply';
import { visegradApply } from '@/content/blog/visegrad-apply';
import { swissExcellenceScholarshipsApply } from '@/content/blog/swiss-excellence-scholarships-apply';
import { cheveningApply } from '@/content/blog/chevening-apply';
import { polandRecognitionNawa } from '@/content/blog/poland-recognition-nawa';
import { stipendiumHungaricumApply } from '@/content/blog/stipendium-hungaricum-apply';

// The list of articles, in the order they were planned. To add an article: write src/content/blog/<name>.ts and add it here.
export const ARTICLES: Article[] = [workDuringStudies, proofOfFunds, afterGraduation, fullyFundedScholarships, scholarshipsByCitizenship, chooseCountry, freeTuition, turkiyeScholarshipsApply, netherlandsApplication, germanyApplication, finlandApplication, czechiaApplication, stipendiumHungaricumApply, daadScholarshipsApply, polandRecognitionNawa, erasmusMundusApply, cheveningApply, swissExcellenceScholarshipsApply, eiffelApply, visegradApply];

/** The language of the text shown for a site language: Russian and English are written by hand, the translated ones have their own text, the rest read English. */
export function blogLang(locale: string): BlogLang {
  if (locale === 'ru') return 'ru';
  return (TRANSLATED_LANGS as readonly string[]).includes(locale) ? (locale as BlogLang) : 'en';
}

/** True when the articles of this language are machine translations of the English text. */
export function isMachineTranslated(locale: string): boolean {
  return (TRANSLATED_LANGS as readonly string[]).includes(locale);
}

/** Articles that may be shown on this day, the newest first. */
export function publishedArticles(today: Date = new Date()): Article[] {
  const day = today.toISOString().slice(0, 10);
  // BLOG_SHOW_ALL=1 (in .env.local, never in production) shows the scheduled articles too, to read them before their day
  const all = process.env.BLOG_SHOW_ALL === '1';
  return ARTICLES.map((a, index) => ({ a, index }))
    .filter(({ a }) => all || a.published <= day)
    // newest first; articles of one day: the one added later to the list comes first
    .sort((x, y) => (x.a.published < y.a.published ? 1 : x.a.published > y.a.published ? -1 : y.index - x.index))
    .map(({ a }) => a);
}

export function getArticle(slug: string, today: Date = new Date()): Article | null {
  return publishedArticles(today).find((a) => a.slug === slug) ?? null;
}

/** The language of the text actually shown: a translation that is not written yet reads English. */
export function articleLang(article: Article, locale: string): BlogLang {
  const lang = blogLang(locale);
  if (lang === 'ru' || lang === 'en') return lang;
  return TRANSLATIONS[lang]?.[article.slug] ? lang : 'en';
}

export function bodyOf(article: Article, locale: string): ArticleBody {
  const lang = blogLang(locale);
  if (lang === 'ru' || lang === 'en') return article[lang];
  return TRANSLATIONS[lang]?.[article.slug] ?? article.en;
}

/** Other articles to read next: the newest ones, never the article itself. */
export function relatedArticles(slug: string, today: Date = new Date(), count = 3): Article[] {
  return publishedArticles(today).filter((a) => a.slug !== slug).slice(0, count);
}

const WORDS_PER_MINUTE = 180;
const DATA_BLOCK_WORDS = 120;

function blockWords(b: Block): number {
  const words = (s: string) => plainText(s).split(/\s+/).filter(Boolean).length;
  switch (b.t) {
    case 'p':
    case 'h2':
    case 'h3':
    case 'note':
      return words(b.text);
    case 'ul':
    case 'ol':
      return b.items.reduce((n, i) => n + words(i), 0);
    case 'cta':
      return 0;
    default:
      return DATA_BLOCK_WORDS;
  }
}

/** Reading time in whole minutes, at least one. */
export function readingMinutes(blocks: Block[]): number {
  return Math.max(1, Math.round(blocks.reduce((n, b) => n + blockWords(b), 0) / WORDS_PER_MINUTE));
}

/** The section titles of an article (for the table of contents). */
export function sectionsOf(blocks: Block[]): { id: string; text: string }[] {
  return blocks.flatMap((b) => (b.t === 'h2' ? [{ id: b.id, text: b.text }] : []));
}
