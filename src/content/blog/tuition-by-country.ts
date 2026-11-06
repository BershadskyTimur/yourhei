import type { Article } from '@/lib/blog/types';

// The figures are calculated from the published prices that YourHEI holds (October 2026): the US College Scorecard
// (yearly published tuition), the Australian CRICOS register (total fee divided by the length of the course), Study in NL,
// the Finnish Studyinfo and the Swedish universityadmissions.se (total fee divided by the length). Medians and the range that holds
// 80 % of the prices (the 10th to the 90th percentile) were taken over programmes (US: over institutions).
export const tuitionByCountry: Article = {
  slug: 'how-much-does-it-cost-to-study-abroad-tuition-by-country',
  published: '2026-11-06',
  updated: '2026-11-07',
  ru: {
    title: 'Сколько стоит учиться за границей: цены по 5 странам',
    description: 'Сколько платят иностранцы за обучение в США, Австралии, Нидерландах, Финляндии и Швеции: типичные цены на бакалавриат и магистратуру по официальным данным.',
    blocks: [
      { t: 'p', text: 'Самый частый вопрос абитуриента: «сколько это стоит?». Ответ зависит от страны, вуза и программы, но порядок цен понятен. Ниже типичные цены на **обучение** для иностранных студентов в пяти странах, посчитанные по опубликованным ценам из нашей базы (данные на октябрь 2026 года). Проживание сюда не входит: о нём в конце.' },
      { t: 'h2', id: 'how', text: 'Как мы считали' },
      {
        t: 'ul',
        items: [
          '**Медиана** — это цена посередине: половина программ дешевле, половина дороже. Она честнее среднего, потому что несколько очень дорогих программ её не искажают.',
          '**Диапазон** показывает, где лежат 80 % цен: отбрасываем самые дешёвые 10 % и самые дорогие 10 %.',
          '**Цена за год.** Если источник указывает цену за весь курс, мы делим её на длительность в годах.',
          '**Только программы, у которых цена известна** и относится к иностранцам. Для остальных цены у нас нет, и мы их не придумываем.',
        ],
      },
      { t: 'h2', id: 'usa', text: 'США' },
      {
        t: 'ul',
        items: [
          '**Типичный вуз:** около 17 500 $ в год (медиана по 3 083 вузам с опубликованной ценой, среди них и муниципальные колледжи).',
          '**Диапазон:** от 6 600 $ до 47 500 $ в год.',
          '**Как это читать.** Для государственных вузов в базе указана цена для студентов из других штатов, которую обычно платят и иностранцы. У частных вузов цена одна для всех. Это цена обучения, без проживания, книг и страховки.',
          'Программы бакалавриата чаще встречаются в дорогих вузах: если считать по программам, а не по вузам, медиана выше, около 31 000 $.',
        ],
      },
      { t: 'p', text: 'Страницы вузов и программы США: [Учёба в США](/study/us).' },
      { t: 'h2', id: 'australia', text: 'Австралия' },
      {
        t: 'ul',
        items: [
          '**Бакалавриат:** около 40 400 австралийских долларов в год (диапазон 24 200–57 100), 3 300 программ.',
          '**Магистратура:** около 24 000 австралийских долларов в год (диапазон 12 000–38 800), 1 570 программ.',
          'Источник — официальный реестр CRICOS, где указана общая стоимость курса; мы делим её на длительность.',
        ],
      },
      { t: 'p', text: 'Программы Австралии: [Учёба в Австралии](/study/au).' },
      { t: 'h2', id: 'netherlands', text: 'Нидерланды' },
      {
        t: 'ul',
        items: [
          '**Бакалавриат:** около 16 900 евро в год (диапазон 11 800–24 500), 109 программ.',
          '**Магистратура:** около 22 900 евро в год (диапазон 19 600–26 000), 385 программ.',
          'Цена для студентов из-за пределов ЕЭЗ указана примерно у трети программ (494 из 1 474): у остальных в источнике нет цены для таких студентов. Для них уточняйте цену на сайте вуза.',
        ],
      },
      { t: 'p', text: 'Программы Нидерландов: [Учёба в Нидерландах](/study/nl); сроки и порядок подачи: [Нидерланды: Studielink и сроки](/blog/netherlands-application-deadlines-studielink); стипендия: [NL Scholarship](/blog/nl-scholarship-netherlands-how-to-apply).' },
      { t: 'h2', id: 'finland', text: 'Финляндия' },
      {
        t: 'ul',
        items: [
          '**Бакалавриат:** около 10 000 евро в год (диапазон 9 500–12 000), 262 программы.',
          '**Магистратура:** около 12 000 евро в год (диапазон 10 000–18 000), 589 программ.',
          'Обучение на финском и шведском, а также докторантура бесплатны ([подробнее](/blog/free-tuition-germany-czechia-finland)).',
        ],
      },
      { t: 'p', text: 'Программы Финляндии: [Учёба в Финляндии](/study/fi).' },
      { t: 'h2', id: 'sweden', text: 'Швеция' },
      {
        t: 'ul',
        items: [
          '**Бакалавриат:** около 150 000 шведских крон в год (диапазон 97 000–290 000), 101 программа.',
          '**Магистратура:** около 147 000 шведских крон в год (диапазон 97 000–192 500), 894 программы.',
          'Источник — официальный портал приёма Швеции universityadmissions.se, где указана общая стоимость программы; мы делим её на длительность. Цены для студентов из ЕС, ЕЭЗ и Швейцарии другие: для них обучение бесплатно.',
        ],
      },
      { t: 'h2', id: 'germany', text: 'А Германия и Чехия?' },
      { t: 'p', text: 'В государственных вузах Германии обучение в большинстве случаев бесплатно, а в Чехии бесплатны программы на чешском. Эти правила и исключения разобраны отдельно: [Бесплатно ли учиться в Германии, Чехии и Финляндии](/blog/free-tuition-germany-czechia-finland).' },
      { t: 'h2', id: 'living', text: 'Обучение — это не вся стоимость' },
      {
        t: 'ul',
        items: [
          'Для студенческой визы нужно подтвердить средства на жизнь: суммы для 14 стран собраны в статье [Сколько денег нужно показать на студенческую визу](/blog/proof-of-funds-student-visa).',
          'Реальные расходы обычно выше визового минимума, особенно в больших городах.',
          'Платное обучение можно удешевить стипендией: [полные стипендии для иностранцев](/blog/fully-funded-scholarships-for-international-students) и [база государственных стипендий](/scholarships).',
        ],
      },
      { t: 'note', text: 'Цены меняются каждый год, а у вузов бывают свои условия и скидки. Перед подачей заявки проверьте цену на официальной странице программы: ссылка есть на странице каждого вуза на YourHEI.' },
      { t: 'p', text: 'В [каталоге](/catalog) цены можно показать в вашей валюте и отфильтровать программы по стране, уровню и бюджету.' },
      {
        t: 'p',
        text: 'Источники данных: [US College Scorecard](https://collegescorecard.ed.gov/data/); [CRICOS, реестр курсов для иностранных студентов Австралии](https://cricos.education.gov.au/); [Study in NL](https://www.studyinnl.org/); [Studyinfo, Финляндия](https://opintopolku.fi/konfo/en/); [universityadmissions.se, Швеция](https://www.universityadmissions.se/).',
      },
      { t: 'cta', href: '/catalog', text: 'Найти программу по бюджету' },
      { t: 'cta', href: '/scholarships', text: 'Стипендии' },
    ],
  },
  en: {
    title: 'How much it costs to study abroad: tuition in 5 countries',
    description: 'What international students pay for tuition in the USA, Australia, the Netherlands, Finland and Sweden: typical bachelor’s and master’s prices from official data.',
    blocks: [
      { t: 'p', text: 'The most common question of an applicant is “how much does it cost?”. The answer depends on the country, the university and the programme, but the order of magnitude is clear. Below are the typical **tuition** prices for international students in five countries, calculated from the published prices that YourHEI holds (October 2026 data). Living costs are not included: see the end of the article.' },
      { t: 'h2', id: 'how', text: 'How we calculated' },
      {
        t: 'ul',
        items: [
          '**The median** is the middle price: half of the programmes are cheaper and half are dearer. It is fairer than the average, because a few very expensive programmes do not distort it.',
          '**The range** shows where 80 % of the prices lie: the cheapest 10 % and the dearest 10 % are left out.',
          '**Price per year.** When a source gives the price of the whole course, we divide it by the length in years.',
          '**Only programmes whose price is known** and applies to international students. For the others we have no price, and we do not make one up.',
        ],
      },
      { t: 'h2', id: 'usa', text: 'USA' },
      {
        t: 'ul',
        items: [
          '**A typical institution:** about $17,500 a year (the median over 3,083 institutions with a published price, community colleges included).',
          '**Range:** from $6,600 to $47,500 a year.',
          '**How to read it.** For state universities the database holds the out-of-state price, which international students usually pay too. Private universities charge one price to everyone. This is tuition only, without housing, books and insurance.',
          'Bachelor’s programmes are more common at expensive institutions: counted over programmes instead of institutions, the median is higher, about $31,000.',
        ],
      },
      { t: 'p', text: 'Institutions and programmes in the USA: [Study in the USA](/study/us).' },
      { t: 'h2', id: 'australia', text: 'Australia' },
      {
        t: 'ul',
        items: [
          '**Bachelor’s:** about A$40,400 a year (range A$24,200–57,100), 3,300 programmes.',
          '**Master’s:** about A$24,000 a year (range A$12,000–38,800), 1,570 programmes.',
          'The source is the official CRICOS register, which gives the total cost of the course; we divide it by the length.',
        ],
      },
      { t: 'p', text: 'Programmes in Australia: [Study in Australia](/study/au).' },
      { t: 'h2', id: 'netherlands', text: 'The Netherlands' },
      {
        t: 'ul',
        items: [
          '**Bachelor’s:** about €16,900 a year (range €11,800–24,500), 109 programmes.',
          '**Master’s:** about €22,900 a year (range €19,600–26,000), 385 programmes.',
          'The price for students from outside the EEA is given for about a third of the programmes (494 of 1,474): for the others the source has no price for such students. For those, ask the university.',
        ],
      },
      { t: 'p', text: 'Programmes in the Netherlands: [Study in the Netherlands](/study/nl); how and when to apply: [Netherlands: Studielink and deadlines](/blog/netherlands-application-deadlines-studielink); a scholarship: [NL Scholarship](/blog/nl-scholarship-netherlands-how-to-apply).' },
      { t: 'h2', id: 'finland', text: 'Finland' },
      {
        t: 'ul',
        items: [
          '**Bachelor’s:** about €10,000 a year (range €9,500–12,000), 262 programmes.',
          '**Master’s:** about €12,000 a year (range €10,000–18,000), 589 programmes.',
          'Study in Finnish or Swedish and doctoral studies are free ([more](/blog/free-tuition-germany-czechia-finland)).',
        ],
      },
      { t: 'p', text: 'Programmes in Finland: [Study in Finland](/study/fi).' },
      { t: 'h2', id: 'sweden', text: 'Sweden' },
      {
        t: 'ul',
        items: [
          '**Bachelor’s:** about SEK 150,000 a year (range SEK 97,000–290,000), 101 programmes.',
          '**Master’s:** about SEK 147,000 a year (range SEK 97,000–192,500), 894 programmes.',
          'The source is the official Swedish application portal universityadmissions.se, which gives the total cost of a programme; we divide it by the length. Students from the EU, the EEA and Switzerland pay nothing: for them study is free.',
        ],
      },
      { t: 'h2', id: 'germany', text: 'And Germany and Czechia?' },
      { t: 'p', text: 'At German state universities study is free in most cases, and in Czechia programmes taught in Czech are free. These rules and their exceptions are covered separately: [Is study free in Germany, Czechia and Finland?](/blog/free-tuition-germany-czechia-finland).' },
      { t: 'h2', id: 'living', text: 'Tuition is not the whole cost' },
      {
        t: 'ul',
        items: [
          'For a student visa you must prove you can pay for living: the amounts for 14 countries are in [How much money to show for a student visa](/blog/proof-of-funds-student-visa).',
          'Real costs are usually higher than the visa minimum, especially in big cities.',
          'Paid tuition can be reduced with a scholarship: [fully funded scholarships for international students](/blog/fully-funded-scholarships-for-international-students) and [the database of national scholarships](/scholarships).',
        ],
      },
      { t: 'note', text: 'Prices change every year, and universities have their own conditions and discounts. Before you apply, check the price on the programme’s official page: every institution page on YourHEI has the link.' },
      { t: 'p', text: 'In the [catalogue](/catalog) you can show the prices in your own currency and filter programmes by country, level and budget.' },
      {
        t: 'p',
        text: 'Data sources: [US College Scorecard](https://collegescorecard.ed.gov/data/); [CRICOS, the register of courses for international students in Australia](https://cricos.education.gov.au/); [Study in NL](https://www.studyinnl.org/); [Studyinfo, Finland](https://opintopolku.fi/konfo/en/); [universityadmissions.se, Sweden](https://www.universityadmissions.se/).',
      },
      { t: 'cta', href: '/catalog', text: 'Find a programme by budget' },
      { t: 'cta', href: '/scholarships', text: 'Scholarships' },
    ],
  },
};
