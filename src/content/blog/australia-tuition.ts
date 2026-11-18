import type { Article } from '@/lib/blog/types';

// The figures are calculated from the course fees YourHEI holds from CRICOS, the Australian Government register of courses for
// international students (data.gov.au, downloaded October 2026, fees for 2026). The price per year is the total course fee divided
// by the course length in years. Medians and the range that holds 80 % of the prices (10th to 90th percentile) are taken over
// courses with a fee for international students, by level of the course and by type of the provider (university; vocational
// institute; college; school; language course). University medians are over the university's bachelor's courses.
// Living costs for the visa: Home Affairs, AUD 29,710 a year for one student (data/reference/living-costs.json, checked 8.10.2026).
export const australiaTuition: Article = {
  slug: 'australia-tuition-fees-international-students',
  published: '2026-11-18',
  updated: '2026-11-18',
  ru: {
    title: 'Сколько стоит обучение в Австралии для иностранцев',
    seoTitle: 'Стоимость обучения в Австралии для иностранцев, 2026',
    description: 'Сколько стоит год учёбы в Австралии для иностранца: бакалавриат, магистратура, колледжи и курсы английского, цены крупных университетов по реестру CRICOS.',
    blocks: [
      { t: 'p', text: 'Год бакалавриата в австралийском университете стоит иностранному студенту около **43 000 австралийских долларов**. Это типичная цена (медиана) по 4 562 программам 63 университетов на 2026 год. Профессиональное обучение в колледжах стоит втрое дешевле — около 13 500 долларов в год. Ниже цены по уровням и по крупным университетам, а также сколько денег нужно показать для визы.' },
      { t: 'h2', id: 'levels', text: 'Цены по уровням' },
      {
        t: 'ul',
        items: [
          '**Бакалавриат в университете:** около 43 000 долларов в год. 80 % программ стоят от 30 800 до 58 300 долларов (4 562 программы).',
          '**Магистратура в университете:** около 35 300 долларов в год. 80 % программ — от 22 100 до 54 900 долларов (705 программ 35 университетов; у крупных университетов в реестре магистерских программ меньше, чем бакалаврских).',
          '**Профессиональное образование (VET) в колледжах и институтах:** около 13 500 долларов в год, 80 % — от 8 000 до 25 000 (3 768 программ).',
          '**Языковые курсы английского:** около 17 100 долларов в год, 80 % — от 11 900 до 25 600 (948 курсов).',
          '**Школа для иностранных учеников:** около 31 000 долларов в год (838 программ).',
        ],
      },
      { t: 'h2', id: 'universities', text: 'Цены в крупных университетах (бакалавриат)' },
      { t: 'p', text: 'Типичная цена года по бакалаврским программам университета, от меньшей к большей:' },
      {
        t: 'ul',
        items: [
          '[Университет Дикина](/institutions/au/deakin-university): около 44 400 долларов',
          '[Квинслендский университет](/institutions/au/university-of-queensland): около 47 200 долларов',
          '[Университет Маккуори](/institutions/au/macquarie-university): около 48 200 долларов',
          '[Мельбурнский королевский технологический университет (RMIT)](/institutions/au/rmit-university): около 49 000 долларов',
          '[Мельбурнский университет](/institutions/au/university-of-melbourne): около 49 100 долларов',
          '[Технологический университет Сиднея](/institutions/au/university-of-technology-sydney): около 51 000 долларов',
          '[Университет Западной Австралии](/institutions/au/university-of-western-australia): около 51 100 долларов',
          '[Университет Нового Южного Уэльса](/institutions/au/university-of-new-south-wales): около 56 000 долларов',
          '[Австралийский национальный университет](/institutions/au/australian-national-university): около 56 100 долларов',
          '[Университет Монаша](/institutions/au/monash-university): около 59 300 долларов',
          '[Сиднейский университет](/institutions/au/university-of-sydney): около 63 600 долларов',
        ],
      },
      { t: 'p', text: 'Внутри одного университета цены сильно различаются между программами. Цену конкретной программы смотрите в её карточке на странице университета.' },
      { t: 'cta', href: '/institutions/au', text: 'Все заведения Австралии' },
      { t: 'cta', href: '/study/au', text: 'Учёба в Австралии: направления' },
      { t: 'h2', id: 'how', text: 'Как мы считали' },
      {
        t: 'ul',
        items: [
          '**Источник** — CRICOS, официальный реестр правительства Австралии: в нём каждая программа, на которую можно приехать по студенческой визе, с ценой для иностранцев. В нашей базе 1 540 заведений и около 19 000 программ с ценой на 2026 год.',
          '**Цена за год.** Реестр указывает цену за всю программу; мы делим её на длительность в годах.',
          '**Медиана** — цена посередине: половина программ дешевле, половина дороже.',
          '**Только обучение.** Жильё, питание, медицинская страховка для студентов (OSHC) и виза в цену не входят.',
        ],
      },
      { t: 'h2', id: 'visa-money', text: 'Сколько денег нужно на жизнь' },
      { t: 'p', text: 'Для студенческой визы (subclass 500) нужно показать, что у вас есть деньги на жизнь: **29 710 австралийских долларов в год** для одного студента, по данным Министерства внутренних дел Австралии на 2026 год. Это сверх платы за обучение и перелёт. Требования к документам и сумме проверяйте на сайте министерства перед подачей.' },
      { t: 'note', text: 'Суммы для других стран: [сколько денег нужно показать для студенческой визы](/blog/proof-of-funds-student-visa).' },
      { t: 'h2', id: 'cheaper', text: 'Если дорого' },
      { t: 'p', text: 'Сравните с другими странами: [сколько стоит учиться за границей](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country), [страны, где учёба бесплатна или почти бесплатна](/blog/free-tuition-germany-czechia-finland). Стипендии, которые покрывают всё: [полные стипендии для иностранных студентов](/blog/fully-funded-scholarships-for-international-students).' },
      { t: 'h2', id: 'sources', text: 'Источники' },
      { t: 'p', text: 'Цены: [CRICOS](https://cricos.education.gov.au/), Министерство образования Австралии, открытые данные на data.gov.au, загружены в октябре 2026 г. Деньги на жизнь: [Student visa (subclass 500)](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500), Министерство внутренних дел Австралии, проверено 8 октября 2026 г. Перед подачей сверяйте цену на странице программы.' },
    ],
  },
  en: {
    title: 'Tuition fees in Australia for international students',
    seoTitle: 'Tuition fees in Australia for international students, 2026',
    description: 'What a year of study in Australia costs an international student: bachelor\'s, master\'s, vocational and English courses, and big universities, from the CRICOS register.',
    blocks: [
      { t: 'p', text: 'A year of a bachelor\'s degree at an Australian university costs an international student about **AUD 43,000**. That is the typical price (median) over 4,562 courses at 63 universities for 2026. Vocational training at colleges costs a third of that, about AUD 13,500 a year. Below are the prices by level and at the large universities, and how much money you must show for the visa.' },
      { t: 'h2', id: 'levels', text: 'Prices by level' },
      {
        t: 'ul',
        items: [
          '**Bachelor\'s at a university:** about AUD 43,000 a year. 80% of courses cost between AUD 30,800 and AUD 58,300 (4,562 courses).',
          '**Master\'s at a university:** about AUD 35,300 a year. 80% of courses cost between AUD 22,100 and AUD 54,900 (705 courses at 35 universities; the large universities list fewer master\'s than bachelor\'s courses in the register).',
          '**Vocational education (VET) at colleges and institutes:** about AUD 13,500 a year, 80% between AUD 8,000 and AUD 25,000 (3,768 courses).',
          '**English language courses:** about AUD 17,100 a year, 80% between AUD 11,900 and AUD 25,600 (948 courses).',
          '**School for international students:** about AUD 31,000 a year (838 courses).',
        ],
      },
      { t: 'h2', id: 'universities', text: 'Prices at the large universities (bachelor\'s)' },
      { t: 'p', text: 'The typical price of a year over the university\'s bachelor\'s courses, lowest first:' },
      {
        t: 'ul',
        items: [
          '[Deakin University](/institutions/au/deakin-university): about AUD 44,400',
          '[University of Queensland](/institutions/au/university-of-queensland): about AUD 47,200',
          '[Macquarie University](/institutions/au/macquarie-university): about AUD 48,200',
          '[RMIT University](/institutions/au/rmit-university): about AUD 49,000',
          '[University of Melbourne](/institutions/au/university-of-melbourne): about AUD 49,100',
          '[University of Technology Sydney](/institutions/au/university-of-technology-sydney): about AUD 51,000',
          '[University of Western Australia](/institutions/au/university-of-western-australia): about AUD 51,100',
          '[UNSW Sydney](/institutions/au/university-of-new-south-wales): about AUD 56,000',
          '[Australian National University](/institutions/au/australian-national-university): about AUD 56,100',
          '[Monash University](/institutions/au/monash-university): about AUD 59,300',
          '[University of Sydney](/institutions/au/university-of-sydney): about AUD 63,600',
        ],
      },
      { t: 'p', text: 'Prices differ a lot between courses of one university. The price of a given course is on its card on the university\'s page.' },
      { t: 'cta', href: '/institutions/au', text: 'All institutions in Australia' },
      { t: 'cta', href: '/study/au', text: 'Study in Australia: fields' },
      { t: 'h2', id: 'how', text: 'How we counted' },
      {
        t: 'ul',
        items: [
          '**The source** is CRICOS, the official register of the Australian Government: it lists every course you can come to on a student visa, with its fee for international students. Our database holds 1,540 providers and about 19,000 courses with a fee for 2026.',
          '**Price per year.** The register states the fee of the whole course; we divide it by the length in years.',
          '**The median** is the price in the middle: half of the courses cost less, half cost more.',
          '**Tuition only.** Housing, food, Overseas Student Health Cover (OSHC) and the visa are not included.',
        ],
      },
      { t: 'h2', id: 'visa-money', text: 'How much money you need to live' },
      { t: 'p', text: 'For the Student visa (subclass 500) you must show money for living costs: **AUD 29,710 a year** for one student, according to the Department of Home Affairs for 2026. That comes on top of tuition and travel. Check the documents and the amount on the Department\'s website before you apply.' },
      { t: 'note', text: 'Sums for other countries: [how much money to show for a student visa](/blog/proof-of-funds-student-visa).' },
      { t: 'h2', id: 'cheaper', text: 'If it is too expensive' },
      { t: 'p', text: 'Compare with other countries: [how much it costs to study abroad](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country), [countries where tuition is free or nearly free](/blog/free-tuition-germany-czechia-finland). Scholarships that cover everything: [fully funded scholarships for international students](/blog/fully-funded-scholarships-for-international-students).' },
      { t: 'h2', id: 'sources', text: 'Sources' },
      { t: 'p', text: 'Fees: [CRICOS](https://cricos.education.gov.au/), Australian Government Department of Education, open data on data.gov.au, downloaded in October 2026. Living costs: [Student visa (subclass 500)](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500), Department of Home Affairs, checked on 8 October 2026. Before you apply, check the price on the course page.' },
    ],
  },
};
