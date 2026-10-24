import type { Article } from '@/lib/blog/types';

export const germanyApplication: Article = {
  slug: 'germany-how-to-apply-uni-assist',
  published: '2026-10-24',
  updated: '2026-10-24',
  ru: {
    title: 'Как подать заявку в университет Германии: сроки и uni-assist',
    description: 'Куда подавать документы в Германии: uni-assist, сам вуз или Stiftung für Hochschulzulassung. Сроки на зимний и летний семестр, сборы и требования к документам.',
    blocks: [
      { t: 'p', text: 'В Германии нет единого окна для всех вузов: куда подавать заявку, зависит от вашей страны, аттестата и направления. Ниже — что сказано на официальной странице DAAD о порядке подачи, сроках и документах (проверено 24 октября 2026 года). Конкретные даты каждого вуза всегда уточняйте у самого вуза.' },
      { t: 'h2', id: 'where', text: 'Куда подавать заявку' },
      {
        t: 'ul',
        items: [
          '**Напрямую в вуз,** через uni-assist или в **Stiftung für Hochschulzulassung**: выбор зависит от страны, вашей квалификации и предмета.',
          '**uni-assist** — служба, через которую иностранные абитуриенты подают заявки в вузы-участники: она проверяет и предварительно оценивает документы.',
          '**Stiftung für Hochschulzulassung** распределяет места на программы с общегерманским ограничением приёма: медицина, фармация, ветеринария и стоматология (numerus clausus).',
          '**Ограничения на уровне вуза.** Некоторые программы ограничены только в отдельных вузах, и вуз может добавить свои критерии: тесты или собеседования.',
        ],
      },
      { t: 'h2', id: 'deadlines', text: 'Сроки' },
      {
        t: 'ul',
        items: [
          '**Зимний семестр** (начало в сентябре–октябре): приём заявок начинается в начале мая и заканчивается 15 июля. Письма о зачислении приходят в августе–сентябре.',
          '**Летний семестр** (начало в марте–апреле): приём с начала декабря до 15 января. Письма о зачислении приходят в феврале–марте.',
          '**Отказы** часто присылают несколько позже.',
          '**Частные вузы** могут устанавливать другие сроки, а для программ с ограниченным числом мест сроки бывают значительно раньше. Уточняйте дату на странице программы.',
        ],
      },
      { t: 'p', text: 'Сроки подачи в программы вузов Германии, загруженные в наши данные, собраны в [календаре](/deadlines/de).' },
      { t: 'h2', id: 'documents', text: 'Документы и сборы' },
      {
        t: 'ul',
        items: [
          '**Копии и переводы.** По данным DAAD, для подачи принимаются только официально заверенные копии и переводы. Заверить их можно, например, в посольстве Германии в вашей стране (это платно). Некоторые вузы принимают и документы на английском и французском: уточните у вуза.',
          '**Сбор uni-assist.** Проверка и предварительная оценка документов стоит 75 евро за первый выбор программы и 30 евро за каждую следующую заявку в тот же семестр. Вузы могут брать и собственные сборы.',
          '**Полный список документов** зависит от вуза и страны: его подтверждает международный отдел вуза.',
        ],
      },
      { t: 'h2', id: 'costs', text: 'Деньги и виза' },
      { t: 'p', text: 'Плата за обучение в Германии есть не везде: что бесплатно и где есть исключения, разобрано в статье [Бесплатно ли учиться в Германии, Чехии и Финляндии](/blog/free-tuition-germany-czechia-finland). Для визы нужно подтвердить средства на жизнь: суммы по странам собраны в статье [Сколько денег нужно показать для студенческой визы](/blog/proof-of-funds-student-visa).' },
      { t: 'h2', id: 'plan', text: 'Как спланировать' },
      {
        t: 'ol',
        items: [
          'Выберите программы в [каталоге](/catalog) и откройте страницу каждой: там указаны срок подачи и ссылка на официальную страницу.',
          'Выясните, как подавать именно в этот вуз: напрямую или через uni-assist.',
          'Закажите заверенные копии и переводы заранее: они занимают время. Отмечайте готовое в [чек-листе документов](/checklist).',
          'Подайте заявку до срока и заложите запас: срок вуза важнее общих дат из этой статьи.',
        ],
      },
      {
        t: 'p',
        text: 'Источник: [DAAD, процесс подачи заявки](https://www.daad.de/en/studying-in-germany/requirements/application-process/).',
      },
      { t: 'cta', href: '/deadlines/de', text: 'Сроки подачи в Германии' },
      { t: 'cta', href: '/catalog', text: 'Найти программы' },
    ],
  },
  en: {
    title: 'How to apply to a German university: deadlines and uni-assist',
    description: 'Where to send your documents in Germany: uni-assist, the university or the Stiftung für Hochschulzulassung. Deadlines for both semesters, fees and documents.',
    blocks: [
      { t: 'p', text: 'Germany has no single window for all universities: where you apply depends on your country, your qualification and the subject. Below is what the official DAAD page says about how to apply, the deadlines and the documents (checked on 24 October 2026). Always confirm the exact dates of each university with the university itself.' },
      { t: 'h2', id: 'where', text: 'Where to apply' },
      {
        t: 'ul',
        items: [
          '**Directly to the university,** through uni-assist, or to the **Stiftung für Hochschulzulassung**: the choice depends on your country, your entrance qualification and the subject.',
          '**uni-assist** is a service through which international applicants apply to participating universities: it checks and preliminarily assesses the documents.',
          '**The Stiftung für Hochschulzulassung** allocates places in programmes with a Germany-wide admission restriction: medicine, pharmacy, veterinary medicine and dentistry (numerus clausus).',
          '**Restrictions at university level.** Some programmes are restricted only at particular universities, and a university may add its own criteria such as tests or interviews.',
        ],
      },
      { t: 'h2', id: 'deadlines', text: 'Deadlines' },
      {
        t: 'ul',
        items: [
          '**Winter semester** (starting in September–October): applications open in early May and close on 15 July. Admission letters arrive in August–September.',
          '**Summer semester** (starting in March–April): applications from early December to 15 January. Admission letters arrive in February–March.',
          '**Rejections** are often sent somewhat later.',
          '**Private universities** may set different deadlines, and programmes with a limited number of places can have significantly earlier ones. Check the date on the programme page.',
        ],
      },
      { t: 'p', text: 'The deadlines of German programmes in our data are collected in the [calendar](/deadlines/de).' },
      { t: 'h2', id: 'documents', text: 'Documents and fees' },
      {
        t: 'ul',
        items: [
          '**Copies and translations.** According to DAAD, only officially certified copies and translations are accepted. You can have them certified, for example, at a German embassy in your country (there is a fee). Some universities also accept documents in English and French: check with the university.',
          '**The uni-assist fee.** The assessment and preliminary review of documents costs EUR 75 for the first choice of study and EUR 30 for each further application in the same semester. Universities may also charge fees of their own.',
          '**The full list of documents** depends on the university and the country: the International Office of the university confirms it.',
        ],
      },
      { t: 'h2', id: 'costs', text: 'Money and the visa' },
      { t: 'p', text: 'Tuition in Germany is not free everywhere: what is free and where the exceptions are is in [Is study free in Germany, Czechia and Finland?](/blog/free-tuition-germany-czechia-finland). For the visa you must prove funds for your living: the amounts by country are in [How much money you must show for a student visa](/blog/proof-of-funds-student-visa).' },
      { t: 'h2', id: 'plan', text: 'How to plan' },
      {
        t: 'ol',
        items: [
          'Choose programmes in the [catalogue](/catalog) and open each page: it shows the deadline and the link to the official page.',
          'Find out how to apply to this particular university: directly or through uni-assist.',
          'Order certified copies and translations early: they take time. Tick off what is ready in the [document checklist](/checklist).',
          'Apply before the deadline and keep a reserve: the university’s deadline matters more than the general dates in this article.',
        ],
      },
      {
        t: 'p',
        text: 'Source: [DAAD, application process](https://www.daad.de/en/studying-in-germany/requirements/application-process/).',
      },
      { t: 'cta', href: '/deadlines/de', text: 'Application deadlines in Germany' },
      { t: 'cta', href: '/catalog', text: 'Find programmes' },
    ],
  },
};
