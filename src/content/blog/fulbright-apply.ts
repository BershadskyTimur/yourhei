import type { Article } from '@/lib/blog/types';

export const fulbrightApply: Article = {
  slug: 'fulbright-foreign-student-program-how-to-apply',
  published: '2026-12-03',
  updated: '2026-12-03',
  ru: {
    title: 'Fulbright Foreign Student Program: как устроена стипендия США',
    description: 'Стипендия Fulbright для иностранных магистрантов и специалистов в США: подача через комиссию или посольство, два способа подбора вуза.',
    blocks: [
      { t: 'p', text: 'Fulbright Foreign Student Program — стипендия, которая позволяет выпускникам, молодым специалистам и художникам из-за рубежа учиться и вести исследования в США. Главное, что нужно знать сразу: **условия зависят от вашей страны**. Ниже то, что сказано на официальной странице программы (проверено 27 октября 2026 года), и то, чего на ней нет.' },
      { t: 'h2', id: 'what', text: 'Что это за программа' },
      {
        t: 'ul',
        items: [
          'Программа рассчитана на выпускников (graduate students), молодых специалистов и художников из других стран.',
          'Страница не разделяет магистратуру и исследовательскую докторантуру.',
          'Правила допуска и отбора сильно различаются по странам. Если вашей страны нет в выпадающем списке на сайте, вы не имеете права подавать заявку.',
        ],
      },
      { t: 'h2', id: 'how', text: 'Как подать заявку' },
      {
        t: 'ul',
        items: [
          'Граждане других стран подают заявку через Комиссию или Фонд Fulbright либо через посольство США в своей стране.',
          'Страница не описывает сами шаги подачи: их уточняйте в офисе Fulbright вашей страны.',
          'Сроки на странице не указаны. Материалы нужно подавать «в установленные для страны и награды сроки», поэтому сроки смотрите в офисе вашей страны.',
        ],
      },
      { t: 'h2', id: 'placement', text: 'Две модели подбора вуза' },
      {
        t: 'ul',
        items: [
          '**IIE-Placement.** Команда подбора Института международного образования (IIE) подаёт заявки в вузы от имени кандидата, ведёт процесс поступления и договаривается о финансировании.',
          '**Self-Placement.** Кандидат сам подаёт документы в университеты, сам добивается зачисления и финансирования. IIE в этом не участвует.',
        ],
      },
      { t: 'h2', id: 'missing', text: 'Чего нет на странице' },
      {
        t: 'ul',
        items: [
          'Нет списка того, что покрывает стипендия. Для кандидатов с подбором через IIE сказано только, что команда «будет договариваться о финансировании», а кандидаты с самостоятельным подбором обеспечивают финансирование сами.',
          'Нет требований к английскому: тесты на странице не упомянуты.',
          'Нет подробностей об уровнях, возрастных ограничениях и критериях отбора. Всё это уточняйте в Комиссии Fulbright или посольстве США в вашей стране.',
        ],
      },
      { t: 'h2', id: 'plan', text: 'Как действовать' },
      {
        t: 'ol',
        items: [
          'Откройте сайт программы и проверьте в списке, есть ли ваша страна.',
          'Найдите офис Fulbright или посольство США в вашей стране и узнайте условия, сроки и документы.',
          'Выясните, какая модель подбора вуза у вас: через IIE или самостоятельная.',
          'Подготовьте документы по [чек-листу](/checklist): диплом, оценки, паспорт, переводы, языковой сертификат.',
          'Сравните с другими стипендиями на [странице стипендий](/scholarships) и с обзором [полностью оплаченных стипендий](/blog/fully-funded-scholarships-for-international-students).',
        ],
      },
      { t: 'p', text: 'Мы перечисляем программы и ведём вас на официальную страницу; мы не гарантируем, что вы получите стипендию.' },
      { t: 'p', text: 'Источник: [Fulbright Foreign Student Program](https://foreign.fulbrightonline.org/about/foreign-student-program).' },
      { t: 'cta', href: '/scholarships', text: 'Все стипендии' },
      { t: 'cta', href: '/checklist', text: 'Чек-лист документов' },
    ],
  },
  en: {
    title: 'Fulbright Foreign Student Program: how the US scholarship works',
    description: 'The Fulbright scholarship for foreign graduate students and young professionals in the US: applying via a commission or embassy, two placement models.',
    blocks: [
      { t: 'p', text: 'The Fulbright Foreign Student Program is a scholarship that lets graduate students, young professionals and artists from abroad study and conduct research in the United States. The main thing to know right away: **the conditions depend on your country**. Below is what the official programme page says (checked on 27 October 2026), and what it does not say.' },
      { t: 'h2', id: 'what', text: 'What this programme is' },
      {
        t: 'ul',
        items: [
          'The programme is for graduate students, young professionals and artists from other countries.',
          'The page does not separate master\'s study from doctoral research.',
          'Eligibility and selection procedures vary widely by country. If your country is not in the dropdown on the website, you are not eligible to apply.',
        ],
      },
      { t: 'h2', id: 'how', text: 'How to apply' },
      {
        t: 'ul',
        items: [
          'Non-US citizens apply through the Fulbright Commission or Foundation or the US Embassy in their home country.',
          'The page does not describe the application steps themselves: check them with the Fulbright office of your country.',
          'The page gives no dates. Materials must be submitted "per established country/award deadlines," so look up the deadlines with the office in your country.',
        ],
      },
      { t: 'h2', id: 'placement', text: 'Two placement models' },
      {
        t: 'ul',
        items: [
          '**IIE-Placement.** The placement team of the Institute of International Education (IIE) applies to institutions on the candidate\'s behalf, manages admissions and negotiates funding.',
          '**Self-Placement.** Candidates apply to universities directly and secure their own admission and funding. IIE is not involved.',
        ],
      },
      { t: 'h2', id: 'missing', text: 'What the page leaves out' },
      {
        t: 'ul',
        items: [
          'There is no list of what the scholarship covers. For IIE-placed candidates it says only that the team "will negotiate funding," and self-placed candidates secure funding on their own.',
          'There are no English requirements: tests are not mentioned on the page.',
          'There are no details on levels, age limits or selection criteria. Check all of this with the Fulbright Commission or the US Embassy in your country.',
        ],
      },
      { t: 'h2', id: 'plan', text: 'What to do' },
      {
        t: 'ol',
        items: [
          'Open the programme website and check in the list whether your country is there.',
          'Find the Fulbright office or the US Embassy in your country and learn the conditions, dates and documents.',
          'Find out which placement model applies to you: through IIE or self-placement.',
          'Prepare your documents with the [checklist](/checklist): diploma, grades, passport, translations, language certificate.',
          'Compare with other scholarships on the [scholarships page](/scholarships) and with the overview of [fully funded scholarships](/blog/fully-funded-scholarships-for-international-students).',
        ],
      },
      { t: 'p', text: 'We list the programmes and send you to the official page; we do not guarantee that you will get a scholarship.' },
      { t: 'p', text: 'Source: [Fulbright Foreign Student Program](https://foreign.fulbrightonline.org/about/foreign-student-program).' },
      { t: 'cta', href: '/scholarships', text: 'All scholarships' },
      { t: 'cta', href: '/checklist', text: 'Document checklist' },
    ],
  },
};
