import type { Article } from '@/lib/blog/types';

// Every date, fee and rule below was read on ucas.com on 18 November 2026 (undergraduate entry in 2027):
//  - the dates and deadlines page, "filling in your application", the personal statement and reference pages, "replying to your offers",
//    UCAS Extra, UCAS Conservatoires, and the pages for international students (English tests, entry requirements, visas, finance).
// Not found on the pages read, so deliberately not stated: the application fee for a single choice, the UCAS rules on translations,
// whether postgraduate study goes through UCAS, the limits for medicine and for Oxford against Cambridge, the money amounts for the visa
// (UCAS quotes figures that may predate April 2026; the article links to the visa-funds article instead).
// Our own data (Discover Uni, HESA) has no deadlines or fees, so nothing here comes from the database.
export const ucasApplication: Article = {
  slug: 'ucas-how-to-apply-uk-universities',
  published: '2026-12-03',
  updated: '2026-12-03',
  ru: {
    title: 'Как подать заявку в вузы Великобритании через UCAS: сроки 2027',
    seoTitle: 'UCAS 2027: сроки подачи, сбор 34,50 £ и 5 программ',
    description: 'Как поступить в вуз Великобритании через UCAS на 2027 год: срок 13 января, до пяти программ, сбор 34,50 £, личное заявление, рекомендация и ответ на предложения.',
    blocks: [
      { t: 'p', text: 'Заявки в бакалавриат британских вузов подаются через единый портал **UCAS**. На 2027 год заявки открылись 12 мая 2026 года, готовую заявку можно отправлять с 1 сентября 2026 года, а срок «равного рассмотрения» для большинства программ — **13 января 2027 года, 18:00 по британскому времени**. Для Оксфорда, Кембриджа и большинства программ по медицине, стоматологии и ветеринарии срок был 15 октября 2026 года: он уже прошёл. Ниже — сроки, число программ, сбор, личное заявление, рекомендация и то, что важно иностранцам. Всё проверено на сайте UCAS 18 ноября 2026 года. Статья про бакалавриат: сроки магистратуры другие (так сказано на UCAS), условия смотрите у вуза.' },
      { t: 'h2', id: 'dates', text: 'Сроки на 2027 год' },
      {
        t: 'ul',
        items: [
          '**Открытие.** Заявки на 2027 год открылись 12 мая 2026 года. С 1 сентября 2026 года готовую заявку можно отправить в UCAS: для этого нужна рекомендация.',
          '**15 октября 2026 года, 18:00 по британскому времени:** срок для Оксфорда, Кембриджа и большинства программ по медицине, стоматологии и ветеринарии. Он уже прошёл.',
          '**13 января 2027 года, 18:00 по британскому времени:** срок «равного рассмотрения» для большинства программ бакалавриата.',
          '**После срока.** Заявки, полученные до 18:00 30 июня 2027 года, отправят в вузы; позже заявки автоматически попадают в Clearing (приём на оставшиеся места), который открывается 2 июля 2027 года. Последний срок на 2027 год — 18:00 23 сентября 2027 года.',
          '**Для иностранцев** отдельных сроков UCAS не называет. На странице сказано, что многие вузы принимают заявки от иностранных студентов и позже, ближе к началу курса, но срок равного рассмотрения лучше не пропускать.',
        ],
      },
      { t: 'h2', id: 'choices', text: 'Программы, сбор, заявление и рекомендация' },
      {
        t: 'ul',
        items: [
          '**Сколько программ.** Всего до пяти. Позже можно добавить программы с другим сроком, но общая сумма остаётся пять.',
          '**Сбор:** 34,50 £ за заявку на 2027 год, до пяти программ. Сбор за одну программу на прочитанных страницах не указан.',
          '**Личное заявление:** до 4 000 знаков с пробелами. По описанию UCAS, оно теперь состоит из трёх вопросов: зачем вам эта программа; как квалификации и учёба помогли подготовиться; что ещё вы сделали вне учёбы и чем это полезно. В каждом ответе минимум 350 знаков.',
          '**Рекомендация:** нужна одна, от человека, который не родственник, не друг и не партнёр. Её онлайн и по-английски пишет сам рекомендатель (в школе или колледже это учитель или куратор). Пока рекомендация не добавлена, заявку отправить нельзя.',
        ],
      },
      { t: 'h2', id: 'international', text: 'Что важно иностранцам' },
      {
        t: 'ul',
        items: [
          '**Английский.** Для программ уровня степени вузы, как правило, ждут уровень B2 по шкале CEFR (в таблице UCAS это IELTS 6–6,5). Нужный уровень зависит от вуза и даже от программы: уточняйте у самого вуза. Для визы тест должен быть из числа одобренных Home Office (SELT): UCAS называет IELTS и Trinity ISE (в британском центре Trinity).',
          '**Документы об образовании.** Многие вузы принимают зарубежные квалификации, эквивалентные британским: смотрите сайт вуза или спросите его. Заключение о соответствии британским квалификациям можно получить в UK ENIC. Для 2027 года UCAS вводит сервис загрузки документов (например, сертификатов английского) для всех студентов. Про переводы на прочитанных страницах UCAS ничего не сказано.',
          '**Виза.** После безусловного предложения вуз со спонсорской лицензией может выдать CAS (подтверждение зачисления), с ним подают на визу. Если вы за пределами Великобритании, подавать можно за шесть месяцев до начала курса; решение обычно приходит до 15 дней. UCAS советует не ждать августа. Суммы, которые нужно показать, — в статье [Сколько денег нужно показать для студенческой визы](/blog/proof-of-funds-student-visa).',
          '**Деньги.** По UCAS, год бакалавриата для иностранца стоит от 11 400 до 38 000 £, точную цену смотрите у программы. Студенческий кредит от британского правительства иностранцу вряд ли дадут. Стипендии, которые называет UCAS: Chevening, Commonwealth и GREAT; про первую — в статье [Chevening: кто получит стипендию Великобритании и когда подавать](/blog/chevening-scholarship-how-to-apply).',
        ],
      },
      { t: 'h2', id: 'after', text: 'После подачи' },
      {
        t: 'ul',
        items: [
          '**Ответ на предложения** на 2027 год: если последнее решение пришло до 31 марта 2027 года, ответить нужно до 5 мая; если до 12 мая — до 2 июня; если до 14 июля — до 21 июля. Поменять ответ можно до 22 июля 2027 года.',
          '**Выбор:** можно принять одно основное предложение (firm) и, если хотите, одно запасное (insurance).',
          '**UCAS Extra** (с 25 февраля по 1 июля 2027 года) доступен, если вы подали пять программ и получили отказы или отказались от всех предложений. Добавить можно одну программу за раз, запасной выбор в этом случае недоступен.',
          '**Музыка и театр:** консерватории подают отдельно через UCAS Conservatoires: до шести программ, сбор 34,50 £ на 2027 год.',
        ],
      },
      { t: 'h2', id: 'plan', text: 'Порядок действий' },
      {
        t: 'ol',
        items: [
          'Выберите до пяти программ и проверьте на сайте каждого вуза требования к документам и английскому.',
          'Договоритесь о рекомендации заранее: без неё заявку не отправить.',
          'Напишите заявление: три ответа, в каждом не меньше 350 знаков, всего до 4 000 знаков с пробелами.',
          'Запишитесь на тест английского заранее: нужный уровень зависит от вуза.',
          'Отправьте заявку до 18:00 по британскому времени 13 января 2027 года, лучше заранее.',
        ],
      },
      { t: 'h2', id: 'sources', text: 'Источники' },
      { t: 'p', text: 'UCAS: [сроки подачи](https://www.ucas.com/applying/applying-to-university/dates-and-deadlines-for-uni-applications), [заполнение заявки](https://www.ucas.com/applying/applying-to-university/filling-in-your-ucas-application), [личное заявление](https://www.ucas.com/applying/applying-to-university/writing-your-personal-statement/how-to-write-your-personal-statement), [рекомендация](https://www.ucas.com/applying/applying-university/how-get-ucas-reference), [ответ на предложения](https://www.ucas.com/applying/after-you-apply/types-of-offers/replying-to-your-offers), [UCAS Extra](https://www.ucas.com/undergraduate/after-you-apply/types-offer/extra-choices), [для иностранных студентов](https://www.ucas.com/international/international-students/applying-to-university-as-an-international-student), [консерватории](https://www.ucas.com/conservatoires/applying-through-ucas-conservatoires). Проверено 18 ноября 2026 года. Условия меняются: перед подачей сверьте их на сайте UCAS.' },
      { t: 'cta', href: '/study/gb', text: 'Учёба в Великобритании: направления' },
      { t: 'cta', href: '/institutions/gb', text: 'Вузы Великобритании' },
    ],
  },
  en: {
    title: 'How to apply to UK universities through UCAS: 2027 deadlines',
    seoTitle: 'UCAS 2027: deadlines, £34.50 fee and five choices',
    description: 'How to apply to a UK university through UCAS for 2027 entry: the 13 January deadline, five choices, the £34.50 fee, the statement, the reference and replies.',
    blocks: [
      { t: 'p', text: 'Applications to UK undergraduate courses go through one portal, **UCAS**. For 2027 entry applications opened on 12 May 2026, a finished application can be sent from 1 September 2026, and the "equal consideration" deadline for most courses is **13 January 2027, 18:00 UK time**. For Oxford, Cambridge and most courses in medicine, dentistry and veterinary medicine the deadline was 15 October 2026: it has passed. Below: the dates, the number of choices, the fee, the personal statement, the reference and what matters to international students. Everything was checked on the UCAS site on 18 November 2026. This article is about undergraduate study: postgraduate deadlines are different (UCAS says so), so check the conditions with the university.' },
      { t: 'h2', id: 'dates', text: 'Dates for 2027 entry' },
      {
        t: 'ul',
        items: [
          '**Opening.** Applications for 2027 entry opened on 12 May 2026. From 1 September 2026 a finished application can be sent to UCAS: a reference is needed for that.',
          '**15 October 2026, 18:00 UK time:** the deadline for Oxford, Cambridge and most courses in medicine, dentistry and veterinary medicine. It has passed.',
          '**13 January 2027, 18:00 UK time:** the "equal consideration" deadline for most undergraduate courses.',
          '**After the deadline.** Applications received by 18:00 on 30 June 2027 are sent to universities; later ones go automatically into Clearing (admission to the places that remain), which opens on 2 July 2027. The final deadline for 2027 entry is 18:00 on 23 September 2027.',
          '**For international students** UCAS names no separate deadlines. The page says many universities accept applications from international students later in the year, nearer the start of the course, but it is better not to miss the equal consideration date.',
        ],
      },
      { t: 'h2', id: 'choices', text: 'Choices, fee, statement and reference' },
      {
        t: 'ul',
        items: [
          '**How many choices.** Five in total. You can add choices with a different deadline later, but the total stays five.',
          '**The fee:** £34.50 for a 2027 entry application, for up to five choices. The fee for a single choice is not stated on the pages we read.',
          '**The personal statement:** up to 4,000 characters including spaces. As UCAS describes it, it now consists of three questions: why you want this course; how your qualifications and studies helped you prepare; and what else you have done to prepare outside education and why it is useful. Each answer needs at least 350 characters.',
          '**The reference:** you need one, from someone who is not a relative, friend or partner. The referee writes it online, in English (at a school or college, a teacher or tutor). Until the reference is added you cannot submit the application.',
        ],
      },
      { t: 'h2', id: 'international', text: 'What matters to international students' },
      {
        t: 'ul',
        items: [
          '**English.** For degree-level courses universities generally expect CEFR level B2 (in the UCAS table that is IELTS 6–6.5). The level needed varies from university to university and even from course to course: ask the university. For the visa the test must be one approved by the Home Office (a SELT): UCAS names IELTS and Trinity ISE (at a Trinity centre in the UK).',
          '**Education documents.** Many universities accept international qualifications equivalent to UK ones: check the university\'s website or ask it. A statement of how your qualifications compare with UK ones can be had from UK ENIC. For 2027 UCAS is introducing a document upload service (for example for English certificates) for all students. The UCAS pages we read say nothing about translations.',
          '**The visa.** After an unconditional offer a university with a sponsor licence can give you a CAS (confirmation of acceptance), which you use to apply for the visa. If you are outside the UK you can apply six months before the course starts; a decision normally comes within 15 days. UCAS advises not to wait until August. The sums you must show are in [How much money you must show for a student visa](/blog/proof-of-funds-student-visa).',
          '**Money.** According to UCAS a year of undergraduate study for an international student costs between £11,400 and £38,000: check the price of the course. An international student is unlikely to get a student loan from the UK Government. The scholarships UCAS names are Chevening, Commonwealth and GREAT; on the first see [Chevening: who can get the UK scholarship and when to apply](/blog/chevening-scholarship-how-to-apply).',
        ],
      },
      { t: 'h2', id: 'after', text: 'After you apply' },
      {
        t: 'ul',
        items: [
          '**Replying to offers** for 2027: if your last decision arrives by 31 March 2027, reply by 5 May; by 12 May, reply by 2 June; by 14 July, reply by 21 July. You can swap a reply until 22 July 2027.',
          '**Choices:** you can accept one firm choice and, if you wish, one insurance choice.',
          '**UCAS Extra** (25 February to 1 July 2027) is open if you used five choices and got rejections or declined all your offers. You can add one course at a time, and then you cannot have an insurance choice.',
          '**Music and drama:** conservatoires take applications separately through UCAS Conservatoires: up to six courses, a fee of £34.50 for the 2027 cycle.',
        ],
      },
      { t: 'h2', id: 'plan', text: 'What to do, in order' },
      {
        t: 'ol',
        items: [
          'Choose up to five courses and check each university\'s site for its document and English requirements.',
          'Arrange the reference early: you cannot send the application without it.',
          'Write the statement: three answers of at least 350 characters each, up to 4,000 characters with spaces in all.',
          'Book an English test early: the level you need depends on the university.',
          'Send the application before 18:00 UK time on 13 January 2027, better earlier.',
        ],
      },
      { t: 'h2', id: 'sources', text: 'Sources' },
      { t: 'p', text: 'UCAS: [dates and deadlines](https://www.ucas.com/applying/applying-to-university/dates-and-deadlines-for-uni-applications), [filling in your application](https://www.ucas.com/applying/applying-to-university/filling-in-your-ucas-application), [the personal statement](https://www.ucas.com/applying/applying-to-university/writing-your-personal-statement/how-to-write-your-personal-statement), [the reference](https://www.ucas.com/applying/applying-university/how-get-ucas-reference), [replying to your offers](https://www.ucas.com/applying/after-you-apply/types-of-offers/replying-to-your-offers), [UCAS Extra](https://www.ucas.com/undergraduate/after-you-apply/types-offer/extra-choices), [for international students](https://www.ucas.com/international/international-students/applying-to-university-as-an-international-student), [conservatoires](https://www.ucas.com/conservatoires/applying-through-ucas-conservatoires). Checked on 18 November 2026. Conditions change: check them on the UCAS site before you apply.' },
      { t: 'cta', href: '/study/gb', text: 'Study in the United Kingdom: fields' },
      { t: 'cta', href: '/institutions/gb', text: 'Institutions in the United Kingdom' },
    ],
  },
};
