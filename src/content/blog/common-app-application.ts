import type { Article } from '@/lib/blog/types';

// Read on 18 November 2026 on commonapp.org (the first-year guide) and on the first-year admissions pages of seven colleges:
// Harvard, Yale, Princeton, Brown, Cornell, Pennsylvania and Dartmouth (college pages, one by one, see the list of sources in the article).
// Columbia could not be read (HTTP 403 for every automated request), so it is not in the article.
// NOT found on the pages that render, so deliberately not stated: the limit of colleges on a Common App list, the essay length, the number
// of recommendations, the date the 2026-27 application opened, whether Common App itself charges a fee, the Common App rules for school
// reports of non-US schools, the application fee of Yale and of Princeton. The minimum English scores on the Brown page on its page look inconsistent
// (TOEFL "5.5", IELTS "8.0"), so they are not quoted. The dates on the pages of Harvard, Yale, Princeton, Cornell and Dartmouth carry no
// year; Pennsylvania shows 2026 and 2027, Brown ties its pages to the 2026-27 cycle, Princeton says "fall 2027" about testing.
export const commonAppApplication: Article = {
  slug: 'common-app-how-to-apply-us-universities',
  published: '2026-11-30',
  updated: '2026-11-30',
  ru: {
    title: 'Common App 2027: как подать документы в вузы США, сроки и сборы',
    seoTitle: 'Common App 2027: сроки, сборы и тесты в вузах США',
    description: 'Как подать документы в вузы США через Common App: сроки ранних и обычных раундов, сборы, SAT и ACT, английский и помощь иностранцам в семи вузах.',
    blocks: [
      { t: 'p', text: '**Common App** — единая заявка, через которую, по данным самого Common App, можно подать документы в более чем 1 200 вузов. Но сроки, тесты, эссе и рекомендации устанавливает каждый вуз. Ниже — как это устроено и что семь известных вузов сами пишут для набора на осень 2027 года: Гарвард, Йель, Принстон, Браун, Корнелл, Пенсильванский университет и Дартмут. Ранний срок этого набора (1 ноября 2026 года) уже прошёл, впереди обычные сроки 1–5 января 2027 года. Всё проверено на официальных сайтах 18 ноября 2026 года. Цены обучения в этих вузах — в статье [Сколько стоит обучение в Гарварде и вузах Лиги плюща](/blog/harvard-ivy-league-tuition-cost).' },
      { t: 'h2', id: 'how', text: 'Как работает Common App' },
      {
        t: 'ul',
        items: [
          '**Одна заявка — много вузов.** По данным Common App, через неё можно подать документы в более чем 1 200 вузов-участников.',
          '**Требования у каждого вуза свои.** На странице вуза в Common App видны требования к тестам, письменным работам, сроки и другое. Каждый вуз сам выбирает, какие рекомендации ему нужны.',
          '**Кто что отправляет.** Школьный консультант присылает отчёт школы (School Report) и аттестат или выписку, учителя — рекомендации. Форму от родителей нужно подать, только если вы подаёте на ранний раунд Early Decision.',
          '**Дополнения вуза.** Многие вузы добавляют короткие вопросы или эссе прямо в заявку, а некоторые — отдельное письменное дополнение. Личное эссе вуз может сделать обязательным или необязательным.',
          '**Освобождение от сбора.** Можно запросить освобождение через Common App, которое должен подтвердить консультант, либо воспользоваться освобождением самого вуза.',
        ],
      },
      { t: 'h2', id: 'rounds', text: 'Раунды подачи' },
      {
        t: 'ul',
        items: [
          '**Early Decision (обязывающий)** у Брауна, Корнелла, Пенсильвании и Дартмута: срок 1 ноября, решение в декабре.',
          '**Ранний раунд с ограничением** у Гарварда (Restrictive Early Action), Йеля (Single-Choice Early Action) и Принстона (single-choice early action): срок 1 ноября, решение в середине декабря. Йель и Принстон просят ответить на предложение до 1 мая.',
          '**Regular Decision** — обычный раунд: 1 января (Гарвард, Принстон, Дартмут), 2 января (Йель, Корнелл) или 5 января (Браун, Пенсильвания). Решения приходят с конца марта по апрель.',
          '**Для этих семи вузов ранний срок уже прошёл,** в обычный раунд ещё можно успеть. Если у вуза есть другой ранний раунд, это написано на его странице.',
        ],
      },
      { t: 'h2', id: 'colleges', text: 'Сроки и сборы по вузам' },
      {
        t: 'ul',
        items: [
          '[Гарвардский университет](/institutions/us/harvard-university): ранний раунд 1 ноября (решение в середине декабря), обычный 1 января (решение в конце марта). Сбор 95 $ или освобождение при финансовых трудностях. Подача через Common App и дополнение Harvard College Questions.',
          '[Йельский университет](/institutions/us/yale-university): ранний раунд 1 ноября (решение в середине декабря), обычный 2 января (решение в конце марта). Принимает Common App, Coalition Application (Scoir) и QuestBridge, подать можно только одну заявку. Свои освобождения от сбора Йель не выдаёт: их запрашивают через Common App или Coalition. Размер сбора мы на прочитанных страницах не нашли.',
          '[Принстонский университет](/institutions/us/princeton-university): ранний раунд 1 ноября (решение в середине декабря), обычный 1 января (решение в конце марта). Подача через Common App. Для малообеспеченных есть освобождение от сбора; размер сбора на прочитанных страницах не указан.',
          '[Брауновский университет](/institutions/us/brown-university): Early Decision 1 ноября (решение в середине декабря), обычный раунд 5 января (решение в начале апреля). Сбор 80 $ или освобождение. Подача через Common App.',
          '[Корнеллский университет](/institutions/us/cornell-university): Early Decision 1 ноября (остальные материалы до 13 ноября; решение в середине декабря), обычный раунд 2 января (остальные материалы до 19 января; решение в конце марта). Сбор 85 $. Подача через Common App и дополнение Корнелла.',
          '[Пенсильванский университет](/institutions/us/university-of-pennsylvania): Early Decision 1 ноября 2026 года (решение в декабре), обычный раунд 5 января 2027 года (решение в апреле). Сбор 75 $. Принимает Common App, Coalition и QuestBridge.',
          '[Дартмутский колледж](/institutions/us/dartmouth-college): Early Decision 1 ноября (решение в середине декабря), обычный раунд 1 января (решение в конце марта или начале апреля). Сбор 85 $. Для первокурсников обязателен Common App; QuestBridge тоже принимают.',
        ],
      },
      { t: 'note', text: 'Даты на страницах Гарварда, Йеля, Принстона, Корнелла и Дартмута указаны без года; у Пенсильвании год стоит (2026 и 2027), у Брауна страницы привязаны к циклу 2026–27. Колумбийский университет в список не вошёл: его сайт не открылся при проверке.' },
      { t: 'h2', id: 'tests', text: 'Тесты и английский язык' },
      {
        t: 'ul',
        items: [
          '**SAT или ACT** обязательны для первокурсников в Гарварде, Йеле, Брауне, Корнелле, Пенсильвании и Дартмуте. Дартмут разрешает иностранным абитуриентам вместо них три экзамена AP, IB, A-Level или национальный экзамен.',
          '**Принстон** для набора на осень 2027 года остаётся test-optional, а с набора на осень 2028 года снова потребует SAT или ACT.',
          '**Гарвард** не требует экзамена по английскому: результаты можно прислать по желанию. Результаты TOEFL, IELTS и Duolingo не заменяют SAT или ACT.',
          '**Английский нужен, если обучение было не на английском.** Йель просит TOEFL, IELTS, Cambridge English, Duolingo или InitialView, если вы меньше двух лет учились в средней школе на английском. Принстон — TOEFL, IELTS Academic, Duolingo или PTE Academic, если вы не проучились три года в школе на английском. Пенсильвания — TOEFL, IELTS Academic или Duolingo, если английский не родной и нет трёх лет обучения на нём. Дартмут — экзамен, если первый язык не английский и обучение на английском длилось меньше двух лет.',
          '**Ориентиры по баллам.** Йель называет конкурентным TOEFL iBT от 5 по новой шкале 1–6 (для тестов после 21 января 2026 года). Пенсильвания даёт ориентиры: TOEFL iBT от 5, IELTS от 7, Duolingo от 130; жёсткого минимума у неё нет.',
          '**Браун и Корнелл** тоже требуют подтверждения английского; баллы смотрите на их страницах. Браун ждёт официальные результаты для набора осени 2027 года в мае 2027 года.',
        ],
      },
      { t: 'h2', id: 'aid', text: 'Финансовая помощь иностранным студентам' },
      {
        t: 'ul',
        items: [
          '**Нужду в помощи при зачислении не учитывают (need-blind):** Йель, Принстон и Дартмут пишут это прямо. Браун пишет, что need-blind для иностранцев с набора выпуска 2029 года.',
          '**Гарвард:** помощь определяется только нуждой, решения о зачислении принимаются без учёта того, подавали ли вы на помощь, и Гарвард покрывает установленную нуждаемость. Слов «need-blind» на странице нет.',
          '**Нужду учитывают (need-aware):** Корнелл и Пенсильвания. Оба при этом пишут, что покрывают 100 % установленной нуждаемости принятых студентов, которым нужна помощь.',
          '**Покрытие нужды:** Йель, Принстон, Дартмут и Браун пишут, что покрывают 100 % установленной нуждаемости. Принстон помогает грантами, а не кредитами; Браун — если вы подали на помощь вместе с заявкой.',
          '**Просить помощь нужно сразу.** Браун и Пенсильвания пишут, что запрос подают одновременно с заявкой. У Корнелла сроки подачи документов о помощи для иностранцев те же: 1 ноября для Early Decision и 2 января для обычного раунда.',
        ],
      },
      { t: 'h2', id: 'plan', text: 'Порядок действий' },
      {
        t: 'ol',
        items: [
          'Составьте список вузов и для каждого откройте страницу вуза: срок, тесты, эссе, рекомендации, сбор.',
          'Запишитесь на SAT или ACT и, если нужно, на тест английского заранее: у Пенсильвании для обычного раунда принимают результаты не позже декабря 2026 года.',
          'Попросите консультанта школы и учителей о рекомендациях, отчёте школы и выписке.',
          'Заполните Common App и дополнения вузов.',
          'Если сбор тяжёл для семьи, запросите освобождение через Common App или у самого вуза; заявку на финансовую помощь подавайте одновременно.',
          'Отправьте заявки до сроков 1–5 января 2027 года и оставьте запас на технические сбои.',
        ],
      },
      { t: 'h2', id: 'sources', text: 'Источники' },
      { t: 'p', text: 'Common App: [руководство для первокурсников](https://www.commonapp.org/apply/first-year-students). Вузы: [Гарвард](https://college.harvard.edu/admissions/apply/first-year-applicants), [Йель](https://admissions.yale.edu/timelines), [Принстон](https://admission.princeton.edu/apply/first-year-application-dates-deadlines), [Браун](https://admission.brown.edu/first-year/regular-decision), [Корнелл](https://admissions.cornell.edu/how-to-apply/first-year-applicants), [Пенсильвания](https://admissions.upenn.edu/how-to-apply/first-year-applicants), [Дартмут](https://admissions.dartmouth.edu/apply/apply-dartmouth). Проверено 18 ноября 2026 года. Условия меняются: перед подачей сверьте их на сайте вуза.' },
      { t: 'cta', href: '/institutions/us', text: 'Вузы США' },
      { t: 'cta', href: '/study/us', text: 'Учёба в США: направления' },
    ],
  },
  en: {
    title: 'Common App 2027: how to apply to US universities, dates and fees',
    seoTitle: 'Common App 2027: deadlines, fees and tests at US colleges',
    description: 'How to apply to US universities with the Common App: early and regular deadlines, fees, SAT and ACT, English and aid for international students at seven colleges.',
    blocks: [
      { t: 'p', text: 'The **Common App** is one application through which, by its own count, you can apply to more than 1,200 colleges. But each college sets its own deadlines, tests, essays and recommendations. Below: how it works and what seven well-known colleges themselves say for entry in fall 2027: Harvard, Yale, Princeton, Brown, Cornell, the University of Pennsylvania and Dartmouth. The early deadline for this intake (1 November 2026) has passed; the regular deadlines of 1–5 January 2027 are ahead. Everything was checked on the official sites on 18 November 2026. The tuition at these colleges is in [Harvard and Ivy League tuition: what a year costs](/blog/harvard-ivy-league-tuition-cost).' },
      { t: 'h2', id: 'how', text: 'How the Common App works' },
      {
        t: 'ul',
        items: [
          '**One application, many colleges.** By its own count you can apply to more than 1,200 member colleges through it.',
          '**Each college has its own requirements.** A college\'s page in the Common App shows its requirements for tests and writing, its deadlines and more. Every college chooses its own recommendation requirements.',
          '**Who sends what.** The school counselor sends the School Report and the transcript, teachers send recommendations. A parent form is needed only if you apply by a college\'s early decision deadline.',
          '**College supplements.** Many colleges put short questions or essay prompts inside the application, and some use a separate writing supplement. A college can make the personal essay optional or required.',
          '**Fee waivers.** You can request a Common App fee waiver, which your counselor must confirm, or use the college\'s own waiver.',
        ],
      },
      { t: 'h2', id: 'rounds', text: 'The rounds' },
      {
        t: 'ul',
        items: [
          '**Early Decision (binding)** at Brown, Cornell, Pennsylvania and Dartmouth: deadline 1 November, decision in December.',
          '**A restricted early round** at Harvard (Restrictive Early Action), Yale (Single-Choice Early Action) and Princeton (single-choice early action): deadline 1 November, decision in mid-December. Yale and Princeton ask for a reply to the offer by 1 May.',
          '**Regular Decision:** 1 January (Harvard, Princeton, Dartmouth), 2 January (Yale, Cornell) or 5 January (Brown, Pennsylvania). Decisions arrive from late March to April.',
          '**For these seven colleges the early deadline has passed;** you can still make the regular round. If a college has another early round, its page says so.',
        ],
      },
      { t: 'h2', id: 'colleges', text: 'Deadlines and fees by college' },
      {
        t: 'ul',
        items: [
          '[Harvard University](/institutions/us/harvard-university): early round 1 November (decision in mid-December), regular 1 January (decision at the end of March). The fee is $95, or a waiver in case of hardship. You apply through the Common App with the Harvard College Questions supplement.',
          '[Yale University](/institutions/us/yale-university): early round 1 November (decision in mid-December), regular 2 January (decision in late March). It accepts the Common App, the Coalition Application (Scoir) and QuestBridge; you may submit only one application. Yale does not issue its own fee waivers: you request one through the Common App or the Coalition. We did not find the fee on the pages we read.',
          '[Princeton University](/institutions/us/princeton-university): early round 1 November (decision in mid-December), regular 1 January (decision in late March). You apply through the Common App. There is a fee waiver for low-income students; the fee itself is not stated on the pages we read.',
          '[Brown University](/institutions/us/brown-university): Early Decision 1 November (decision in mid-December), regular round 5 January (decision in early April). The fee is $80, or a waiver. You apply through the Common App.',
          '[Cornell University](/institutions/us/cornell-university): Early Decision 1 November (other materials by 13 November; decision in mid-December), regular round 2 January (other materials by 19 January; decision in late March). The fee is $85. You apply through the Common App with the Cornell supplement.',
          '[University of Pennsylvania](/institutions/us/university-of-pennsylvania): Early Decision 1 November 2026 (decision in December), regular round 5 January 2027 (decision in April). The fee is $75. It accepts the Common App, the Coalition and QuestBridge.',
          '[Dartmouth College](/institutions/us/dartmouth-college): Early Decision 1 November (decision in mid-December), regular round 1 January (decision in late March or early April). The fee is $85. First-year applicants must use the Common App; QuestBridge is accepted too.',
        ],
      },
      { t: 'note', text: 'The dates on the pages of Harvard, Yale, Princeton, Cornell and Dartmouth carry no year; Pennsylvania shows the year (2026 and 2027), Brown ties its pages to the 2026-27 cycle. Columbia University is not in the list: its site could not be opened for the check.' },
      { t: 'h2', id: 'tests', text: 'Tests and English' },
      {
        t: 'ul',
        items: [
          '**The SAT or ACT** is required of first-year applicants at Harvard, Yale, Brown, Cornell, Pennsylvania and Dartmouth. Dartmouth lets international applicants use three AP exams, the IB, A-Levels or a national exam instead.',
          '**Princeton** stays test-optional for fall 2027 entry and will require the SAT or ACT again from fall 2028 entry.',
          '**Harvard** does not require an English exam: you may send results if you wish. TOEFL, IELTS and Duolingo results do not replace the SAT or ACT.',
          '**English is needed if your schooling was not in English.** Yale asks for TOEFL, IELTS, Cambridge English, Duolingo or InitialView if you had less than two years of secondary education in English. Princeton asks for TOEFL, IELTS Academic, Duolingo or PTE Academic unless you spent three years in a school taught in English. Pennsylvania asks for TOEFL, IELTS Academic or Duolingo if English is not your first language and you lack three years of schooling in it. Dartmouth asks for an exam if your first language is not English and you had less than two years of English-medium schooling.',
          '**Score guidance.** Yale calls a TOEFL iBT of 5 or higher on the new 1–6 scale competitive (for tests taken after 21 January 2026). Pennsylvania gives guidance of TOEFL iBT 5 or above, IELTS 7 or above and Duolingo 130 or above; it has no hard minimum.',
          '**Brown and Cornell** also require proof of English; see their pages for the scores. Brown expects the official results for fall 2027 enrolment in May 2027.',
        ],
      },
      { t: 'h2', id: 'aid', text: 'Financial aid for international students' },
      {
        t: 'ul',
        items: [
          '**Need is not considered in admission (need-blind):** Yale, Princeton and Dartmouth say so outright. Brown says it is need-blind for international students from the Class of 2029.',
          '**Harvard:** aid is based on need, admission decisions are made without regard to whether you applied for aid, and Harvard meets demonstrated need. The words "need-blind" do not appear on the page.',
          '**Need is considered (need-aware):** Cornell and Pennsylvania. Both also say they meet 100% of the demonstrated need of the admitted students who need aid.',
          '**Meeting need:** Yale, Princeton, Dartmouth and Brown say they meet 100% of demonstrated need. Princeton gives grants rather than loans; Brown does so if you applied for aid with your application.',
          '**Ask for aid at once.** Brown and Pennsylvania say the request is made together with the application. Cornell\'s aid deadlines for international students are the same: 1 November for Early Decision and 2 January for the regular round.',
        ],
      },
      { t: 'h2', id: 'plan', text: 'What to do, in order' },
      {
        t: 'ol',
        items: [
          'Make a list of colleges and open each college\'s page: deadline, tests, essays, recommendations, fee.',
          'Book the SAT or ACT and, if needed, an English test early: Pennsylvania accepts results for the regular round no later than December 2026.',
          'Ask your school counselor and teachers for recommendations, the School Report and the transcript.',
          'Fill in the Common App and the colleges\' supplements.',
          'If the fee is a burden for your family, request a waiver through the Common App or the college; apply for financial aid at the same time.',
          'Submit before the deadlines of 1–5 January 2027 and leave a margin for technical problems.',
        ],
      },
      { t: 'h2', id: 'sources', text: 'Sources' },
      { t: 'p', text: 'Common App: [guide for first-year students](https://www.commonapp.org/apply/first-year-students). Colleges: [Harvard](https://college.harvard.edu/admissions/apply/first-year-applicants), [Yale](https://admissions.yale.edu/timelines), [Princeton](https://admission.princeton.edu/apply/first-year-application-dates-deadlines), [Brown](https://admission.brown.edu/first-year/regular-decision), [Cornell](https://admissions.cornell.edu/how-to-apply/first-year-applicants), [Pennsylvania](https://admissions.upenn.edu/how-to-apply/first-year-applicants), [Dartmouth](https://admissions.dartmouth.edu/apply/apply-dartmouth). Checked on 18 November 2026. Conditions change: check them on the college\'s site before you apply.' },
      { t: 'cta', href: '/institutions/us', text: 'Institutions in the United States' },
      { t: 'cta', href: '/study/us', text: 'Study in the United States: fields' },
    ],
  },
};
