import type { Article } from '@/lib/blog/types';

export const netherlandsApplication: Article = {
  slug: 'netherlands-application-deadlines-studielink',
  published: '2026-11-23',
  updated: '2026-11-23',
  ru: {
    title: 'Поступление в Нидерланды: Studielink и сроки подачи',
    description: 'Как подать заявку в нидерландский вуз через Studielink: общие сроки 1 мая и 15 января, чем они отличаются для программ, и что проверить у самого вуза.',
    blocks: [
      { t: 'p', text: 'В Нидерландах заявки на большинство программ подаются через единый официальный портал Studielink. Сроки при этом бывают разные, и именно с ними чаще всего возникают недоразумения. Ниже — то, что сказано на официальных страницах Studielink и Study in NL (проверено 24 октября 2026 года).' },
      { t: 'h2', id: 'studielink', text: 'Что такое Studielink' },
      {
        t: 'ul',
        items: [
          '**Studielink** — официальный портал регистрации и подачи заявок на программы нидерландских вузов. Для большинства программ вы сначала регистрируетесь там.',
          '**С чего начать.** Найдите программу в поиске Study in NL (Studyfinder), затем откройте страницу программы на сайте вуза: там описан порядок подачи.',
          '**Оговорка.** Study in NL предупреждает: некоторые вузы используют другой способ регистрации студентов из-за рубежа. Уточните это у вуза до подачи.',
        ],
      },
      { t: 'h2', id: 'deadlines', text: 'Общие сроки' },
      {
        t: 'ul',
        items: [
          '**15 января, 23:59 (по центральноевропейскому времени)** — для программ с ограниченным набором (numerus fixus).',
          '**1 мая, 23:59** — для остальных программ бакалавриата. Studielink называет это единым национальным сроком для программ бакалавриата без numerus fixus.',
          '**Магистратура.** Страница Studielink описывает только бакалавриат, поэтому сроки магистерских программ задаёт сам вуз и программа: смотрите их на странице программы.',
        ],
      },
      { t: 'h2', id: 'late', text: 'Что будет, если опоздать' },
      { t: 'p', text: 'Право на приём при выполнении требований гарантировано, если вы подали заявку до 1 мая. После этой даты вуз вправе отказать в зачислении, но только если это прямо предусмотрено в его правилах обучения и экзаменов. Если для вашей программы обязателен выбор-проверка (study choice check) и вы пропустили её без уважительной причины, вы теряете право на приём.' },
      { t: 'p', text: 'Study in NL подчёркивает: это общие сроки, а точную дату нужно проверять у выбранного вуза, потому что она может отличаться для вуза и для программы.' },
      { t: 'h2', id: 'plan', text: 'Как спланировать подачу' },
      {
        t: 'ol',
        items: [
          'Выберите 2–3 программы и откройте каждую на сайте вуза: проверьте срок и способ подачи.',
          'Соберите документы заранее: паспорт, диплом, оценки, переводы. В [чек-листе](/checklist) их можно отмечать.',
          'Проверьте, нужно ли подтверждать средства на жизнь для визы: суммы по странам собраны в статье [Сколько денег нужно показать для студенческой визы](/blog/proof-of-funds-student-visa).',
          'Сверьтесь с [календарём сроков подачи](/deadlines/nl): там даты по программам нидерландских вузов с пометкой, для кого срок (студенты из-за пределов ЕС или из ЕС).',
          'Если нужна стипендия, посмотрите программу NL Scholarship на [странице стипендий](/scholarships): условия и список вузов — на официальной странице.',
        ],
      },
      {
        t: 'p',
        text: 'Источники: [Studielink, сроки подачи](https://info.studielink.nl/en/how-to-use-studielink/make-sure-you-are-on-time); [Study in NL, как подать заявку](https://www.studyinnl.org/plan-your-stay/how-to-apply).',
      },
      { t: 'cta', href: '/deadlines/nl', text: 'Сроки подачи в Нидерландах' },
      { t: 'cta', href: '/catalog', text: 'Найти программы' },
    ],
  },
  en: {
    title: 'Applying to the Netherlands: Studielink and the deadlines',
    description: 'How to apply to a Dutch university through Studielink: the general 1 May and 15 January deadlines, how they differ by programme, and what to check with the university.',
    blocks: [
      { t: 'p', text: 'In the Netherlands, applications to most programmes go through one official portal, Studielink. The deadlines differ, and they are where misunderstandings happen most often. Below is what the official Studielink and Study in NL pages say (checked on 24 October 2026).' },
      { t: 'h2', id: 'studielink', text: 'What Studielink is' },
      {
        t: 'ul',
        items: [
          '**Studielink** is the official registration and application portal for programmes at Dutch higher education institutions. For most programmes you register there first.',
          '**Where to start.** Find a programme in the Study in NL Studyfinder, then open the programme page on the institution’s website: it describes how to apply.',
          '**A caution.** Study in NL warns that some institutions use a different method to register students from abroad. Check with the institution before you apply.',
        ],
      },
      { t: 'h2', id: 'deadlines', text: 'The general deadlines' },
      {
        t: 'ul',
        items: [
          '**15 January, 23:59 (CET)** for programmes with a limited intake (numerus fixus).',
          '**1 May, 23:59** for the other bachelor’s programmes. Studielink calls this the common national deadline for bachelor’s programmes without numerus fixus.',
          '**Master’s.** The Studielink page describes bachelor’s programmes only, so the deadlines of master’s programmes are set by the institution and the programme: look at the programme page.',
        ],
      },
      { t: 'h2', id: 'late', text: 'What happens if you are late' },
      { t: 'p', text: 'You have the right to be admitted if you meet the admission requirements and apply by 1 May. After that date the institution may refuse to enrol you, but only if its Teaching and Examination Regulations clearly provide for it. If a study choice check applies to your programme and you skip it without a valid reason, you lose your right to be admitted.' },
      { t: 'p', text: 'Study in NL stresses that these are general deadlines and you should check the exact date with your chosen institution, because it may vary per institution and per programme.' },
      { t: 'h2', id: 'plan', text: 'How to plan your application' },
      {
        t: 'ol',
        items: [
          'Pick 2–3 programmes and open each on the institution’s website: check the deadline and the way to apply.',
          'Collect documents in advance: passport, diploma, grades, translations. You can tick them off in the [checklist](/checklist).',
          'Check whether you must prove funds for the visa: the amounts by country are in [How much money you must show for a student visa](/blog/proof-of-funds-student-visa).',
          'Compare with the [deadline calendar](/deadlines/nl): it has the dates of Dutch programmes, marked for whom the deadline is (students from outside the EU or from the EU).',
          'If you need a scholarship, see the NL Scholarship on the [scholarships page](/scholarships): the conditions and the list of institutions are on the official page.',
        ],
      },
      {
        t: 'p',
        text: 'Sources: [Studielink, make sure you are on time](https://info.studielink.nl/en/how-to-use-studielink/make-sure-you-are-on-time); [Study in NL, how to apply](https://www.studyinnl.org/plan-your-stay/how-to-apply).',
      },
      { t: 'cta', href: '/deadlines/nl', text: 'Application deadlines in the Netherlands' },
      { t: 'cta', href: '/catalog', text: 'Find programmes' },
    ],
  },
};
