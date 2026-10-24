import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { bodyOf, publishedArticles, readingMinutes } from '@/lib/blog/posts';
import { seoMetadata, trimDescription } from '@/lib/seo/metadata';
import { breadcrumbList } from '@/lib/seo/structured';

// Articles appear on their publication day, so the list is rebuilt every hour.
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Blog' });
  return seoMetadata({ locale, path: '/blog', title: t('seoTitle'), description: trimDescription(t('intro')), feed: '/blog/feed.xml' });
}

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('Blog');
  const articles = publishedArticles();
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={breadcrumbList(locale, [{ name: 'YourHEI', path: '' }, { name: t('title'), path: '/blog' }])} />
      <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">{t('title')}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{t('intro')}</p>
      {locale !== 'ru' && locale !== 'en' && <p className="mt-4 rounded-lg border border-line bg-accent-soft px-4 py-3 text-sm font-medium text-text">{t('onlyRuEn')}</p>}

      {articles.length === 0 ? (
        <p className="mt-8 rounded-lg border border-line bg-surface p-5">{t('empty')}</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {articles.map((a) => {
            const body = bodyOf(a, locale);
            return (
              <li key={a.slug}>
                <article className="rounded-lg border border-line bg-surface p-5 transition-colors hover:bg-surface-strong sm:p-6">
                  <p className="text-sm text-muted">
                    <time dateTime={a.published}>{date.format(new Date(`${a.published}T00:00:00Z`))}</time>
                    <span aria-hidden="true"> · </span>
                    {t('readMinutes', { count: readingMinutes(body.blocks) })}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold leading-snug text-text sm:text-2xl">
                    <Link href={`/blog/${a.slug}`} className="underline-offset-4 hover:underline">{body.title}</Link>
                  </h2>
                  <p className="mt-2 text-base">{body.description}</p>
                  <p className="mt-3">
                    <Link href={`/blog/${a.slug}`} className="font-semibold text-accent-text underline underline-offset-4" aria-label={`${t('readArticle')}: ${body.title}`}>{t('readArticle')}</Link>
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-8 text-sm text-muted">
        <a href={`/${locale}/blog/feed.xml`} className="underline underline-offset-4 hover:text-text">{t('rss')}</a>
      </p>
    </div>
  );
}
