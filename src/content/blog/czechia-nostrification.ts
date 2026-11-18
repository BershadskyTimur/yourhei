import type { Article } from '@/lib/blog/types';

// Read on 18 November 2026 on official pages:
//  - Study in Czechia, "how to apply" (studyin.gov.cz): the two ways, nostrification and recognition within the admission procedure;
//  - Charles University: "Diploma Recognition" (cuni.cz/UKEN-593.html, changed 16 Feb 2026), "General recognition of foreign higher education"
//    (cuni.cz/UKEN-16.html, changed 3 Nov 2026) and the info sheet on assessing foreign education in the admission procedure
//    (cuni.cz/UKEN-593-version1-informace_web_web_ruk_nostrifikace_v_ramci_pr_en_3_2025.pdf).
// The detailed rules (documents, translations, the CZK 3,000 fee, 30 days, 15 days to appeal, the former USSR rule) are those of Charles University
// under the Higher Education Act; other public universities act under the same Act but the details and fees may differ, and the text says so.
// NOT found on any page that could be read, so deliberately not stated: the fee of the regional authority for a secondary-school certificate,
// the list of countries by form of authentication (the university's table was an unreadable PDF), the rules of the Ministry of Education
// pages (they returned only the home page), whether nostrification is mandatory by law for admission.
export const czechiaNostrification: Article = {
  slug: 'czechia-nostrification-recognition-of-certificate-and-diploma',
  published: '2026-12-07',
  updated: '2026-12-07',
  ru: {
    title: 'Нострификация в Чехии: признание аттестата и диплома для поступления',
    seoTitle: 'Нострификация в Чехии: аттестат и диплом, сбор, сроки',
    description: 'Как признать иностранный аттестат или диплом для поступления в вуз Чехии: нострификация или признание при приёме, документы, перевод, заверение, сбор 3 000 крон и сроки.',
    blocks: [
      { t: 'p', text: 'Если аттестат или диплом выданы не в Чехии, для поступления может понадобиться признание образования. Study in Czechia называет два пути: **нострификацию** через чешский орган и **признание в рамках приёма**, если его предлагает вуз. Ниже — чем они отличаются, какие нужны документы и переводы, сколько это стоит и сколько ждать. Подробные правила взяты со страниц [Карлова университета](/institutions/cz/charles-university): другие государственные вузы действуют по тому же закону, но детали и сборы могут отличаться, поэтому уточняйте их у своего факультета. Проверено 18 ноября 2026 года. О том, как проходит сама подача, — в статье [Как поступить в университет Чехии](/blog/czechia-how-to-apply-universities).' },
      { t: 'h2', id: 'routes', text: 'Два пути признания' },
      {
        t: 'ul',
        items: [
          '**Нострификация (общее признание).** Она шире по действию, но может занять больше времени. Документ о признании аттестата выдаёт краевой орган (в Праге — Магистрат столицы) или Министерство образования; признание высшего образования — государственные вузы, Министерство образования, внутренних дел или обороны.',
          '**Признание в рамках приёма.** Если вуз предлагает такой вариант, ваш документ оценивает факультет, куда вы поступаете. Оценка действует только для приёма на этот факультет в этом учебном году.',
          '**Что нужно для поступления.** По словам Study in Czechia, для бакалавриата и длинной магистратуры обычно нужно признание среднего образования. Для магистратуры после бакалавриата и докторантуры факультет оценивает ваше высшее образование. Срок подачи документов об образовании указан на сайте факультета.',
          '**Если оценка отрицательная.** Если факультет не примет ваш документ, придётся подать документ об общем признании (нострификации).',
        ],
      },
      { t: 'h2', id: 'secondary', text: 'Аттестат: какие есть варианты' },
      {
        t: 'ul',
        items: [
          '**Решение о нострификации.** Если оно у вас уже есть, факультет принимает его бесплатно. Плату берёт орган, который выдаёт решение, в рамках своей процедуры.',
          '**Европейский бакалавриат и IB** принимаются как подтверждение среднего образования. Карлов университет принимает IB автоматически и без платы за оценку после 1 марта 2025 года.',
          '**Словакия, Польша, Венгрия, Словения.** Документы из этих стран по международным договорам равнозначны автоматически, без отдельной процедуры.',
          '**Все остальные аттестаты** оценивает сам факультет. Положительная оценка — документ принят; отрицательная — нужно общее признание. Размер административного сбора смотрите на сайте факультета.',
          '**Что ещё могут запросить:** обзор изученных предметов, справку об аккредитации школы или иностранного органа о том, что программа соответствует среднему образованию.',
        ],
      },
      { t: 'h2', id: 'degree', text: 'Диплом вуза: магистратура и докторантура' },
      {
        t: 'ul',
        items: [
          '**Кто признаёт.** Решения о признании иностранного высшего образования принимают только государственные вузы; у частных вузов такого права нет. Перед подачей узнайте, какой государственный вуз ведёт похожую программу.',
          '**Плата и срок.** По данным Карлова университета, плата за нострификацию — 3 000 крон. Решение выносят в течение 30 дней со дня получения заявления, в сложных случаях срок продлевают ещё на 30 дней. Обжаловать решение можно в течение 15 дней в Министерство образования через ректорат.',
          '**Заявление нельзя подать по электронной почте:** документы отправляют на бумаге.',
          '**Автоматически равнозначны** дипломы вузов Словакии (кроме дипломов зарубежных филиалов словацких вузов, выданных после 28 марта 2015 года), Польши, Венгрии и Словении.',
          '**Дипломы республик бывшего СССР,** выданные между 6 июня 1972 года и 27 февраля 2000 года, признаются в Чехии автоматически: нужна заверенная копия диплома и официальный перевод. Карлов университет ссылается на протокол № 123/1973 Sb.',
          '**Все остальные дипломы** при приёме оценивает факультет: оценка действует только для одного факультета в одном учебном году.',
        ],
      },
      { t: 'h2', id: 'documents', text: 'Документы, перевод и заверение' },
      {
        t: 'ul',
        items: [
          '**Для нострификации диплома** Карлов университет называет: заверенную копию диплома, заверенное приложение к диплому (Diploma Supplement) или список сданных экзаменов, заверенный перевод обоих документов на чешский или английский (не нужен, если оригиналы на английском) и обычную копию документа об образовании. Докторанты добавляют список экзаменов послевузовского обучения.',
          '**Перевод.** Документы не на чешском, английском или словацком переводит судебный (присяжный) переводчик, чешский или иностранный, либо посольство Чехии. Листы перевода должны быть жёстко скреплены с заверенной копией документа: перевод к незаверенной копии не принимается.',
          '**Заверение зависит от страны.** Документы должны быть заверены по международным договорам. Страны, подписавшие многостороннюю конвенцию о правовой помощи, обходятся без дополнительной проверки; для стран Гаагской конвенции нужен апостиль; для остальных — проверка министерством иностранных дел своей страны и посольством Чехии. Таблицу по странам публикует Карлов университет.',
          '**Почта.** Документы для оценки при приёме отправляют почтой на адрес факультета, а не по электронной почте.',
        ],
      },
      { t: 'h2', id: 'plan', text: 'Порядок действий' },
      {
        t: 'ol',
        items: [
          'Выберите программы и откройте на сайте факультета раздел о приёме иностранцев: срок подачи документов об образовании и размер сбора за оценку.',
          'Узнайте, предлагает ли факультет признание в рамках приёма или нужна нострификация заранее: аттестат — в краевом органе, диплом — в государственном вузе.',
          'Проверьте форму заверения для вашей страны (апостиль, суперлегализация или без заверения) и закажите заверенные копии и перевод у присяжного переводчика.',
          'Начните за 6–9 месяцев до начала учёбы, как советует Study in Czechia, и отмечайте готовое в [чек-листе документов](/checklist).',
          'Отправьте документы почтой до срока факультета. Сроки программ чешских вузов — в [календаре](/deadlines/cz).',
        ],
      },
      { t: 'h2', id: 'sources', text: 'Источники' },
      { t: 'p', text: 'Study in Czechia: [как подать заявку](https://studyin.gov.cz/plan-your-studies/how-to-apply). Карлов университет: [признание дипломов](https://cuni.cz/UKEN-593.html) (страница изменена 16 февраля 2026 года), [общее признание иностранного высшего образования](https://cuni.cz/UKEN-16.html) (3 ноября 2026 года), [памятка об оценке образования при приёме](https://cuni.cz/UKEN-593-version1-informace_web_web_ruk_nostrifikace_v_ramci_pr_en_3_2025.pdf). Проверено 18 ноября 2026 года. Страницы Министерства образования Чехии нам прочитать не удалось: правила могут отличаться в деталях, перед подачей сверьте их у вуза.' },
      { t: 'cta', href: '/deadlines/cz', text: 'Сроки подачи в Чехии' },
      { t: 'cta', href: '/checklist', text: 'Чек-лист документов' },
    ],
  },
  en: {
    title: 'Nostrification in Czechia: recognising your certificate and diploma',
    seoTitle: 'Czech nostrification: certificate, diploma, fee, deadlines',
    description: 'Recognising a foreign certificate or diploma for a Czech university: nostrification or recognition at admission, documents, translation and the CZK 3,000 fee.',
    blocks: [
      { t: 'p', text: 'If your certificate or diploma was issued outside Czechia, you may need recognition of your education to be admitted. Study in Czechia names two ways: **nostrification** through a Czech authority and **recognition within the admission procedure**, if the university offers it. Below: how they differ, which documents and translations you need, what it costs and how long it takes. The detailed rules come from the pages of [Charles University](/institutions/cz/charles-university): other public universities act under the same law, but details and fees may differ, so confirm them with your faculty. Checked on 18 November 2026. How the application itself works is in [How to apply to a Czech university](/blog/czechia-how-to-apply-universities).' },
      { t: 'h2', id: 'routes', text: 'Two ways to recognition' },
      {
        t: 'ul',
        items: [
          '**Nostrification (general recognition).** It is broader in effect but may take longer. The document recognising a certificate is issued by a regional authority (in Prague, the Metropolitan Authority) or by the Ministry of Education; recognition of higher education is by public universities, the Ministry of Education, the Ministry of the Interior or the Ministry of Defence.',
          '**Recognition within the admission procedure.** If the university offers it, the faculty you apply to assesses your document. The assessment is valid only for admission to that faculty in that academic year.',
          '**What you need for admission.** According to Study in Czechia, for bachelor\'s and long master\'s programmes you usually need recognition of your secondary education. For a master\'s after a bachelor\'s and for doctoral study the faculty assesses your higher education. The deadline for education documents is on the faculty\'s website.',
          '**If the assessment is negative.** If the faculty does not accept your document, you must submit a document of general recognition (nostrification).',
        ],
      },
      { t: 'h2', id: 'secondary', text: 'The certificate: your options' },
      {
        t: 'ul',
        items: [
          '**A nostrification decision.** If you already have one, the faculty accepts it free of charge. The authority that issues the decision charges its own fee under its procedure.',
          '**The European Baccalaureate and the IB** are accepted as proof of secondary education. Charles University accepts the IB automatically and without an assessment fee after 1 March 2025.',
          '**Slovakia, Poland, Hungary, Slovenia.** Documents from these countries are equivalent automatically under international agreements, without a separate procedure.',
          '**All other certificates** are assessed by the faculty itself. A positive assessment means the document is accepted; a negative one means you need general recognition. See the faculty\'s website for the administrative fee.',
          '**What else may be requested:** an overview of the subjects studied, or a statement from the school or a foreign authority that the programme is equivalent to secondary education.',
        ],
      },
      { t: 'h2', id: 'degree', text: 'The university diploma: master\'s and doctoral study' },
      {
        t: 'ul',
        items: [
          '**Who recognises.** Only public universities decide on recognition of foreign higher education; private universities do not have that right. Before you apply, find out which public university runs a similar programme.',
          '**Fee and time.** According to Charles University the fee for nostrification is CZK 3,000. The decision is made within 30 days of receiving the application, extended by another 30 days in complex cases. You can appeal within 15 days to the Ministry of Education through the Rectorate.',
          '**The application cannot be sent by e-mail:** the documents go on paper.',
          '**Automatically equivalent** are the diplomas of universities in Slovakia (except diplomas of foreign branches of Slovak universities issued after 28 March 2015), Poland, Hungary and Slovenia.',
          '**Diplomas of the republics of the former USSR** issued between 6 June 1972 and 27 February 2000 are recognised automatically in Czechia: you need a certified copy of the diploma and an official translation. Charles University cites protocol No. 123/1973 Sb.',
          '**All other diplomas** are assessed by the faculty at admission: the assessment is valid only for one faculty in one academic year.',
        ],
      },
      { t: 'h2', id: 'documents', text: 'Documents, translation and authentication' },
      {
        t: 'ul',
        items: [
          '**For nostrification of a diploma** Charles University lists: a certified copy of the diploma, a certified diploma supplement or list of examinations passed, a certified translation of both into Czech or English (not needed if the originals are in English) and a plain copy of the document proving your education. Doctoral applicants add the list of examinations passed in postgraduate study.',
          '**Translation.** Documents not in Czech, English or Slovak are translated by a court (sworn) translator, Czech or foreign, or by a Czech embassy. The translation sheets must be firmly attached to the certified copy of the document: a translation attached to an uncertified copy is not accepted.',
          '**Authentication depends on the country.** Documents must be authenticated under international agreements. Countries that signed the multilateral convention on legal assistance need no further verification; Hague Convention countries need an apostille; for the others the document is verified by the foreign ministry of its country and by a Czech embassy. Charles University publishes a table by country.',
          '**By post.** Documents for assessment at admission go by post to the faculty\'s address, not by e-mail.',
        ],
      },
      { t: 'h2', id: 'plan', text: 'What to do, in order' },
      {
        t: 'ol',
        items: [
          'Choose programmes and open the faculty\'s page on admission of international applicants: the deadline for education documents and the assessment fee.',
          'Find out whether the faculty offers recognition within admission or you need nostrification beforehand: for a certificate at a regional authority, for a diploma at a public university.',
          'Check the form of authentication for your country (apostille, super-legalisation or none) and order certified copies and a translation from a sworn translator.',
          'Start 6–9 months before your studies, as Study in Czechia advises, and tick off what is ready in the [document checklist](/checklist).',
          'Post the documents before the faculty\'s deadline. The deadlines of Czech programmes are in the [calendar](/deadlines/cz).',
        ],
      },
      { t: 'h2', id: 'sources', text: 'Sources' },
      { t: 'p', text: 'Study in Czechia: [how to apply](https://studyin.gov.cz/plan-your-studies/how-to-apply). Charles University: [diploma recognition](https://cuni.cz/UKEN-593.html) (page changed 16 February 2026), [general recognition of foreign higher education](https://cuni.cz/UKEN-16.html) (3 November 2026), [information sheet on assessing education at admission](https://cuni.cz/UKEN-593-version1-informace_web_web_ruk_nostrifikace_v_ramci_pr_en_3_2025.pdf). Checked on 18 November 2026. We could not read the pages of the Czech Ministry of Education: the rules may differ in detail, so check them with your university before you apply.' },
      { t: 'cta', href: '/deadlines/cz', text: 'Application deadlines in Czechia' },
      { t: 'cta', href: '/checklist', text: 'Document checklist' },
    ],
  },
};
