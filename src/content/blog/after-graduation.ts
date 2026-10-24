import type { Article } from '@/lib/blog/types';

export const afterGraduation: Article = {
  slug: 'after-graduation-work-permits-by-country',
  published: '2026-11-02',
  updated: '2026-11-02',
  ru: {
    title: 'Что делать после диплома: разрешение на поиск работы в 6 странах',
    description: 'Сколько времени дают выпускнику Германия, Великобритания, Нидерланды, Финляндия, Чехия и Польша, чтобы остаться и найти работу: сроки и условия подачи.',
    blocks: [
      { t: 'p', text: 'Диплом получен — что дальше? Во многих странах для выпускников есть отдельный путь: особое разрешение на пребывание, чтобы найти работу или открыть своё дело. Разберём шесть стран из нашего справочника.' },
      { t: 'h2', id: 'terms', text: 'Сроки в одном списке' },
      {
        t: 'ul',
        items: [
          '**До 9 месяцев:** Чехия, Польша (в Польше разрешение выдают один раз).',
          '**До 1 года:** Нидерланды.',
          '**До 18 месяцев:** Германия (разрешение нельзя продлить).',
          '**До 2 лет:** Великобритания (маршрут Graduate; для выпускников докторантуры — 3 года) и Финляндия.',
        ],
      },
      { t: 'h2', id: 'deadlines', text: 'Когда подавать заявление' },
      { t: 'p', text: 'Срок подачи часто важнее срока самого разрешения: у каждой страны своё окно.' },
      {
        t: 'ul',
        items: [
          '**Германия:** до окончания срока вашего учебного разрешения.',
          '**Чехия:** до истечения вашего текущего разрешения.',
          '**Польша:** сразу после выпуска, пока вы находитесь в Польше по учёбе.',
          '**Нидерланды:** в течение трёх лет после выпуска в Нидерландах; для зарубежных дипломов условия другие.',
          '**Финляндия:** в течение пяти лет после окончания срока учебного разрешения.',
          '**Великобритания:** сроки подачи смотрите на официальной странице.',
        ],
      },
      { t: 'h2', id: 'countries', text: 'Подробности по странам' },
      { t: 'rules', topic: 'after' },
      { t: 'h2', id: 'watch', text: 'На что обратить внимание' },
      {
        t: 'ul',
        items: [
          '**Работать можно.** В Германии в этот период разрешена любая работа, в Нидерландах и Финляндии — без ограничений, в Великобритании разрешение не привязано к работодателю, в Польше выпускники очной формы работают без разрешения на работу.',
          '**Нужны документы.** Например, в Германии потребуются подтверждение окончания учёбы, медицинская страховка и подтверждение того, что денег на жизнь хватит.',
          '**Турции в этом разделе пока нет:** в нашем справочнике для неё этих сведений нет, смотрите официальные страницы.',
        ],
      },
      { t: 'p', text: 'Правила работы во время самой учёбы мы разобрали в статье [Работа во время учёбы за границей: правила 7 стран](/blog/work-during-studies-rules-by-country).' },
      { t: 'cta', href: '/countries', text: 'Справочники по странам' },
    ],
  },
  en: {
    title: 'After graduation: job-search permits in 6 countries',
    description: 'How long Germany, the UK, the Netherlands, Finland, Czechia and Poland let a graduate stay to find a job: durations and application windows.',
    blocks: [
      { t: 'p', text: 'You have your degree — what next? Many countries have a separate path for graduates: a special residence permit to look for a job or start a business. Here are six countries from our country guides.' },
      { t: 'h2', id: 'terms', text: 'The durations at a glance' },
      {
        t: 'ul',
        items: [
          '**Up to 9 months:** Czechia and Poland (in Poland it is granted once).',
          '**Up to 1 year:** the Netherlands.',
          '**Up to 18 months:** Germany (the permit cannot be renewed).',
          '**Up to 2 years:** the UK (the Graduate route; 3 years for PhD graduates) and Finland.',
        ],
      },
      { t: 'h2', id: 'deadlines', text: 'When to apply' },
      { t: 'p', text: 'The application window often matters more than the length of the permit: every country has its own.' },
      {
        t: 'ul',
        items: [
          '**Germany:** before your study permit expires.',
          '**Czechia:** before your current permit expires.',
          '**Poland:** right after graduation, while you are still in Poland for your studies.',
          '**The Netherlands:** within three years after graduating in the Netherlands; for foreign degrees the conditions differ.',
          '**Finland:** within five years after the study permit expired.',
          '**The UK:** check the official page for the application window.',
        ],
      },
      { t: 'h2', id: 'countries', text: 'Details, country by country' },
      { t: 'rules', topic: 'after' },
      { t: 'h2', id: 'watch', text: 'What to keep in mind' },
      {
        t: 'ul',
        items: [
          '**You may work.** In Germany any job is allowed in this period, in the Netherlands and Finland you may work without restrictions, in the UK the permit is not tied to an employer, and in Poland graduates of full-time studies work without a work permit.',
          '**You will need documents.** In Germany, for example, proof of completed studies, health insurance and proof that you have enough money to live.',
          '**Türkiye is not in this section yet:** our guide has no such information for it, so look at the official pages.',
        ],
      },
      { t: 'p', text: 'The rules for working during your studies are in [Working while you study abroad: the rules in 7 countries](/blog/work-during-studies-rules-by-country).' },
      { t: 'cta', href: '/countries', text: 'Country guides' },
    ],
  },
};
