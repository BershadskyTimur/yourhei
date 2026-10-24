import type { Article } from '@/lib/blog/types';

export const proofOfFunds: Article = {
  slug: 'proof-of-funds-student-visa',
  published: '2026-10-24',
  updated: '2026-10-24',
  ru: {
    title: 'Сколько денег нужно показать для студенческой визы: 14 стран',
    description: 'Минимальные суммы на жизнь, которые 14 стран требуют подтвердить студенту-иностранцу для визы. Это не средние расходы. Данные по официальным источникам.',
    blocks: [
      { t: 'p', text: 'Для студенческой визы многие страны просят подтвердить, что вам хватит денег на жизнь. Это не рекомендация и не средний бюджет студента, а минимум, который устанавливают власти. Реальные расходы обычно выше, особенно в столицах, а плата за обучение в эту сумму не входит.' },
      { t: 'h2', id: 'how-to-read', text: 'Как читать эти суммы' },
      {
        t: 'ul',
        items: [
          '**Сумма указана за месяц и в валюте страны.** Мы не переводим её в другую валюту: курс меняется, а требуется именно эта сумма. Значения округлены до целого, точные цифры — на официальной странице.',
          '**Страны считают по-разному.** Германия требует заблокированный счёт на год (11 904 евро, по 992 евро в месяц), Ирландия — 10 000 евро в год сверх платы за обучение, в Австрии сумма зависит от возраста студента (до и после 24 лет).',
          '**Суммы меняются каждый год, а иногда и посреди года.** Для Великобритании они вырастут для заявок, поданных с 30 ноября 2026 года.',
          '**Где сумма зависит от города**, мы показываем обе (так в Великобритании: Лондон и остальная страна).',
        ],
      },
      { t: 'h2', id: 'countries', text: 'Суммы по странам' },
      { t: 'funds' },
      { t: 'h2', id: 'next', text: 'Что с этим делать' },
      {
        t: 'ol',
        items: [
          'Сложите два числа: плату за обучение и минимум на жизнь. В [каталоге](/catalog) они уже показаны вместе («≈ в год вместе с проживанием»).',
          'Помните, что это нижняя граница. Заложите запас на жильё, транспорт и непредвиденные расходы, особенно если вы выбираете большой город.',
          'Узнайте, в какой форме нужно подтвердить сумму: например, Германия просит заблокированный счёт. Форма подтверждения у стран может отличаться, поэтому смотрите официальную страницу.',
          'Узнайте, можно ли подрабатывать: правила семи стран разобраны в статье [Работа во время учёбы за границей](/blog/work-during-studies-rules-by-country).',
        ],
      },
      { t: 'cta', href: '/catalog', text: 'Программы с ценами в каталоге' },
    ],
  },
  en: {
    title: 'How much money you must show for a student visa: 14 countries',
    description: 'The minimum living money that 14 countries ask a foreign student to prove for the visa. It is not average spending. Data from official sources.',
    blocks: [
      { t: 'p', text: 'For a student visa, many countries ask you to prove that you can pay for your living. This is not a recommendation and not the average budget of a student: it is a minimum set by the authorities. Real costs are usually higher, especially in capitals, and tuition is not included.' },
      { t: 'h2', id: 'how-to-read', text: 'How to read these amounts' },
      {
        t: 'ul',
        items: [
          '**The amount is per month, in the currency of the country.** We do not convert it into another currency: exchange rates move, but the required amount is exactly this one. Values are rounded to a whole number; the exact figures are on the official page.',
          '**Countries count differently.** Germany asks for a blocked account for a year (EUR 11,904, paid out as EUR 992 a month), Ireland asks for EUR 10,000 a year in addition to the course fees, and in Austria the amount depends on the student’s age (under and over 24).',
          '**Amounts change every year, and sometimes in the middle of a year.** For the UK they rise for applications made from 30 November 2026.',
          '**Where the amount depends on the city**, we show both (as in the UK: London and the rest of the country).',
        ],
      },
      { t: 'h2', id: 'countries', text: 'The amounts, country by country' },
      { t: 'funds' },
      { t: 'h2', id: 'next', text: 'What to do with this' },
      {
        t: 'ol',
        items: [
          'Add up two numbers: tuition and the living minimum. In the [catalogue](/catalog) they are already shown together (“≈ per year with living”).',
          'Remember that this is the lower bound. Keep a reserve for housing, transport and unexpected costs, especially if you choose a big city.',
          'Find out in what form you must prove the amount: Germany, for example, asks for a blocked account. The form of proof can differ between countries, so read the official page.',
          'Find out whether you can work part-time: the rules of seven countries are in [Working while you study abroad](/blog/work-during-studies-rules-by-country).',
        ],
      },
      { t: 'cta', href: '/catalog', text: 'Programmes with prices in the catalogue' },
    ],
  },
};
