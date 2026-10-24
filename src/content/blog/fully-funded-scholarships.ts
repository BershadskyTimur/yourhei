import type { Article } from '@/lib/blog/types';

export const fullyFundedScholarships: Article = {
  slug: 'fully-funded-scholarships-for-international-students',
  published: '2026-10-24',
  updated: '2026-10-24',
  ru: {
    title: 'Стипендии с полным финансированием для иностранцев',
    description: 'Государственные и международные программы с полным финансированием: на какой уровень, кто платит и как подаётся заявка. Ссылки на официальные страницы.',
    blocks: [
      { t: 'p', text: '«Полное финансирование» — самая желанная формула в поиске стипендий и самая коварная: условия, список стран и сроки меняются каждый год. Поэтому мы показываем программу, организатора и официальную ссылку, а точные суммы и окна подачи вы смотрите на официальной странице.' },
      { t: 'h2', id: 'meaning', text: 'Что значит «полное финансирование»' },
      { t: 'p', text: 'Мы отмечаем программу как полную, если организатор описывает её как покрывающую обучение и содержание. Состав у программ разный: в одних случаях это обучение, проживание и ежемесячная выплата, в других — ещё и ежегодный перелёт, учебники и страховка. Конкретный состав указан в описании каждой программы и на официальной странице.' },
      { t: 'h2', id: 'bachelor', text: 'Бакалавриат' },
      { t: 'scholarships', covers: 'full', level: 'bachelor' },
      { t: 'h2', id: 'master', text: 'Магистратура' },
      { t: 'scholarships', covers: 'full', level: 'master' },
      { t: 'h2', id: 'phd', text: 'Докторантура' },
      { t: 'scholarships', covers: 'full', level: 'phd' },
      { t: 'h2', id: 'apply', text: 'Как подаётся заявка' },
      {
        t: 'ul',
        items: [
          '**Через национальное агентство вашей страны:** Stipendium Hungaricum.',
          '**Через посольство или университет:** Global Korea Scholarship (GKS) и стипендия MEXT (Япония).',
          '**Через комиссию Фулбрайта или посольство США:** программа Fulbright.',
          '**На официальном портале:** государственная стипендия России (квота) и Chinese Government Scholarship (CSC).',
          '**На сайте самой программы:** Erasmus Mundus Joint Masters.',
        ],
      },
      { t: 'h2', id: 'conditions', text: 'Что учесть заранее' },
      {
        t: 'ul',
        items: [
          '**Нужен опыт.** Chevening требует опыта работы; Swedish Institute — опыта работы и лидерских качеств.',
          '**Часть программ только для магистров и докторантов.** Fulbright и Australia Awards рассчитаны на послевузовское обучение.',
          '**Не все программы открыты всем странам.** Кому доступна программа, зависит от гражданства: см. статью [Стипендии по гражданству](/blog/scholarships-by-citizenship-caucasus-central-asia) и фильтр на [странице стипендий](/scholarships).',
        ],
      },
      { t: 'p', text: 'Мы перечисляем программы и отправляем вас на официальную страницу; мы не гарантируем, что вы получите стипендию.' },
      { t: 'cta', href: '/scholarships', text: 'Проверить стипендии по своему гражданству' },
    ],
  },
  en: {
    title: 'Fully funded scholarships for international students',
    description: 'Government and international programmes with full funding: the level, who pays and how to apply. Links to the official pages.',
    blocks: [
      { t: 'p', text: '“Fully funded” is the most wanted phrase in a scholarship search and the most treacherous one: the conditions, the list of countries and the deadlines change every year. So we show the programme, who runs it and the official link, and you read the exact amounts and application windows on the official page.' },
      { t: 'h2', id: 'meaning', text: 'What “fully funded” means here' },
      { t: 'p', text: 'We mark a programme as full when its organiser describes it as covering tuition and living costs. What exactly is covered differs: in some cases tuition, accommodation and a monthly allowance, in others also a yearly flight, textbooks and insurance. The exact list is in the description of each programme and on the official page.' },
      { t: 'h2', id: 'bachelor', text: 'Bachelor’s' },
      { t: 'scholarships', covers: 'full', level: 'bachelor' },
      { t: 'h2', id: 'master', text: 'Master’s' },
      { t: 'scholarships', covers: 'full', level: 'master' },
      { t: 'h2', id: 'phd', text: 'Doctoral studies' },
      { t: 'scholarships', covers: 'full', level: 'phd' },
      { t: 'h2', id: 'apply', text: 'How to apply' },
      {
        t: 'ul',
        items: [
          '**Through the national agency of your country:** Stipendium Hungaricum.',
          '**Through an embassy or a university:** the Global Korea Scholarship (GKS) and the MEXT scholarship (Japan).',
          '**Through the Fulbright commission or the US embassy:** the Fulbright programme.',
          '**On the official portal:** the Russian Government Scholarship (quota) and the Chinese Government Scholarship (CSC).',
          '**On the website of the programme itself:** Erasmus Mundus Joint Masters.',
        ],
      },
      { t: 'h2', id: 'conditions', text: 'What to know in advance' },
      {
        t: 'ul',
        items: [
          '**Experience is needed.** Chevening requires work experience; the Swedish Institute requires work experience and leadership.',
          '**Some programmes are for master’s and doctoral students only.** Fulbright and Australia Awards are for postgraduate study.',
          '**Not every programme is open to every country.** Who may apply depends on citizenship: see [Scholarships by citizenship](/blog/scholarships-by-citizenship-caucasus-central-asia) and the filter on the [scholarships page](/scholarships).',
        ],
      },
      { t: 'p', text: 'We list the programmes and send you to the official page; we do not guarantee that you will receive a scholarship.' },
      { t: 'cta', href: '/scholarships', text: 'Check scholarships for your citizenship' },
    ],
  },
};
