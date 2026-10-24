import type { Article } from '@/lib/blog/types';

export const czechiaApplication: Article = {
  slug: 'czechia-how-to-apply-universities',
  published: '2026-12-03',
  updated: '2026-12-03',
  ru: {
    title: 'Как поступить в университет Чехии: сроки, документы, нострификация',
    description: 'В Чехии нет единой системы подачи: каждый вуз принимает заявки сам. Сроки с февраля по апрель, список документов, признание диплома, вступительные экзамены и сборы.',
    blocks: [
      { t: 'p', text: 'В Чехии нет единой формы подачи для всех вузов: каждый университет принимает заявки в своей онлайн-системе. Ниже — что сказано на официальной странице Study in Czechia (проверено 24 октября 2026 года). Точные даты и условия подтверждайте у выбранного вуза.' },
      { t: 'h2', id: 'process', text: 'Как проходит подача' },
      {
        t: 'ul',
        items: [
          '**Единого окна нет.** Заявки обычно подаются через онлайн-систему самого вуза. Подавать можно на несколько программ, каждая заявка оформляется и оплачивается отдельно.',
          '**Сроки.** Для программ с началом в сентябре многие сроки приходятся на период с февраля по апрель, но бывают и раньше или позже. Вступительные экзамены или собеседования могут пройти весной или в начале лета.',
          '**Результаты.** Решения обычно объявляют в июне–июле: через систему подачи, по электронной почте или официальным письмом, как правило, до конца июня.',
        ],
      },
      { t: 'p', text: 'Сроки чешских программ, загруженные в наши данные, собраны в [календаре для Чехии](/deadlines/cz).' },
      { t: 'h2', id: 'timeline', text: 'Когда начинать готовиться' },
      {
        t: 'ul',
        items: [
          '**За 12–18 месяцев до учёбы:** изучить программы, цены и требования.',
          '**За 9–12 месяцев:** проверить требования к документам и языку.',
          '**За 6–9 месяцев:** подготовить документы и начать процедуру признания, если она нужна.',
        ],
      },
      { t: 'h2', id: 'documents', text: 'Документы' },
      { t: 'p', text: 'На странице перечислены, в зависимости от вуза и программы: анкета, подтверждение оплаты сбора, диплом, оценки (transcript), документы о признании, языковой сертификат, копия паспорта или удостоверения личности, резюме, мотивационное письмо, рекомендательное письмо и портфолио для творческих программ. Часть документов может потребовать заверения, перевода или легализации, на это нужно время. Отмечать готовое можно в [чек-листе](/checklist).' },
      { t: 'h2', id: 'recognition', text: 'Признание образования (нострификация)' },
      {
        t: 'ul',
        items: [
          '**Нострификация через чешский орган.** Она шире по действию, но может занять больше времени.',
          '**Признание в рамках приёма,** если вуз предлагает такой вариант. Обычно оно действует только для этого вуза или факультета.',
        ],
      },
      { t: 'h2', id: 'exams', text: 'Экзамены и сборы' },
      {
        t: 'ul',
        items: [
          '**Вступительные испытания** зависят от программы: экзамен, собеседование, портфолио или тест способностей; бывают программы, где решают по документам. Формат может быть очным в Чехии, онлайн или в партнёрских учреждениях за рубежом.',
          '**Сбор за подачу** обычно составляет до примерно 1 000 чешских крон за заявку и зависит от вуза и программы.',
        ],
      },
      { t: 'h2', id: 'after', text: 'После зачисления' },
      { t: 'p', text: 'Страница советует оформлять визу как можно раньше после получения официального письма о зачислении: процедура может занять до 60 дней. Подтвердите место, отправьте недостающие документы, оплатите обучение, если оно платное, и готовьтесь к зачислению. Правила платы за обучение (бесплатно на чешском, обычно платно на английском) разобраны в статье [Бесплатно ли учиться в Германии, Чехии и Финляндии](/blog/free-tuition-germany-czechia-finland).' },
      {
        t: 'p',
        text: 'Источник: [Study in Czechia, как подать заявку в университеты Чехии](https://studyin.gov.cz/plan-your-studies/how-to-apply/).',
      },
      { t: 'cta', href: '/deadlines/cz', text: 'Сроки подачи в Чехии' },
      { t: 'cta', href: '/catalog', text: 'Найти программы' },
    ],
  },
  en: {
    title: 'How to apply to a Czech university: deadlines, documents, recognition',
    description: 'Czechia has no central application system: each university takes applications itself. Deadlines, documents, recognition of a degree, entrance exams and fees.',
    blocks: [
      { t: 'p', text: 'Czechia has no single application form for all universities: each university takes applications in its own online system. Below is what the official Study in Czechia page says (checked on 24 October 2026). Confirm the exact dates and conditions with your chosen university.' },
      { t: 'h2', id: 'process', text: 'How the application goes' },
      {
        t: 'ul',
        items: [
          '**There is no single window.** Applications usually go through the university’s own online system. You can apply to several programmes, and each application is submitted and paid for separately.',
          '**Deadlines.** For programmes starting in September, many deadlines fall between February and April, though some are earlier or later. Entrance exams or interviews may follow in spring or early summer.',
          '**Results.** Decisions are usually announced in June–July: through the application system, by e-mail or by official letter, usually by the end of June.',
        ],
      },
      { t: 'p', text: 'The deadlines of Czech programmes in our data are collected in the [calendar for Czechia](/deadlines/cz).' },
      { t: 'h2', id: 'timeline', text: 'When to start preparing' },
      {
        t: 'ul',
        items: [
          '**12 to 18 months before studies:** explore programmes, fees and requirements.',
          '**9 to 12 months:** check the document and language requirements.',
          '**6 to 9 months:** prepare the documents and start the recognition process if you need it.',
        ],
      },
      { t: 'h2', id: 'documents', text: 'Documents' },
      { t: 'p', text: 'Depending on the university and the programme, the page lists: the application form, proof of payment of the fee, a diploma, a transcript, recognition documents, a language certificate, a copy of the passport or ID, a CV, a motivation letter, a recommendation letter and a portfolio for creative programmes. Some documents may need certification, translation or legalisation, which takes time. You can tick off what is ready in the [checklist](/checklist).' },
      { t: 'h2', id: 'recognition', text: 'Recognition of your education (nostrification)' },
      {
        t: 'ul',
        items: [
          '**Nostrification through the Czech authority.** It is broader in effect but may take longer.',
          '**Recognition within the admission procedure,** if the university offers it. It is usually valid only for that university or faculty.',
        ],
      },
      { t: 'h2', id: 'exams', text: 'Exams and fees' },
      {
        t: 'ul',
        items: [
          '**Entrance tests** depend on the programme: an exam, an interview, a portfolio or a talent test; some programmes decide on documents alone. The format may be in Czechia, online, or at partner institutions abroad.',
          '**The application fee** is usually up to around 1,000 CZK per application and depends on the university and the programme.',
        ],
      },
      { t: 'h2', id: 'after', text: 'After admission' },
      { t: 'p', text: 'The page advises applying for your visa as early as possible after receiving the official admission letter: the process can take up to 60 days. Confirm your place, submit any missing documents, pay tuition if it applies, and prepare for enrolment. The rules for tuition (free in Czech, usually paid in English) are in [Is study free in Germany, Czechia and Finland?](/blog/free-tuition-germany-czechia-finland).' },
      {
        t: 'p',
        text: 'Source: [Study in Czechia, how to apply to universities in Czechia](https://studyin.gov.cz/plan-your-studies/how-to-apply/).',
      },
      { t: 'cta', href: '/deadlines/cz', text: 'Application deadlines in Czechia' },
      { t: 'cta', href: '/catalog', text: 'Find programmes' },
    ],
  },
};
