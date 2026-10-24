import { plainText } from './inline';
import type { Article, ArticleBody, Block, BlogLang } from './types';
import { workDuringStudies } from '@/content/blog/work-during-studies';
import { afterGraduation } from '@/content/blog/after-graduation';
import { proofOfFunds } from '@/content/blog/proof-of-funds';
import { fullyFundedScholarships } from '@/content/blog/fully-funded-scholarships';
import { scholarshipsByCitizenship } from '@/content/blog/scholarships-by-citizenship';
import { chooseCountry } from '@/content/blog/choose-country';
import { freeTuition } from '@/content/blog/free-tuition';

// The list of articles, in the order they were planned. To add an article: write src/content/blog/<name>.ts and add it here.
export const ARTICLES: Article[] = [workDuringStudies, proofOfFunds, afterGraduation, fullyFundedScholarships, scholarshipsByCitizenship, chooseCountry, freeTuition];

/** The language of the text shown for a site language: Russian and English have their own, the others read the English one. */
export function blogLang(locale: string): BlogLang {
  return locale === 'ru' ? 'ru' : 'en';
}

/** Articles that may be shown on this day, the newest first. */
export function publishedArticles(today: Date = new Date()): Article[] {
  const day = today.toISOString().slice(0, 10);
  // BLOG_SHOW_ALL=1 (in .env.local, never in production) shows the scheduled articles too, to read them before their day
  const all = process.env.BLOG_SHOW_ALL === '1';
  return ARTICLES.filter((a) => all || a.published <= day).sort((a, b) => (a.published < b.published ? 1 : a.published > b.published ? -1 : 0));
}

export function getArticle(slug: string, today: Date = new Date()): Article | null {
  return publishedArticles(today).find((a) => a.slug === slug) ?? null;
}

export function bodyOf(article: Article, locale: string): ArticleBody {
  return article[blogLang(locale)];
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
