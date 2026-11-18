import type { Article } from '@/lib/blog/types';

// The figures are calculated from the fees YourHEI holds from Study in NL (Nuffic) programme pages, academic years 2026/27 and
// 2027/28: 39 institutions, 1 481 programmes; a fee for students from outside the EU/EEA is stated for 501 of them (385 master's,
// 116 bachelor's). The price is per year as stated. Medians and the range that holds 80 % of the prices (10th to 90th percentile)
// are taken over programmes; university medians are over the university's programmes of one level. The statutory fee for 2027/28,
// EUR 2,771, is the one 1 247 programmes state; the 2026/27 amount and who pays it: studyinnl.org/finances/tuition-fees (checked
// 18.11.2026). IND: fee EUR 254 for a study residence permit (ind.nl/en/fees-costs-of-an-application, checked 18.11.2026), study
// norm EUR 1,130.77 a month (data/reference/living-costs.json, checked 8.10.2026).
export const netherlandsTuition: Article = {
  slug: 'netherlands-tuition-fees-international-students',
  published: '2026-11-18',
  updated: '2026-11-18',
  ru: {
    title: 'Сколько стоит обучение в Нидерландах для иностранцев',
    seoTitle: 'Стоимость обучения в Нидерландах для иностранцев, 2027/28',
    description: 'Сколько стоит год учёбы в Нидерландах: законная плата для граждан ЕС, цены для остальных по вузам и расходы на вид на жительство, по официальным данным.',
    blocks: [
      { t: 'p', text: 'Год магистратуры в Нидерландах для студента не из ЕС стоит около **22 900 евро**, год бакалавриата — около **16 900 евро**. Это типичные цены (медианы) по 501 программе на 2026/27 и 2027/28 учебные годы. Граждане ЕС, ЕЭЗ, Швейцарии и Суринама платят законную плату: **2 694 евро** в 2026/27 году, а большинство программ на 2027/28 указывают **2 771 евро**.' },
      { t: 'h2', id: 'who-pays', text: 'Кто сколько платит' },
      {
        t: 'ul',
        items: [
          '**Законная плата (wettelijk collegegeld)** — для граждан ЕЭЗ, Швейцарии и Суринама, если у них ещё нет такой же степени из государственного вуза Нидерландов. Она одинакова во всех государственных вузах.',
          '**Плата вуза (instellingscollegegeld)** — для всех остальных, в том числе для студентов из стран СНГ, Азии и Африки. Её назначает сам вуз, поэтому она различается между вузами и программами.',
          'Некоторые вузы берут со студентов не из ЕЭЗ ещё и сбор за заявку: по данным Study in NL, от 75 до 100 евро.',
        ],
      },
      { t: 'h2', id: 'levels', text: 'Цены для студентов не из ЕС' },
      {
        t: 'ul',
        items: [
          '**Магистратура:** около 22 900 евро в год. 80 % программ стоят от 19 600 до 26 000 евро (385 программ).',
          '**Бакалавриат:** около 16 900 евро в год. 80 % программ стоят от 11 800 до 24 500 евро (116 программ).',
          'Магистратура в Нидерландах обычно длится один или два года, бакалавриат в университете — три, в университете прикладных наук — четыре.',
        ],
      },
      { t: 'h2', id: 'universities', text: 'Цены в крупных университетах' },
      { t: 'p', text: 'Типичная цена года для студента не из ЕС:' },
      {
        t: 'ul',
        items: [
          '[Университет Радбода](/institutions/nl/radboud-university): бакалавриат около 15 800 евро, магистратура около 19 600 евро',
          '[Лейденский университет](/institutions/nl/leiden-university): бакалавриат около 14 700 евро, магистратура около 22 900 евро',
          '[Университет Твенте](/institutions/nl/university-of-twente): бакалавриат около 16 900 евро, магистратура около 22 300 евро',
          '[Университет Гронингена](/institutions/nl/university-of-groningen): магистратура около 22 800 евро',
          '[Амстердамский университет](/institutions/nl/university-of-amsterdam): бакалавриат около 17 600 евро, магистратура около 25 900 евро',
        ],
      },
      { t: 'cta', href: '/institutions/nl', text: 'Все вузы Нидерландов' },
      { t: 'cta', href: '/study/nl', text: 'Учёба в Нидерландах: направления' },
      { t: 'h2', id: 'how', text: 'Как мы считали' },
      {
        t: 'ul',
        items: [
          '**Источник** — Study in NL (Nuffic), официальный портал об учёбе в Нидерландах. В нашей базе 39 вузов и 1 481 программа; цена для студентов не из ЕС указана у 501 из них.',
          '**Медиана** — цена посередине: половина программ дешевле, половина дороже.',
          '**Только обучение.** Жильё, питание, страховка и вид на жительство в цену не входят.',
        ],
      },
      { t: 'h2', id: 'permit', text: 'Вид на жительство и деньги на жизнь' },
      {
        t: 'ul',
        items: [
          '**Сбор IND** за вид на жительство для учёбы — 254 евро (сумма на 2026 год; IND меняет её каждый год 1 января). Обычно заявку подаёт вуз за студента.',
          '**Деньги на жизнь:** IND требует показать 1 130,77 евро в месяц (норма на 2026 год), то есть около 13 600 евро на год учёбы.',
          '**Работа:** со студенческим видом на жительство можно работать до 16 часов в неделю или полный день в июне, июле и августе; работодателю обычно нужно разрешение на работу.',
        ],
      },
      { t: 'note', text: 'Заявки в вузы Нидерландов подают через Studielink, у многих программ ранние сроки: [сроки подачи и как устроен Studielink](/blog/netherlands-application-deadlines-studielink). Стипендия для студентов не из ЕЭЗ: [NL Scholarship](/blog/nl-scholarship-netherlands-how-to-apply).' },
      { t: 'h2', id: 'cheaper', text: 'Если дорого' },
      { t: 'p', text: 'Сравните с другими странами: [сколько стоит учиться за границей](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country), [Германия, Чехия, Финляндия: где учёба бесплатна или почти бесплатна](/blog/free-tuition-germany-czechia-finland), [стоимость обучения в Швеции](/blog/sweden-tuition-fees-international-students).' },
      { t: 'h2', id: 'sources', text: 'Источники' },
      { t: 'p', text: 'Цены программ: Study in NL (Nuffic), 2026/27 и 2027/28 учебные годы. Законная плата и кто её платит: [Study in NL, Tuition fees](https://www.studyinnl.org/finances/tuition-fees). Сбор за вид на жительство: [IND, Fees](https://ind.nl/en/fees-costs-of-an-application). Деньги на жизнь: [IND, Required amounts](https://ind.nl/en/required-amounts-income-requirements). Проверено 18 ноября 2026 г. Перед подачей сверяйте цену на странице программы.' },
    ],
  },
  en: {
    title: 'Tuition fees in the Netherlands for international students',
    seoTitle: 'Tuition fees in the Netherlands for international students',
    description: 'What a year of study in the Netherlands costs: the statutory fee for EU citizens, fees for everyone else by university, and residence permit costs, official data.',
    blocks: [
      { t: 'p', text: 'A year of a master\'s in the Netherlands costs a student from outside the EU about **EUR 22,900**, a year of a bachelor\'s about **EUR 16,900**. These are typical prices (medians) over 501 programmes for the academic years 2026/27 and 2027/28. Citizens of the EU, the EEA, Switzerland and Suriname pay the statutory fee: **EUR 2,694** in 2026/27, and most programmes for 2027/28 state **EUR 2,771**.' },
      { t: 'h2', id: 'who-pays', text: 'Who pays what' },
      {
        t: 'ul',
        items: [
          '**The statutory fee (wettelijk collegegeld)** is for citizens of the EEA, Switzerland and Suriname who do not yet hold the same degree from a government-funded Dutch institution. It is the same at every public institution.',
          '**The institutional fee (instellingscollegegeld)** is for everyone else, including students from the CIS, Asia and Africa. Each institution sets its own, so it differs between institutions and programmes.',
          'Some institutions also charge students from outside the EEA an application fee: between EUR 75 and EUR 100, according to Study in NL.',
        ],
      },
      { t: 'h2', id: 'levels', text: 'Prices for students from outside the EU' },
      {
        t: 'ul',
        items: [
          '**Master\'s:** about EUR 22,900 a year. 80% of programmes cost between EUR 19,600 and EUR 26,000 (385 programmes).',
          '**Bachelor\'s:** about EUR 16,900 a year. 80% of programmes cost between EUR 11,800 and EUR 24,500 (116 programmes).',
          'A master\'s in the Netherlands usually takes one or two years, a bachelor\'s three years at a research university and four at a university of applied sciences.',
        ],
      },
      { t: 'h2', id: 'universities', text: 'Prices at the large universities' },
      { t: 'p', text: 'The typical price of a year for a student from outside the EU:' },
      {
        t: 'ul',
        items: [
          '[Radboud University](/institutions/nl/radboud-university): bachelor\'s about EUR 15,800, master\'s about EUR 19,600',
          '[Leiden University](/institutions/nl/leiden-university): bachelor\'s about EUR 14,700, master\'s about EUR 22,900',
          '[University of Twente](/institutions/nl/university-of-twente): bachelor\'s about EUR 16,900, master\'s about EUR 22,300',
          '[University of Groningen](/institutions/nl/university-of-groningen): master\'s about EUR 22,800',
          '[University of Amsterdam](/institutions/nl/university-of-amsterdam): bachelor\'s about EUR 17,600, master\'s about EUR 25,900',
        ],
      },
      { t: 'cta', href: '/institutions/nl', text: 'All institutions in the Netherlands' },
      { t: 'cta', href: '/study/nl', text: 'Study in the Netherlands: fields' },
      { t: 'h2', id: 'how', text: 'How we counted' },
      {
        t: 'ul',
        items: [
          '**The source** is Study in NL (Nuffic), the official portal about studying in the Netherlands. Our database holds 39 institutions and 1,481 programmes; 501 of them state a price for students from outside the EU.',
          '**The median** is the price in the middle: half of the programmes cost less, half cost more.',
          '**Tuition only.** Housing, food, insurance and the residence permit are not included.',
        ],
      },
      { t: 'h2', id: 'permit', text: 'Residence permit and living costs' },
      {
        t: 'ul',
        items: [
          '**The IND fee** for a residence permit for study is EUR 254 (the amount for 2026; the IND changes it every year on 1 January). Usually the institution applies on the student\'s behalf.',
          '**Living costs:** the IND asks you to show EUR 1,130.77 a month (the norm for 2026), about EUR 13,600 for a year of study.',
          '**Work:** with a study residence permit you may work up to 16 hours a week, or full time in June, July and August; the employer usually needs a work permit.',
        ],
      },
      { t: 'note', text: 'You apply to Dutch institutions through Studielink, and many programmes have early deadlines: [deadlines and how Studielink works](/blog/netherlands-application-deadlines-studielink). A scholarship for students from outside the EEA: [NL Scholarship](/blog/nl-scholarship-netherlands-how-to-apply).' },
      { t: 'h2', id: 'cheaper', text: 'If it is too expensive' },
      { t: 'p', text: 'Compare with other countries: [how much it costs to study abroad](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country), [Germany, Czechia, Finland: where tuition is free or nearly free](/blog/free-tuition-germany-czechia-finland), [tuition fees in Sweden](/blog/sweden-tuition-fees-international-students).' },
      { t: 'h2', id: 'sources', text: 'Sources' },
      { t: 'p', text: 'Programme fees: Study in NL (Nuffic), academic years 2026/27 and 2027/28. The statutory fee and who pays it: [Study in NL, Tuition fees](https://www.studyinnl.org/finances/tuition-fees). Residence permit fee: [IND, Fees](https://ind.nl/en/fees-costs-of-an-application). Living costs: [IND, Required amounts](https://ind.nl/en/required-amounts-income-requirements). Checked on 18 November 2026. Before you apply, check the price on the programme page.' },
    ],
  },
};
