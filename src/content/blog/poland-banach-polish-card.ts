import type { Article } from '@/lib/blog/types';

// Read on 18 November 2026:
//  - the call for the Banach NAWA Programme No. 16/2026 of 13 April 2026 (the full text of the PDF on nawa.gov.pl: countries in four groups, eligibility,
//    scholarship, deadline 8 May 2026, results by 31 July 2026, attachments, points); a call for 2027/28 is not on the NAWA pages yet;
//  - the NAWA pages of the Banach and the gen. Anders programmes (Anders: the Pole's Card or dual citizenship, studies in Polish);
//  - Study in Poland, "Tuition Fees" (source: Ministry of Education): free full-time studies in Polish at state institutions for Polish students and
//    foreigners who study on terms applicable to Polish citizens, which includes holders of the Pole's Card; averages of the fees for others;
//    "Scholarships": holders of the Pole's Card qualify for some scholarships.
// NOT found on any page that could be read, so deliberately not stated: the conditions for getting the Pole's Card itself (the gov.pl page returned
// only the portal menu), the dates of the Banach call for 2027/28, the current Anders call (the call page read was the closed 2020 one).
export const polandBanachPolishCard: Article = {
  slug: 'poland-banach-nawa-polish-card-scholarships',
  published: '2026-12-10',
  updated: '2026-12-10',
  ru: {
    title: 'Стипендия Банаха NAWA и Карта поляка: как учиться в Польше бесплатно',
    seoTitle: 'Стипендия Банаха NAWA: страны, условия, документы',
    description: 'Стипендия Банаха NAWA для магистратуры: 36 стран, 2 500 злотых в месяц, документы и баллы. Для обладателей Карты поляка: бесплатная учёба и программа Андерса.',
    blocks: [
      { t: 'p', text: 'В Польше есть три официальных пути учиться бесплатно или со стипендией: **стипендия Банаха** от NAWA для магистратуры, **программа Андерса** для людей польского происхождения и бесплатное обучение на польском в государственных вузах для обладателей **Карты поляка**. Ниже — условия каждого. По Банаху последнее объявление — № 16/2026 от 13 апреля 2026 года (набор 2026/27). Объявления на 2027/28 на странице NAWA пока нет, поэтому цифры даны по прошлому набору. Всё проверено на официальных сайтах 18 ноября 2026 года. О признании аттестата и диплома для поступления — в статье [Признание аттестата и диплома в Польше (NAWA)](/blog/poland-recognition-of-certificate-and-diploma-nawa).' },
      { t: 'h2', id: 'banach', text: 'Стипендия Банаха NAWA' },
      {
        t: 'ul',
        items: [
          '**Для кого.** Граждане 36 стран, разделённых на четыре группы. Среди них Армения, Азербайджан, Беларусь, Грузия, Казахстан, Молдова, Украина и Узбекистан. Россия, Киргизия и Турция в списке не названы.',
          '**Уровень.** Очная магистратура на польском или английском в государственных вузах, подчинённых Министерству науки и высшего образования, которые заключили рамочный договор с NAWA. Учёбе на польском может предшествовать годичный подготовительный курс.',
          '**Условия по объявлению 2026/27.** Вы не гражданин Польши и не подавали на гражданство; планируете начать магистратуру или курс осенью; получили степень бакалавра не раньше 2024 года (или учитесь на последнем семестре и получите её до 15 июля 2026 года); у вас ещё нет магистерской степени и вы не получали стипендию NAWA на магистратуру; знаете польский на уровне B1 для курса, польский B2 для учёбы на польском или английский B2 для учёбы на английском.',
          '**Что покрывает.** 2 500 злотых в месяц (не более 12 месяцев за учебный год), освобождение от платы за обучение в государственных вузах и на подготовительном курсе NAWA и единовременная выплата на дорогу (по странице NAWA — 2 500 злотых). Для учёбы на английском — ещё курс польского языка и культуры. В частных вузах условия оплаты определяет сам вуз.',
          '**Сроки набора 2026/27.** Объявление вышло 13 апреля 2026 года, заявки принимали до 8 мая 2026 года, 15:00 по Варшаве, или до закрытия квоты: по 300 заявок в группах стран 1–3 и 200 в группе 4. Результаты объявили до 31 июля 2026 года. Для 2027/28 следите за страницей Банаха на сайте NAWA.',
          '**Как выбирают.** Оценка по 110 баллам: средний балл бакалавриата (до 70), видеопрезентация (до 30) и необязательная рекомендация польского дипломатического представительства (до 10). Чтобы пройти, нужно набрать не менее 70 баллов, в том числе не менее 50 за средний балл и не менее 20 за презентацию.',
        ],
      },
      { t: 'h2', id: 'apply', text: 'Документы и подача (по объявлению 2026/27)' },
      {
        t: 'ul',
        items: [
          '**Как подавать.** Только онлайн в IT-системе NAWA, на польском или английском, одна заявка от одного человека. Страну выбирают по гражданству.',
          '**Вложения.** Страница паспорта с личными данными; диплом бакалавра с приложением, где указаны средний балл и оценки по предметам (студентам последнего семестра — справка вуза с этими сведениями); документ об участии в приёме в польский вуз; документ о знании языка; видеопрезентация на польском или английском длиной 1–3 минуты; по желанию — рекомендация польского дипломатического представительства.',
          '**Документ о приёме в вуз.** Подойдёт решение о зачислении (в том числе условное), письмо о приёме, подтверждение участия в приёме (например, об оплате вступительного сбора) или подтверждение контакта с вузом по конкретной программе вместе с ответом вуза. Для пути «подготовительный курс и магистратура» он не нужен.',
          '**Перевод.** Документы не на польском или английском нужно перевести: перевод заверяет присяжный переводчик или польское дипломатическое представительство; там, где нет присяжных переводчиков, подойдёт нотариальный.',
          '**Приём в вуз отдельно.** NAWA не посредничает в приёме: подавать в вуз нужно самостоятельно, по правилам вуза. Вуз может потребовать апостилированные или легализованные документы и подтверждение права поступать в магистратуру.',
        ],
      },
      { t: 'h2', id: 'card', text: 'Карта поляка и программа Андерса' },
      {
        t: 'ul',
        items: [
          '**Бесплатная учёба.** По данным Study in Poland (источник — Министерство образования Польши), очное обучение на польском в государственных вузах бесплатно для граждан Польши и иностранцев, которые начинают учёбу на условиях граждан Польши. К ним относятся граждане ЕС и ЕЭЗ и обладатели Карты поляка.',
          '**Остальные иностранцы платят:** в среднем 2 000 евро в год за бакалавриат и магистратуру, 3 000 евро за докторантуру и 2 000 евро за годичный подготовительный курс польского. Вузы сами устанавливают плату: от 2 000 до 6 000 евро в год.',
          '**Стипендии.** Study in Poland пишет, что обладатели Карты поляка могут претендовать на некоторые стипендии.',
          '**Программа Андерса от NAWA** адресована молодым людям польского происхождения. Нужна Карта поляка или двойное гражданство (Польши и другой страны) и среднее образование, полученное за пределами Польши. Она покрывает очное обучение (бакалавриат, магистратура или единая магистратура) на польском; ему может предшествовать годичный подготовительный курс. Не покрываются прикладная лингвистика и иностранные языки, кроме полонистики. Объявления выходят ежегодно.',
        ],
      },
      { t: 'note', text: 'Как получить саму Карту поляка, мы на официальных страницах, которые удалось прочитать, не нашли: смотрите сайт МИД Польши и консульство. Текущее объявление программы Андерса мы тоже не читали: условия приведены по описанию программы на сайте NAWA.' },
      { t: 'h2', id: 'choose', text: 'Что выбрать' },
      {
        t: 'ol',
        items: [
          'Если вы гражданин одной из 36 стран Банаха и хотите магистратуру: следите за объявлением на 2027/28 (в 2026 году оно вышло 13 апреля), заранее подготовьте язык (B2), средний балл и видеопрезентацию.',
          'Если у вас есть Карта поляка: смотрите объявления программы Андерса и подавайте в государственный вуз на очное обучение на польском.',
          'Если ни то ни другое: плата в государственных вузах в среднем около 2 000 евро в год. Вузы Польши — на странице [Вузы Польши](/institutions/pl), другие стипендии — на [странице стипендий](/scholarships).',
          'Документы подготовьте заранее и отмечайте готовое в [чек-листе](/checklist): заверенные копии, переводы и подтверждение языка занимают время.',
        ],
      },
      { t: 'h2', id: 'sources', text: 'Источники' },
      { t: 'p', text: 'NAWA: [стипендия Банаха](https://nawa.gov.pl/en/students/foreign-students/the-banach-scholarship-programme), [объявление о наборе № 16/2026](https://nawa.gov.pl/en/students/foreign-students/the-banach-scholarship-programme/call-for-proposals), [программа Андерса](https://nawa.gov.pl/en/students/foreign-students/the-gen-anders-programme). Study in Poland: [плата за обучение](https://studyinpoland.pl/en/education/18-tuition-fees), [стипендии](https://studyinpoland.pl/en/education/17-scholarships). Проверено 18 ноября 2026 года. Условия меняются от набора к набору: перед подачей сверьте их на сайте NAWA.' },
      { t: 'cta', href: '/scholarships', text: 'Стипендии с фильтром по гражданству' },
      { t: 'cta', href: '/institutions/pl', text: 'Вузы Польши' },
    ],
  },
  en: {
    title: 'Banach NAWA scholarship and the Pole\'s Card: studying in Poland free',
    seoTitle: 'Banach NAWA scholarship: countries, rules, documents',
    description: 'The Banach NAWA scholarship for a master\'s: 36 countries, PLN 2,500 a month, documents and points. For holders of the Pole\'s Card: free study and the Anders programme.',
    blocks: [
      { t: 'p', text: 'Poland has three official ways to study free or on a scholarship: the **Banach scholarship** from NAWA for a master\'s, the **Anders programme** for people of Polish origin, and free study in Polish at state universities for holders of the **Pole\'s Card**. Below: the conditions of each. For the Banach scholarship the latest call is No. 16/2026 of 13 April 2026 (the 2026/27 intake). The NAWA page has no call for 2027/28 yet, so the figures come from the last intake. Everything was checked on the official sites on 18 November 2026. On recognition of your certificate and diploma for admission see [Poland: recognition of your certificate and diploma (NAWA)](/blog/poland-recognition-of-certificate-and-diploma-nawa).' },
      { t: 'h2', id: 'banach', text: 'The Banach NAWA scholarship' },
      {
        t: 'ul',
        items: [
          '**Who.** Citizens of 36 countries, split into four groups. They include Armenia, Azerbaijan, Belarus, Georgia, Kazakhstan, Moldova, Ukraine and Uzbekistan. Russia, Kyrgyzstan and Turkey are not named.',
          '**Level.** A full-time master\'s in Polish or English at state universities supervised by the Minister of Science and Higher Education that have a framework agreement with NAWA. A year-long preparatory course may come before studies in Polish.',
          '**Conditions in the 2026/27 call.** You are not a Polish citizen and have not applied for citizenship; you plan to start a master\'s or the course in the autumn; you got your bachelor\'s no earlier than 2024 (or are in the last semester and will get it by 15 July 2026); you do not yet hold a master\'s and have not had a NAWA scholarship for a master\'s; you know Polish at B1 for the course, Polish at B2 for studies in Polish, or English at B2 for studies in English.',
          '**What it covers.** PLN 2,500 a month (at most 12 months in an academic year), exemption from tuition at state universities and at the NAWA preparatory course, and a one-off sum for travel (PLN 2,500 according to the NAWA page). For studies in English, also a course in Polish language and culture. At private universities the university sets the terms of payment.',
          '**The 2026/27 timetable.** The call came out on 13 April 2026 and applications were taken until 8 May 2026, 15:00 Warsaw time, or until the quota was filled: 300 applications in each of country groups 1–3 and 200 in group 4. Results were announced by 31 July 2026. For 2027/28 watch the Banach page on the NAWA site.',
          '**How applicants are chosen.** The score is out of 110: the average grade of the bachelor\'s (up to 70), a video self-presentation (up to 30) and an optional recommendation from a Polish diplomatic mission (up to 10). To pass you need at least 70 points, including at least 50 for the average grade and at least 20 for the presentation.',
        ],
      },
      { t: 'h2', id: 'apply', text: 'Documents and applying (the 2026/27 call)' },
      {
        t: 'ul',
        items: [
          '**How to apply.** Online only, in the NAWA IT system, in Polish or English, one application per person. You choose the country by citizenship.',
          '**Attachments.** The passport page with your personal data; the bachelor\'s diploma with a supplement showing the average and the grades by subject (for last-semester students, a certificate from the university with the same information); a document showing you are in the admission process of a Polish university; a document proving your language; a video self-presentation of 1–3 minutes in Polish or English; optionally a recommendation from a Polish diplomatic mission.',
          '**The document on admission to a university.** A decision to admit (also conditional), a letter of acceptance, proof of taking part in admission (for example of paying the admission fee), or proof of contact with the university about a specific programme together with its reply. The "preparatory course and master\'s" path does not need it.',
          '**Translation.** Documents not in Polish or English must be translated: the translation is certified by a sworn translator or a Polish diplomatic mission; where there are no sworn translators a notary translation will do.',
          '**Admission is separate.** NAWA does not mediate in admission: apply to the university yourself, by its rules. The university may ask for apostilled or legalised documents and for confirmation of your right to enter a master\'s.',
        ],
      },
      { t: 'h2', id: 'card', text: 'The Pole\'s Card and the Anders programme' },
      {
        t: 'ul',
        items: [
          '**Free study.** According to Study in Poland (source: the Ministry of Education), full-time studies in Polish at state universities are free for Polish citizens and for foreigners who start studies on the terms applicable to Polish citizens. These include citizens of the EU/EEA and holders of the Pole\'s Card.',
          '**Other foreigners pay:** on average EUR 2,000 a year for bachelor\'s and master\'s, EUR 3,000 for doctoral study and EUR 2,000 for the year-long preparatory Polish course. Universities set their own fees: from EUR 2,000 to 6,000 a year.',
          '**Scholarships.** Study in Poland says holders of the Pole\'s Card qualify for some scholarships.',
          '**The Anders programme from NAWA** is addressed to young people of Polish origin. You need the Pole\'s Card or dual citizenship (Poland and another country) and secondary education completed outside Poland. It covers full-time studies (bachelor\'s, master\'s or a uniform master\'s) in Polish; a year-long preparatory course may come first. Applied linguistics and foreign languages other than Polish philology are not covered. Calls are announced every year.',
        ],
      },
      { t: 'note', text: 'We did not find how to obtain the Pole\'s Card itself on the official pages we could read: see the Polish Foreign Ministry\'s site and the consulate. We also did not read the current Anders call: the conditions come from the programme description on the NAWA site.' },
      { t: 'h2', id: 'choose', text: 'What to choose' },
      {
        t: 'ol',
        items: [
          'If you are a citizen of one of the 36 Banach countries and want a master\'s: watch for the 2027/28 call (in 2026 it came out on 13 April) and prepare the language (B2), the average grade and the video early.',
          'If you hold the Pole\'s Card: watch the calls of the Anders programme and apply to a state university for full-time study in Polish.',
          'If neither: tuition at state universities averages about EUR 2,000 a year. Universities are on [Institutions in Poland](/institutions/pl), other scholarships on the [scholarships page](/scholarships).',
          'Prepare documents early and tick off what is ready in the [checklist](/checklist): certified copies, translations and proof of language take time.',
        ],
      },
      { t: 'h2', id: 'sources', text: 'Sources' },
      { t: 'p', text: 'NAWA: [the Banach scholarship](https://nawa.gov.pl/en/students/foreign-students/the-banach-scholarship-programme), [call for applications No. 16/2026](https://nawa.gov.pl/en/students/foreign-students/the-banach-scholarship-programme/call-for-proposals), [the gen. Anders programme](https://nawa.gov.pl/en/students/foreign-students/the-gen-anders-programme). Study in Poland: [tuition fees](https://studyinpoland.pl/en/education/18-tuition-fees), [scholarships](https://studyinpoland.pl/en/education/17-scholarships). Checked on 18 November 2026. Conditions change from intake to intake: check them on the NAWA site before you apply.' },
      { t: 'cta', href: '/scholarships', text: 'Scholarships by citizenship' },
      { t: 'cta', href: '/institutions/pl', text: 'Institutions in Poland' },
    ],
  },
};
