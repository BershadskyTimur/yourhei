import type { Article } from '@/lib/blog/types';

// Every date, fee and rule below was read on the official pages on 18 November 2026 (not taken from the database):
//  - universityadmissions.se (UHR): key dates for the autumn semester (page dated 31 August 2026), application fee, ranking, documents,
//    English requirements, admission results, paying tuition, residence permit;
//  - migrationsverket.se: the fee (SEK 1,500), the maintenance requirement (SEK 10,656 a month for applications made in 2026; the page gives no
//    amount for 2027) and the waiting time (75 % of recent cases decided within 3 months).
// Not found on the pages read, so not stated in the text: rules on translations and apostille for Sweden, the passport requirement.
export const swedenApplication: Article = {
  slug: 'sweden-how-to-apply-universityadmissions',
  published: '2026-11-23',
  updated: '2026-11-23',
  ru: {
    title: 'Как подать заявку в вуз Швеции: universityadmissions.se, сроки, сбор',
    seoTitle: 'Universityadmissions.se 2027: подача, сроки, сбор 900 крон',
    description: 'Как поступить в вуз Швеции на осень 2027: подача через universityadmissions.se, срок 15 января, сбор 900 крон, документы, английский и вид на жительство.',
    blocks: [
      { t: 'p', text: 'Заявки в университеты Швеции подаются на одном портале — **universityadmissions.se**. На осень 2027 года первый приём идёт с **16 октября 2026 года до 15 января 2027 года**, документы нужно загрузить до **1 февраля 2027 года**, сбор за подачу — **900 шведских крон**. Ниже — порядок подачи, что нужно подтвердить и что делать после ответа вуза. Всё проверено на официальных сайтах 18 ноября 2026 года. Цены программ — в статье [Сколько стоит обучение в Швеции для иностранцев](/blog/sweden-tuition-fees-international-students).' },
      { t: 'h2', id: 'dates', text: 'Сроки на осень 2027 года' },
      {
        t: 'ul',
        items: [
          '**Первый приём** (портал рекомендует его иностранным студентам): заявки принимают с 16 октября 2026 года до 15 января 2027 года.',
          '**Документы** загружают до 1 февраля 2027 года. Заявку без оплаченного сбора или подтверждения освобождения от него портал считает неполной.',
          '**Результаты:** по магистратуре — 1 апреля 2027 года, по бакалавриату — 8 апреля 2027 года.',
          '**Второй приём** (с 15 марта до 15 апреля 2027 года) портал советует только гражданам ЕС и ЕЭЗ, которым не нужен вид на жительство. Студентам из других стран, по словам портала, скорее всего не хватит времени получить разрешение до начала семестра.',
        ],
      },
      { t: 'p', text: 'Сроки программ вузов Швеции, загруженные в наши данные, собраны в [календаре](/deadlines/se). Срок конкретной программы всегда смотрите на её странице.' },
      { t: 'h2', id: 'fee', text: 'Сбор за подачу' },
      {
        t: 'ul',
        items: [
          '**Размер:** 900 крон за семестр. Один сбор покрывает все программы и все приёмы, на которые вы подаёте в этом семестре.',
          '**Кто платит:** большинство заявителей, которые не граждане ЕС, ЕЭЗ или Швейцарии. Не платят студенты по обмену, докторанты и те, кто уже зарегистрирован на курсе или программе шведского вуза в момент подачи.',
          '**Как платить:** банковской картой на сайте портала или банковским переводом в Совет по высшему образованию (UHR) с номером-ссылкой из вашего кабинета.',
          '**Возврата нет:** сбор административный и не возвращается. Если оплатить после срока, заявка считается поздней: её рассматривают, только если у вуза остались места.',
        ],
      },
      { t: 'h2', id: 'choose', text: 'Сколько программ выбрать' },
      {
        t: 'ul',
        items: [
          '**Магистратура:** до четырёх программ.',
          '**Бакалавриат:** до восьми программ и курсов. Предложения делают в вашем порядке предпочтений, пока сумма не дойдёт до 45 кредитов; выбор, который превысил бы эту сумму, удаляется.',
          'Порядок можно менять до срока подачи, поэтому на первое место ставьте то, куда хотите попасть больше всего.',
        ],
      },
      { t: 'h2', id: 'documents', text: 'Документы' },
      {
        t: 'ul',
        items: [
          '**Магистратура:** документ о полученной степени, выписка с курсами и оценками и подтверждение английского. Остальное зависит от вуза, программы и страны, где вы учились. Документы, которые не запрашивали, портал не рассматривает.',
          '**Бакалавриат:** перечень смотрите на странице программы и в разделе портала для бакалавров.',
          '**Только официально выданные документы.** Скан должен быть официально выданным: с подписью и, где нужно, печатью учебного заведения. Если документы отправляют почтой, копии документов вуза заверяет само заведение или нотариус; печати «True certified copy» недостаточно.',
          '**Остальное зависит от страны.** На портале есть страница «Country instructions» (инструкции по странам): выберите страну, где получили образование, и сверьтесь с ней. Про перевод и апостиль на страницах портала, которые мы читали, ничего не сказано.',
        ],
      },
      { t: 'h2', id: 'english', text: 'Английский язык' },
      {
        t: 'ul',
        items: [
          '**Уровень.** Для бакалавриата нужен уровень «English 6» (английский 2-го уровня шведской школы). В магистратуре у большинства программ тот же уровень, у некоторых — «English 5» или «English 7»: точный уровень указан на странице программы.',
          '**IELTS Academic:** для English 6 — общий балл 6,5 и не ниже 5,5 в каждом разделе; для English 7 — 7,0 и не ниже 6. IELTS General Training не принимается.',
          '**TOEFL iBT и PTE.** TOEFL для результатов от 21 января 2026 года: для English 6 — 4,5 по новой шкале 1–6 (ни один раздел не ниже 4), для English 7 — 5 (не ниже 4,5). PTE Academic: 62 для English 6 (письмо — 61), 68 для English 7.',
          '**Справка из школы или вуза** обычно не подходит. Исключение — 60 кредитов ECTS обучения на английском в странах из списка на портале.',
        ],
      },
      { t: 'h2', id: 'after', text: 'После ответа вуза' },
      {
        t: 'ul',
        items: [
          '**Отвечать на предложение не нужно** (в первом приёме): от места, которое не возьмёте, откажитесь в кабинете. Во втором приёме ответ обязателен — до 16 июля 2027 года.',
          '**Плата за обучение** идёт не порталу, а вузу. Вуз пришлёт сумму первого взноса и срок. Пока взнос не оплачен, предложение остаётся предварительным.',
          '**Статус «Conditionally admitted»** у студентов с платой за обучение остаётся и после оплаты: портал не связан с платёжными системами вузов.',
        ],
      },
      { t: 'h2', id: 'permit', text: 'Вид на жительство' },
      {
        t: 'ul',
        items: [
          '**Когда подавать:** сразу после решения о зачислении и оплаты обучения: плату нужно внести до подачи. Заявление подают онлайн в Миграционную службу Швеции (Migrationsverket).',
          '**Сбор:** 1 500 крон для взрослого; при отказе не возвращается.',
          '**Деньги на жизнь:** для заявок 2026 года — не менее 10 656 крон в месяц. На заявки 2027 года сумма на странице службы пока не указана: проверьте перед подачей. Суммы других стран — в статье [Сколько денег нужно показать для студенческой визы](/blog/proof-of-funds-student-visa).',
          '**Страховка:** если учёба короче года, нужна полная медицинская страховка; при учёбе от года вас регистрируют в шведском регистре населения.',
          '**Срок рассмотрения:** по данным службы, 75 % недавних дел решены в пределах 3 месяцев. Разрешение нужно получить до приезда, поэтому подавайте сразу после результатов приёма.',
        ],
      },
      { t: 'h2', id: 'plan', text: 'План по месяцам' },
      {
        t: 'ol',
        items: [
          'Ноябрь–декабрь: выберите программы, проверьте требования и сдайте тест английского. Страницы вузов с программами, сроками и ценами: [Лундский университет](/institutions/se/lund-university), [Уппсальский университет](/institutions/se/uppsala-university), [Стокгольмский университет](/institutions/se/stockholm-university), [Гётеборгский университет](/institutions/se/university-of-gothenburg), [KTH](/institutions/se/royal-institute-of-technology), [Чалмерский технологический институт](/institutions/se/chalmers-university-of-technology).',
          'До 15 января 2027 года: подайте заявку и оплатите 900 крон.',
          'До 1 февраля 2027 года: загрузите документы.',
          'С 1 апреля (магистратура) или 8 апреля (бакалавриат): получите результаты и оплатите первый взнос за обучение, когда вуз пришлёт реквизиты.',
          'Сразу после оплаты: подайте заявление на вид на жительство вместе с подтверждением средств.',
        ],
      },
      { t: 'h2', id: 'sources', text: 'Источники' },
      { t: 'p', text: 'Сроки, сбор, документы, английский и результаты: [universityadmissions.se, сроки осеннего семестра](https://www.universityadmissions.se/en/key-dates-and-deadlines/autumn-semester-dates/) (страница обновлена 31 августа 2026 года) и другие страницы портала. Вид на жительство: [Migrationsverket](https://www.migrationsverket.se/en/you-want-to-apply/study/higher-education). Проверено 18 ноября 2026 года. Условия меняются: перед подачей сверьте их на сайтах.' },
      { t: 'cta', href: '/deadlines/se', text: 'Сроки подачи в Швеции' },
      { t: 'cta', href: '/study/se', text: 'Учёба в Швеции: направления' },
    ],
  },
  en: {
    title: 'How to apply to a Swedish university: universityadmissions.se',
    seoTitle: 'Universityadmissions.se 2027: how to apply, dates, fee',
    description: 'How to apply to a Swedish university for autumn 2027: universityadmissions.se, the 15 January deadline, SEK 900 fee, documents, English tests and the permit.',
    blocks: [
      { t: 'p', text: 'Applications to Swedish universities go through one portal: **universityadmissions.se**. For autumn 2027 the first admissions round runs from **16 October 2026 to 15 January 2027**, supporting documents are due by **1 February 2027**, and the application fee is **SEK 900**. Below: how to apply, what you must prove and what to do after a university answers. Everything was checked on the official sites on 18 November 2026. For the prices of programmes see [Tuition fees in Sweden for international students](/blog/sweden-tuition-fees-international-students).' },
      { t: 'h2', id: 'dates', text: 'Dates for autumn 2027' },
      {
        t: 'ul',
        items: [
          '**The first round** (the portal recommends it to international students): applications from 16 October 2026 to 15 January 2027.',
          '**Documents** are uploaded by 1 February 2027. The portal treats an application without a paid fee, or without proof that you are exempt, as incomplete.',
          '**Results:** master\'s on 1 April 2027, bachelor\'s on 8 April 2027.',
          '**The second round** (15 March to 15 April 2027) is recommended by the portal only for EU and EEA citizens who do not need a residence permit. Students from other countries, it says, will most likely not have time to obtain a permit before the semester starts.',
        ],
      },
      { t: 'p', text: 'The deadlines of Swedish programmes in our data are collected in the [calendar](/deadlines/se). Always check the deadline on the programme page itself.' },
      { t: 'h2', id: 'fee', text: 'The application fee' },
      {
        t: 'ul',
        items: [
          '**Amount:** SEK 900 per semester. One fee covers all the programmes and rounds you apply to in that semester.',
          '**Who pays:** most applicants who are not citizens of the EU, the EEA or Switzerland. Exchange students, doctoral students and people already registered on a course or programme at a Swedish university when they apply do not pay.',
          '**How to pay:** by bank card on the portal, or by bank transfer to the Swedish Council for Higher Education (UHR) with the reference number from your account.',
          '**No refund:** the fee is administrative and is not refunded. If you pay after the deadline the application counts as late: it is considered only if the university still has places.',
        ],
      },
      { t: 'h2', id: 'choose', text: 'How many programmes to choose' },
      {
        t: 'ul',
        items: [
          '**Master\'s:** up to four programmes.',
          '**Bachelor\'s:** up to eight courses and programmes. Offers are made in your order of preference until the total reaches 45 credits; a choice that would take it over that total is deleted.',
          'You can change the order until the deadline, so put first the one you want most.',
        ],
      },
      { t: 'h2', id: 'documents', text: 'Documents' },
      {
        t: 'ul',
        items: [
          '**Master\'s:** documentation of your completed degree, a transcript with courses and grades, and proof of English. The rest depends on the university, the programme and the country where you studied. Documents that were not requested are not considered.',
          '**Bachelor\'s:** see the programme page and the bachelor\'s section of the portal for the list.',
          '**Officially issued documents only.** A scan must be officially issued: signed and, where appropriate, stamped by the issuing institution. If documents are sent by post, copies of university documents are certified by the institution itself or by a notary; a stamp reading only "True certified copy" is not enough.',
          '**The rest depends on the country.** The portal has a "Country instructions" page: choose the country where you got your education and check it. The portal pages we read say nothing about translations or apostille.',
        ],
      },
      { t: 'h2', id: 'english', text: 'English' },
      {
        t: 'ul',
        items: [
          '**Level.** A bachelor\'s needs "English 6" (the Swedish school\'s English level 2). Most master\'s programmes ask for the same level, some for "English 5" or "English 7": the programme page states which.',
          '**IELTS Academic:** for English 6 an overall 6.5 and no section below 5.5; for English 7, 7.0 and no section below 6. IELTS General Training is not accepted.',
          '**TOEFL iBT and PTE.** TOEFL for results from 21 January 2026: for English 6, 4.5 on the new 1–6 scale (no section below 4); for English 7, 5 (no section below 4.5). PTE Academic: 62 for English 6 (writing 61), 68 for English 7.',
          '**A letter from a school or university** is usually not enough. The exception is 60 ECTS credits of study in English in the countries on the portal\'s list.',
        ],
      },
      { t: 'h2', id: 'after', text: 'After the university answers' },
      {
        t: 'ul',
        items: [
          '**You do not have to reply** to an offer (in the first round): decline a place you will not take in your account. In the second round a reply is required, by 16 July 2027.',
          '**Tuition** is paid to the university, not to the portal. The university sends the amount of the first instalment and the deadline. Until it is paid the offer stays preliminary.',
          '**The status "Conditionally admitted"** stays for students who pay tuition even after they have paid: the portal is not connected to the universities\' payment systems.',
        ],
      },
      { t: 'h2', id: 'permit', text: 'The residence permit' },
      {
        t: 'ul',
        items: [
          '**When to apply:** right after the admission decision and the tuition payment: the tuition must be paid before you apply. You apply online to the Swedish Migration Agency (Migrationsverket).',
          '**The fee:** SEK 1,500 for an adult; it is not refunded if the application is rejected.',
          '**Money for living:** at least SEK 10,656 a month for applications made in 2026. The agency\'s page gives no amount for applications in 2027 yet: check before you apply. The amounts for other countries are in [How much money you must show for a student visa](/blog/proof-of-funds-student-visa).',
          '**Insurance:** if your studies last less than a year you need comprehensive health insurance; if they last a year or more you are registered in Sweden\'s population register.',
          '**Processing time:** according to the agency 75% of recently decided cases were decided within 3 months. You need the permit before you travel, so apply as soon as the admission results are out.',
        ],
      },
      { t: 'h2', id: 'plan', text: 'A plan by month' },
      {
        t: 'ol',
        items: [
          'November–December: choose programmes, check the requirements and take an English test. Institution pages with programmes, deadlines and prices: [Lund University](/institutions/se/lund-university), [Uppsala University](/institutions/se/uppsala-university), [Stockholm University](/institutions/se/stockholm-university), [University of Gothenburg](/institutions/se/university-of-gothenburg), [KTH Royal Institute of Technology](/institutions/se/royal-institute-of-technology), [Chalmers University of Technology](/institutions/se/chalmers-university-of-technology).',
          'By 15 January 2027: submit the application and pay SEK 900.',
          'By 1 February 2027: upload your documents.',
          'From 1 April (master\'s) or 8 April (bachelor\'s): read the results and pay the first tuition instalment when the university sends the details.',
          'Right after paying: apply for the residence permit with proof of funds.',
        ],
      },
      { t: 'h2', id: 'sources', text: 'Sources' },
      { t: 'p', text: 'Dates, fee, documents, English and results: [universityadmissions.se, autumn semester dates](https://www.universityadmissions.se/en/key-dates-and-deadlines/autumn-semester-dates/) (page updated 31 August 2026) and other pages of the portal. The residence permit: [Migrationsverket](https://www.migrationsverket.se/en/you-want-to-apply/study/higher-education). Checked on 18 November 2026. Conditions change: check them on the sites before you apply.' },
      { t: 'cta', href: '/deadlines/se', text: 'Application deadlines in Sweden' },
      { t: 'cta', href: '/study/se', text: 'Study in Sweden: fields' },
    ],
  },
};
