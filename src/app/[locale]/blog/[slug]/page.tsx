import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { BlogBody } from '@/components/blog/BlogBody';
import { JsonLd } from '@/components/JsonLd';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { blogLang, bodyOf, getArticle, publishedArticles, readingMinutes, relatedArticles, sectionsOf } from '@/lib/blog/posts';
import { seoMetadata } from '@/lib/seo/metadata';
import { articleLd, breadcrumbList } from '@/lib/seo/structured';

// Articles appear on their publication day: a page is built on the first visit and rebuilt every hour.
export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getArticle(slug);
  if (!hasLocale(routing.locales, locale) || !article) return {};
  const body = bodyOf(article, locale);
  return seoMetadata({ locale, path: `/blog/${slug}`, title: body.title, description: body.description, type: 'article', published: article.published, modified: article.updated });
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const article = getArticle(slug);
  if (!article) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('Blog');
  const body = bodyOf(article, locale);
  const lang = blogLang(locale);
  const published = new Set(publishedArticles().map((a) => a.slug));
  const sections = sectionsOf(body.blocks);
  const related = relatedArticles(slug);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' });
  const day = (iso: string) => date.format(new Date(`${iso}T00:00:00Z`));

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={articleLd({ locale, path: `/blog/${slug}`, title: body.title, description: body.description, published: article.published, modified: article.updated })} />
      <JsonLd data={breadcrumbList(locale, [{ name: 'YourHEI', path: '' }, { name: t('title'), path: '/blog' }, { name: body.title, path: `/blog/${slug}` }])} />

      <p className="text-sm">
        <Link href="/blog" className="font-semibold text-accent-text underline underline-offset-4">← {t('backToList')}</Link>
      </p>
      <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-text sm:text-4xl">{body.title}</h1>
      <p className="mt-4 text-sm text-muted">
        {t('author')}
        <span aria-hidden="true"> · </span>
        <time dateTime={article.published}>{t('published', { date: day(article.published) })}</time>
        {article.updated !== article.published && (
          <>
            <span aria-hidden="true"> · </span>
            <time dateTime={article.updated}>{t('updated', { date: day(article.updated) })}</time>
          </>
        )}
        <span aria-hidden="true"> · </span>
        {t('readMinutes', { count: readingMinutes(body.blocks) })}
      </p>
      {locale !== 'ru' && locale !== 'en' && <p className="mt-4 rounded-lg border border-line bg-accent-soft px-4 py-3 text-sm font-medium text-text">{t('onlyRuEn')}</p>}

      {sections.length >= 3 && (
        <nav aria-label={t('toc')} className="mt-6 rounded-lg border border-line bg-surface p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">{t('toc')}</p>
          <ol className="mt-2 space-y-1 text-base">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} lang={lang} className="underline-offset-4 hover:underline">{s.text}</a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div lang={lang} className="mt-8 space-y-5 text-lg leading-relaxed">
        <BlogBody blocks={body.blocks} lang={lang} published={published} />
      </div>

      <p className="mt-10 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-muted">{t('disclaimer')}</p>

      {related.length > 0 && (
        <section className="mt-12" aria-labelledby="related-title">
          <h2 id="related-title" className="text-xl font-semibold text-text">{t('related')}</h2>
          <ul className="mt-3 space-y-2">
            {related.map((a) => (
              <li key={a.slug}>
                <Link href={`/blog/${a.slug}`} className="font-semibold text-accent-text underline underline-offset-4">{bodyOf(a, locale).title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
