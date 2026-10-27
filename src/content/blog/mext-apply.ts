import type { Article } from '@/lib/blog/types';

export const mextApply: Article = {
  slug: 'mext-japan-scholarship-how-to-apply',
  published: '2026-11-26',
  updated: '2026-11-26',
  ru: {
    title: 'Стипендия MEXT (Япония): виды, возраст и как подать заявку',
    description: 'Как устроена стипендия правительства Японии MEXT: семь категорий, подача через посольство или университет, возрастные пределы, что оплачивается.',
    blocks: [
      { t: 'p', text: 'Стипендия MEXT — государственная стипендия Японии для иностранных студентов и исследователей. Это не одна программа, а семь категорий с разными условиями, и подать заявку можно двумя путями: через посольство или через университет. Ниже то, что сказано на официальном портале Study in Japan (проверено 27 октября 2026 года). Сроки приёма на странице не указаны: их нужно уточнять в посольстве или университете.' },
      { t: 'h2', id: 'types', text: 'Семь категорий' },
      {
        t: 'ul',
        items: [
          '**Research students** (исследователи): до 35 лет, право поступать в магистратуру или докторантуру японского вуза.',
          '**Teacher training students** (повышение квалификации преподавателей): до 35 лет, выпускники колледжа или педагогического колледжа, не менее пяти лет преподавательского стажа. Действующих преподавателей колледжей и университетов не рассматривают.',
          '**Undergraduate students** (бакалавриат): до 25 лет, 12 лет школьного образования (в том числе ожидающие выпуска).',
          '**Japanese studies students** (японистика): от 18 до 29 лет, учатся по программе японского языка или культуры в неяпонском университете и остаются там зачисленными.',
          '**College of technology students** (технический колледж): до 25 лет, не менее 11 лет образования (в том числе ожидающие выпуска).',
          '**Specialized training college students** (специализированный колледж): до 25 лет, 12 лет школьного образования или равное.',
          '**Young Leaders Program (YLP):** в принципе до 40 лет, выпускники вузов или колледжей с практическим опытом работы или молодые государственные служащие.',
        ],
      },
      { t: 'h2', id: 'routes', text: 'Два пути подачи' },
      {
        t: 'ul',
        items: [
          '**Через посольство.** Посольство или консульство Японии набирает кандидатов и проводит первичный отбор, а также требуемые документы и собеседования. Этот путь есть для всех категорий, кроме YLP.',
          '**Через университет.** Университеты рекомендуют кандидатов на основании соглашений об обмене студентами с зарубежными вузами. Путь доступен для исследователей, бакалавриата, японистики и технических колледжей. Рекомендовать могут только отдельные вузы, одобренные MEXT, и не у всех есть квоты.',
          '**YLP.** Для него на странице не указан ни один из этих путей: в сноске сказано, что рекомендации приходят от официальных зарубежных рекомендующих организаций.',
        ],
      },
      { t: 'h2', id: 'covers', text: 'Что оплачивается' },
      {
        t: 'ul',
        items: [
          '**Обучение:** плата за обучение освобождена.',
          '**Дорога:** оплачивается авиабилет туда и обратно.',
          'На странице указаны три размера ежемесячной выплаты (143 000–145 000, 117 000 и 242 000 иен), но из таблицы нельзя однозначно понять, какой категории какая сумма соответствует. Точную сумму для вашей категории смотрите в актуальных правилах набора.',
        ],
      },
      { t: 'h2', id: 'timing', text: 'Сроки' },
      {
        t: 'ul',
        items: [
          'Срок приёма заявок на странице не указан. Спросите в посольстве Японии в вашей стране или в университете, который вас интересует.',
          'Стипендиаты, рекомендованные университетами, обычно приезжают в Японию в сентябре или октябре, иногда в конце марта или начале апреля.',
        ],
      },
      { t: 'h2', id: 'plan', text: 'Как действовать' },
      {
        t: 'ol',
        items: [
          'Определите свою категорию по возрасту и образованию (см. выше).',
          'Узнайте в посольстве Японии в вашей стране, есть ли у них набор по вашей категории и когда он идёт.',
          'Если вы уже учитесь в вузе, у которого есть соглашение об обмене с японским университетом, спросите в международном отделе, есть ли у него квота на рекомендацию.',
          'Подготовьте документы по [чек-листу](/checklist): диплом, оценки, паспорт, переводы, языковой сертификат.',
          'Сравните с другими стипендиями на [странице стипендий](/scholarships) и с обзором [полностью оплаченных стипендий](/blog/fully-funded-scholarships-for-international-students).',
        ],
      },
      { t: 'p', text: 'Мы перечисляем программы и ведём вас на официальную страницу; мы не гарантируем, что вы получите стипендию.' },
      { t: 'p', text: 'Источник: [Study in Japan, стипендии MEXT](https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/).' },
      { t: 'cta', href: '/scholarships', text: 'Все стипендии' },
      { t: 'cta', href: '/checklist', text: 'Чек-лист документов' },
    ],
  },
  en: {
    title: 'MEXT scholarship (Japan): types, age limits and how to apply',
    description: 'How the Japanese government MEXT scholarship works: seven categories, applying through an embassy or a university, age limits, what is paid and what to watch out for.',
    blocks: [
      { t: 'p', text: 'The MEXT scholarship is the Japanese government scholarship for international students and researchers. It is not one programme but seven categories with different conditions, and there are two ways to apply: through an embassy or through a university. Below is what the official Study in Japan portal says (checked on 27 October 2026). The page does not state the application period: you need to ask the embassy or the university.' },
      { t: 'h2', id: 'types', text: 'The seven categories' },
      {
        t: 'ul',
        items: [
          '**Research students:** under 35, eligible for a master\'s or doctoral programme at a Japanese graduate school.',
          '**Teacher training students:** under 35, a college or teacher training college graduate, with at least five years of active teaching experience. Currently serving college and university teachers are not considered.',
          '**Undergraduate students:** under 25, with 12 years of school education (prospective graduates included).',
          '**Japanese studies students:** aged 18 to 29, enrolled in a Japanese language or culture programme at a non-Japanese university, and must remain enrolled there.',
          '**College of technology students:** under 25, with 11 or more years of education (prospective graduates included).',
          '**Specialized training college students:** under 25, with 12 years of schooling or equivalent.',
          '**Young Leaders Program (YLP):** under 40 in principle, university or college graduates with practical work experience, or young public administrators.',
        ],
      },
      { t: 'h2', id: 'routes', text: 'Two ways to apply' },
      {
        t: 'ul',
        items: [
          '**Through the embassy.** A Japanese embassy or consulate recruits and initially screens candidates, and conducts the required documents and interviews. This route exists for all categories except YLP.',
          '**Through a university.** Universities recommend candidates based on their student-exchange agreements with overseas schools. The route is available for research, undergraduate, Japanese studies and college of technology students. Only select MEXT-approved universities can recommend, and not all of them have quotas.',
          '**YLP.** The page shows neither of these routes for it: a footnote says that YLP recommendations come from official overseas recommending organisations.',
        ],
      },
      { t: 'h2', id: 'covers', text: 'What is paid' },
      {
        t: 'ul',
        items: [
          '**Tuition:** exempted.',
          '**Travel:** round-trip airfare is provided.',
          'The page lists three monthly allowance amounts (143,000-145,000, 117,000 and 242,000 yen), but the table does not make clear which amount belongs to which category. Check the current application guidelines for the rate for your category.',
        ],
      },
      { t: 'h2', id: 'timing', text: 'Timing' },
      {
        t: 'ul',
        items: [
          'The application period is not stated on the page. Ask the Japanese embassy in your country or the university you are interested in.',
          'Recipients recommended by universities usually arrive in Japan in September or October, sometimes in late March or early April.',
        ],
      },
      { t: 'h2', id: 'plan', text: 'What to do' },
      {
        t: 'ol',
        items: [
          'Find your category by age and education (see above).',
          'Ask the Japanese embassy in your country whether it recruits for your category and when.',
          'If you already study at a university that has an exchange agreement with a Japanese university, ask its international office whether it has a quota for recommendations.',
          'Prepare your documents with the [checklist](/checklist): diploma, grades, passport, translations, language certificate.',
          'Compare with other scholarships on the [scholarships page](/scholarships) and with the overview of [fully funded scholarships](/blog/fully-funded-scholarships-for-international-students).',
        ],
      },
      { t: 'p', text: 'We list the programmes and send you to the official page; we do not guarantee that you will get a scholarship.' },
      { t: 'p', text: 'Source: [Study in Japan, MEXT scholarships](https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/).' },
      { t: 'cta', href: '/scholarships', text: 'All scholarships' },
      { t: 'cta', href: '/checklist', text: 'Document checklist' },
    ],
  },
};
