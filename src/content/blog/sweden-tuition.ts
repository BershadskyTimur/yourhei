import type { Article } from '@/lib/blog/types';

// The figures are calculated from the prices YourHEI holds from universityadmissions.se (data/generated/sweden.json, November 2026):
// 31 institutions, 1 048 programmes for the academic year 2027/2028, 995 of them with a price for students from outside the EU/EEA
// (894 master's, 101 bachelor's). The price is per year (the total fee of the programme divided by its length). Medians and the
// range that holds 80 % of the prices (10th to 90th percentile) are taken over programmes; the medians by field cover the
// programmes whose field (ISCED-F broad field) is known; the median of an institution covers all its priced programmes.
// 974 programmes have the application deadline 15 January 2027.
export const swedenTuition: Article = {
  slug: 'sweden-tuition-fees-international-students',
  published: '2026-11-20',
  updated: '2026-11-20',
  ru: {
    title: 'Сколько стоит обучение в Швеции для иностранцев',
    seoTitle: 'Стоимость обучения в Швеции для иностранцев, 2027/28',
    description: 'Сколько стоит год обучения в Швеции для студентов не из ЕС: типичные цены бакалавриата и магистратуры, цены по направлениям и вузам на 2027/28 по официальным данным.',
    blocks: [
      { t: 'p', text: 'Год магистратуры в Швеции для студента не из ЕС стоит около **147 000 шведских крон**, год бакалавриата — около **150 000 крон**. Это типичные цены (медианы) по 995 программам на 2027/28 учебный год. Для граждан ЕС, ЕЭЗ и Швейцарии обучение бесплатно. Ниже цены по уровням, направлениям и вузам.' },
      { t: 'h2', id: 'levels', text: 'Цены по уровням' },
      {
        t: 'ul',
        items: [
          '**Магистратура:** около 147 000 крон в год. 80 % программ стоят от 97 000 до 192 500 крон (894 программы).',
          '**Бакалавриат:** около 150 000 крон в год. 80 % программ стоят от 97 000 до 290 000 крон (101 программа).',
          'Программ на английском в Швеции гораздо больше в магистратуре: в нашей базе их почти в девять раз больше, чем бакалаврских.',
        ],
      },
      { t: 'h2', id: 'fields', text: 'Цены по направлениям (магистратура)' },
      { t: 'p', text: 'Типичная цена года, от меньшей к большей:' },
      {
        t: 'ul',
        items: [
          '**Социальные науки:** около 117 000 крон (81 программа)',
          '**Бизнес, управление и право:** около 120 000 крон (105 программ)',
          '**Искусство и гуманитарные науки:** около 135 000 крон (100 программ)',
          '**Информационные технологии:** около 152 300 крон (61 программа)',
          '**Естественные науки и математика:** около 157 000 крон (182 программы)',
          '**Здравоохранение:** около 165 500 крон (22 программы)',
          '**Инженерное дело:** около 180 000 крон (98 программ)',
        ],
      },
      { t: 'p', text: 'Дороже всего творческие программы с индивидуальными занятиями: опера и кино в Гётеборгском университете стоят 634 000 крон в год. Самые дешёвые программы в базе — от 50 000 до 80 000 крон в год.' },
      { t: 'h2', id: 'universities', text: 'Цены в крупных вузах' },
      { t: 'p', text: 'Типичная цена года по всем программам вуза с известной ценой:' },
      {
        t: 'ul',
        items: [
          '[Университет Даларны](/institutions/se/dalarna-university): около 96 000 крон (19 программ)',
          '[Университет Мальмё](/institutions/se/malmo-university): около 110 000 крон (30 программ)',
          '[Стокгольмский университет](/institutions/se/stockholm-university): около 115 000 крон (91 программа)',
          '[Гётеборгский университет](/institutions/se/university-of-gothenburg): около 147 000 крон (83 программы)',
          '[Уппсальский университет](/institutions/se/uppsala-university): около 150 000 крон (110 программ)',
          '[Университет Умео](/institutions/se/umea-university): около 152 300 крон (48 программ)',
          '[Лундский университет](/institutions/se/lund-university): около 160 000 крон (125 программ)',
          '[Линчёпингский университет](/institutions/se/linkoping-university): около 166 000 крон (31 программа)',
          '[Каролинский институт](/institutions/se/karolinska-institutet): около 180 000 крон (12 программ)',
          '[Чалмерский технологический институт](/institutions/se/chalmers-university-of-technology): около 190 000 крон (39 программ)',
          '[Королевский технологический институт (KTH)](/institutions/se/royal-institute-of-technology): около 192 500 крон (57 программ)',
        ],
      },
      { t: 'cta', href: '/institutions/se', text: 'Все вузы Швеции' },
      { t: 'cta', href: '/study/se', text: 'Учёба в Швеции: направления' },
      { t: 'h2', id: 'how', text: 'Как мы считали' },
      {
        t: 'ul',
        items: [
          '**Источник** — universityadmissions.se, официальный портал приёма в вузы Швеции. В базе 31 вуз и 1 048 программ на 2027/28 учебный год; цена для студентов не из ЕС указана у 995 из них.',
          '**Цена за год.** Портал указывает цену за всю программу; мы делим её на длительность в годах. Магистратура в Швеции длится один или два года, бакалавриат три.',
          '**Медиана** — цена посередине: половина программ дешевле, половина дороже.',
          '**Только обучение.** Жильё, питание и страховка в цену не входят.',
        ],
      },
      { t: 'h2', id: 'deadline', text: 'Когда подавать' },
      { t: 'p', text: 'Почти у всех программ на осень 2027 года срок подачи один: **15 января 2027 г.** (974 программы в нашей базе). Заявка подаётся через universityadmissions.se. Сроки по вузам и программам: [сроки подачи в Швеции](/deadlines/se).' },
      { t: 'note', text: 'Для вида на жительство нужно показать деньги на жизнь. Суммы по странам: [сколько денег нужно показать для студенческой визы](/blog/proof-of-funds-student-visa).' },
      { t: 'h2', id: 'cheaper', text: 'Если дорого' },
      { t: 'p', text: 'Сравните со странами, где учёба бесплатна или почти бесплатна: [Германия, Чехия, Финляндия](/blog/free-tuition-germany-czechia-finland). Цены в других странах: [сколько стоит учиться за границей](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country). Стипендии, которые покрывают всё: [полные стипендии для иностранных студентов](/blog/fully-funded-scholarships-for-international-students).' },
      { t: 'h2', id: 'sources', text: 'Источники' },
      { t: 'p', text: 'Цены и сроки: [universityadmissions.se](https://www.universityadmissions.se/intl/start), Шведский совет по высшему образованию (UHR), набор на 2027/28 учебный год. Проверено 13 ноября 2026 г. Перед подачей сверяйте цену на странице программы.' },
    ],
  },
  en: {
    title: 'Tuition fees in Sweden for international students',
    seoTitle: 'Tuition fees in Sweden for international students, 2027/28',
    description: 'What a year of study in Sweden costs for students from outside the EU: typical bachelor\'s and master\'s fees, fees by field and university for 2027/28, official data.',
    blocks: [
      { t: 'p', text: 'A year of a master\'s programme in Sweden costs a student from outside the EU about **SEK 147,000**, a year of a bachelor\'s about **SEK 150,000**. These are typical prices (medians) over 995 programmes for the academic year 2027/28. For citizens of the EU, the EEA and Switzerland tuition is free. Below are the prices by level, field and university.' },
      { t: 'h2', id: 'levels', text: 'Prices by level' },
      {
        t: 'ul',
        items: [
          '**Master\'s:** about SEK 147,000 a year. 80% of programmes cost between SEK 97,000 and SEK 192,500 (894 programmes).',
          '**Bachelor\'s:** about SEK 150,000 a year. 80% of programmes cost between SEK 97,000 and SEK 290,000 (101 programmes).',
          'Sweden has far more programmes in English at master\'s level: our database holds almost nine times as many as bachelor\'s ones.',
        ],
      },
      { t: 'h2', id: 'fields', text: 'Prices by field (master\'s)' },
      { t: 'p', text: 'The typical price of a year, lowest first:' },
      {
        t: 'ul',
        items: [
          '**Social sciences:** about SEK 117,000 (81 programmes)',
          '**Business, administration and law:** about SEK 120,000 (105 programmes)',
          '**Arts and humanities:** about SEK 135,000 (100 programmes)',
          '**Information technology:** about SEK 152,300 (61 programmes)',
          '**Natural sciences and mathematics:** about SEK 157,000 (182 programmes)',
          '**Health:** about SEK 165,500 (22 programmes)',
          '**Engineering:** about SEK 180,000 (98 programmes)',
        ],
      },
      { t: 'p', text: 'The most expensive are artistic programmes with individual tuition: opera and film at the University of Gothenburg cost SEK 634,000 a year. The cheapest programmes in the database cost between SEK 50,000 and SEK 80,000 a year.' },
      { t: 'h2', id: 'universities', text: 'Prices at the large universities' },
      { t: 'p', text: 'The typical price of a year over all programmes of the university with a known price:' },
      {
        t: 'ul',
        items: [
          '[Dalarna University](/institutions/se/dalarna-university): about SEK 96,000 (19 programmes)',
          '[Malmö University](/institutions/se/malmo-university): about SEK 110,000 (30 programmes)',
          '[Stockholm University](/institutions/se/stockholm-university): about SEK 115,000 (91 programmes)',
          '[University of Gothenburg](/institutions/se/university-of-gothenburg): about SEK 147,000 (83 programmes)',
          '[Uppsala University](/institutions/se/uppsala-university): about SEK 150,000 (110 programmes)',
          '[Umeå University](/institutions/se/umea-university): about SEK 152,300 (48 programmes)',
          '[Lund University](/institutions/se/lund-university): about SEK 160,000 (125 programmes)',
          '[Linköping University](/institutions/se/linkoping-university): about SEK 166,000 (31 programmes)',
          '[Karolinska Institutet](/institutions/se/karolinska-institutet): about SEK 180,000 (12 programmes)',
          '[Chalmers University of Technology](/institutions/se/chalmers-university-of-technology): about SEK 190,000 (39 programmes)',
          '[KTH Royal Institute of Technology](/institutions/se/royal-institute-of-technology): about SEK 192,500 (57 programmes)',
        ],
      },
      { t: 'cta', href: '/institutions/se', text: 'All institutions in Sweden' },
      { t: 'cta', href: '/study/se', text: 'Study in Sweden: fields' },
      { t: 'h2', id: 'how', text: 'How we counted' },
      {
        t: 'ul',
        items: [
          '**The source** is universityadmissions.se, the official admissions portal of Swedish higher education. The database holds 31 institutions and 1,048 programmes for the academic year 2027/28; 995 of them state a price for students from outside the EU.',
          '**Price per year.** The portal states the price of the whole programme; we divide it by the length in years. A master\'s in Sweden takes one or two years, a bachelor\'s three.',
          '**The median** is the price in the middle: half of the programmes cost less, half cost more.',
          '**Tuition only.** Housing, food and insurance are not included.',
        ],
      },
      { t: 'h2', id: 'deadline', text: 'When to apply' },
      { t: 'p', text: 'Almost all programmes starting in autumn 2027 share one deadline: **15 January 2027** (974 programmes in our database). You apply through universityadmissions.se. Deadlines by university and programme: [application deadlines in Sweden](/deadlines/se).' },
      { t: 'note', text: 'For the residence permit you must show money for living costs. Sums by country: [how much money to show for a student visa](/blog/proof-of-funds-student-visa).' },
      { t: 'h2', id: 'cheaper', text: 'If it is too expensive' },
      { t: 'p', text: 'Compare with countries where tuition is free or nearly free: [Germany, Czechia, Finland](/blog/free-tuition-germany-czechia-finland). Prices in other countries: [how much it costs to study abroad](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country). Scholarships that cover everything: [fully funded scholarships for international students](/blog/fully-funded-scholarships-for-international-students).' },
      { t: 'h2', id: 'sources', text: 'Sources' },
      { t: 'p', text: 'Prices and deadlines: [universityadmissions.se](https://www.universityadmissions.se/intl/start), Swedish Council for Higher Education (UHR), admission for the academic year 2027/28. Checked on 13 November 2026. Before you apply, check the price on the programme page.' },
    ],
  },
};
