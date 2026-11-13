import type { Article } from '@/lib/blog/types';

// The prices are the ones YourHEI holds from the US College Scorecard (data/generated/scorecard.json, November 2026): the yearly
// published tuition and fees of each institution (the field TUITIONFEE_OUT, which for a private university is one price for
// everybody), academic year 2025/2026. The same figure stands on the page of each institution. The median of the eight is the
// middle between the 4th and the 5th price; the US median (17 500 $ over 3 083 institutions) is the one of the article
// "how-much-does-it-cost-to-study-abroad-tuition-by-country".
export const ivyLeagueTuition: Article = {
  slug: 'harvard-ivy-league-tuition-cost',
  published: '2026-11-13',
  updated: '2026-11-13',
  ru: {
    title: 'Сколько стоит обучение в Гарварде и вузах Лиги плюща',
    seoTitle: 'Стоимость обучения в Гарварде и Лиге плюща, 2025/26',
    description: 'Сколько стоит год обучения в Гарварде, Йеле, Принстоне и других вузах Лиги плюща: опубликованные цены 2025/26 по данным College Scorecard и что в них не входит.',
    blocks: [
      { t: 'p', text: 'Год обучения в Гарварде стоит **61 676 $** (опубликованная цена 2025/26). Это самая низкая цена в Лиге плюща: у остальных семи вузов она от 62 688 $ до 71 845 $ в год. Ниже цены всех восьми вузов, откуда они взяты и что в них не входит.' },
      { t: 'h2', id: 'prices', text: 'Цены восьми вузов' },
      { t: 'p', text: 'Цена за один учебный год, от меньшей к большей:' },
      {
        t: 'ol',
        items: [
          '[Гарвардский университет](/institutions/us/harvard-university), Кембридж: **61 676 $**',
          '[Принстонский университет](/institutions/us/princeton-university), Принстон: **62 688 $**',
          '[Йельский университет](/institutions/us/yale-university), Нью-Хейвен: **67 250 $**',
          '[Дартмутский колледж](/institutions/us/dartmouth-college), Хановер: **68 268 $**',
          '[Пенсильванский университет](/institutions/us/university-of-pennsylvania), Филадельфия: **68 686 $**',
          '[Корнеллский университет](/institutions/us/cornell-university), Итака: **69 314 $**',
          '[Брауновский университет](/institutions/us/brown-university), Провиденс: **71 412 $**',
          '[Колумбийский университет](/institutions/us/columbia-university-in-the-city-of-new-york), Нью-Йорк: **71 845 $**',
        ],
      },
      { t: 'p', text: 'Цена посередине (медиана) — около 68 500 $ в год. Разница между самым дешёвым и самым дорогим вузом — 10 169 $ в год.' },
      { t: 'h2', id: 'what', text: 'Что это за цена' },
      {
        t: 'ul',
        items: [
          '**Источник** — College Scorecard, открытая база Министерства образования США. Вузы сами сообщают туда свои цены.',
          '**Это цена обучения с обязательными сборами** за один год для студента бакалавриата. Все восемь вузов частные, поэтому цена одна для всех: для американцев и для иностранцев.',
          '**Это цена одного года, 2025/26.** На следующие годы вуз публикует новую цену. Бакалавриат в США обычно длится четыре года, так что всю учёбу нельзя посчитать простым умножением: цены следующих лет ещё не известны.',
        ],
      },
      { t: 'h2', id: 'not-included', text: 'Что в цену не входит' },
      {
        t: 'ul',
        items: [
          '**Проживание и питание.** В источнике, из которого мы берём цены, этих сумм нет, и мы их не придумываем. Смотрите раздел о стоимости (cost of attendance) на сайте вуза.',
          '**Учебники, страховка, перелёты, виза.**',
          '**Финансовая помощь.** Опубликованная цена — это цена до стипендий и скидок. На сайте вуза узнайте, даёт ли он финансовую помощь иностранным студентам: от этого зависит, сколько вы заплатите на самом деле.',
        ],
      },
      { t: 'note', text: 'Для визы нужно показать деньги не только на обучение, но и на жизнь. Подробнее: [сколько денег нужно показать для студенческой визы](/blog/proof-of-funds-student-visa).' },
      { t: 'h2', id: 'masters', text: 'А магистратура?' },
      { t: 'p', text: 'Цена в College Scorecard относится к бакалавриату. Цены магистратуры у этих вузов назначает каждая школа отдельно (школа бизнеса, права, инженерная школа), и в нашем источнике их нет. Если на странице вуза на YourHEI у магистерской программы стоит та же сумма, читайте её как ориентир по вузу, а точную цену смотрите на странице программы на официальном сайте.' },
      { t: 'h2', id: 'compare', text: 'Как это выглядит на фоне других вузов США' },
      { t: 'p', text: 'Типичный вуз США стоит около 17 500 $ в год: это медиана по 3 083 вузам с опубликованной ценой, среди которых много муниципальных колледжей. Лига плюща примерно в четыре раза дороже. Цены по странам и как мы их считали: [сколько стоит учиться за границей](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country).' },
      { t: 'p', text: 'Если бюджет меньше, посмотрите страны, где учёба бесплатна или почти бесплатна: [Германия, Чехия, Финляндия](/blog/free-tuition-germany-czechia-finland), и стипендии, которые покрывают всё: [полные стипендии для иностранных студентов](/blog/fully-funded-scholarships-for-international-students).' },
      { t: 'cta', href: '/institutions/us', text: 'Все вузы США с ценами' },
      { t: 'cta', href: '/study/us', text: 'Учёба в США: направления' },
      { t: 'h2', id: 'sources', text: 'Источники' },
      { t: 'p', text: 'Цены: [College Scorecard](https://collegescorecard.ed.gov/data/), Министерство образования США, учебный год 2025/26. Проверено 13 ноября 2026 г. Перед подачей сверяйте цену на официальном сайте вуза.' },
    ],
  },
  en: {
    title: 'Harvard and Ivy League tuition: what a year costs',
    seoTitle: 'Harvard and Ivy League tuition, 2025/26',
    description: 'What a year at Harvard, Yale, Princeton and the other Ivy League universities costs: published 2025/26 prices from the College Scorecard and what they leave out.',
    blocks: [
      { t: 'p', text: 'A year at Harvard costs **$61,676** (the published price for 2025/26). That is the lowest price in the Ivy League: the other seven charge between $62,688 and $71,845 a year. Below are the prices of all eight, where they come from and what they do not include.' },
      { t: 'h2', id: 'prices', text: 'Prices of the eight universities' },
      { t: 'p', text: 'The price of one academic year, lowest first:' },
      {
        t: 'ol',
        items: [
          '[Harvard University](/institutions/us/harvard-university), Cambridge: **$61,676**',
          '[Princeton University](/institutions/us/princeton-university), Princeton: **$62,688**',
          '[Yale University](/institutions/us/yale-university), New Haven: **$67,250**',
          '[Dartmouth College](/institutions/us/dartmouth-college), Hanover: **$68,268**',
          '[University of Pennsylvania](/institutions/us/university-of-pennsylvania), Philadelphia: **$68,686**',
          '[Cornell University](/institutions/us/cornell-university), Ithaca: **$69,314**',
          '[Brown University](/institutions/us/brown-university), Providence: **$71,412**',
          '[Columbia University](/institutions/us/columbia-university-in-the-city-of-new-york), New York: **$71,845**',
        ],
      },
      { t: 'p', text: 'The price in the middle (the median) is about $68,500 a year. The gap between the cheapest and the most expensive is $10,169 a year.' },
      { t: 'h2', id: 'what', text: 'What this price is' },
      {
        t: 'ul',
        items: [
          '**The source** is the College Scorecard, an open database of the US Department of Education. Institutions report their own prices to it.',
          '**It is tuition with required fees** for one year of an undergraduate student. All eight are private, so there is one price for everybody: US and international students alike.',
          '**It is the price of one year, 2025/26.** The university publishes a new price for each following year. A bachelor\'s degree in the US usually takes four years, so the whole degree cannot be found by simple multiplication: the prices of the later years are not known yet.',
        ],
      },
      { t: 'h2', id: 'not-included', text: 'What the price does not include' },
      {
        t: 'ul',
        items: [
          '**Housing and food.** The source we take the prices from does not carry these sums, and we do not make them up. See the cost of attendance section on the university\'s site.',
          '**Books, insurance, flights, the visa.**',
          '**Financial aid.** The published price is the price before scholarships and discounts. Check on the university\'s site whether it gives financial aid to international students: what you really pay depends on it.',
        ],
      },
      { t: 'note', text: 'For the visa you must show money for living costs as well as tuition. More: [how much money to show for a student visa](/blog/proof-of-funds-student-visa).' },
      { t: 'h2', id: 'masters', text: 'What about a master\'s degree?' },
      { t: 'p', text: 'The College Scorecard price is the undergraduate one. Master\'s prices at these universities are set by each school separately (business, law, engineering), and our source does not have them. If a master\'s programme on a YourHEI institution page shows the same sum, read it as a guide to the university and take the exact price from the programme page on the official site.' },
      { t: 'h2', id: 'compare', text: 'How this compares with other US institutions' },
      { t: 'p', text: 'A typical US institution costs about $17,500 a year: that is the median over 3,083 institutions with a published price, many of them community colleges. The Ivy League is about four times as expensive. Prices by country and how we counted them: [how much it costs to study abroad](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country).' },
      { t: 'p', text: 'With a smaller budget, look at countries where tuition is free or nearly free: [Germany, Czechia, Finland](/blog/free-tuition-germany-czechia-finland), and at scholarships that cover everything: [fully funded scholarships for international students](/blog/fully-funded-scholarships-for-international-students).' },
      { t: 'cta', href: '/institutions/us', text: 'All US institutions with prices' },
      { t: 'cta', href: '/study/us', text: 'Study in the US: fields' },
      { t: 'h2', id: 'sources', text: 'Sources' },
      { t: 'p', text: 'Prices: [College Scorecard](https://collegescorecard.ed.gov/data/), US Department of Education, academic year 2025/26. Checked on 13 November 2026. Before you apply, check the price on the university\'s official site.' },
    ],
  },
};
