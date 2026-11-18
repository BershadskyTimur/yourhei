import type { Article } from '@/lib/blog/types';

// Every rule below was read on the official pages on 18 November 2026: DAAD (requirements overview, admission database, Studienkollegs,
// application process, finances), uni-assist (educational certificates and translations, "Info country by country" for Georgia, Armenia,
// Azerbaijan, Kazakhstan, Kyrgyzstan, Uzbekistan, Ukraine, Russia, Belarus and Turkey, VPD), anabin (the guides for institutions and degrees)
// and the Federal Foreign Office FAQ on student visas.
// NOT found on any official page read, so deliberately not stated in the text: which countries need the APS certificate; what the status H-
// of anabin means; the blocked-account amount for 2026 (DAAD gives EUR 992 a month, EUR 11,904 a year "since January 2025"); the names of
// blocked-account providers; whether uni-assist requires an apostille (its country pages do not mention it).
export const germanyDocuments: Article = {
  slug: 'germany-admission-documents-anabin-blocked-account',
  published: '2026-11-27',
  updated: '2026-11-27',
  ru: {
    title: 'Документы для вуза Германии: перевод, Anabin, апостиль, Sperrkonto',
    seoTitle: 'Документы в вуз Германии: Anabin, перевод, Sperrkonto',
    description: 'Что подготовить для поступления в Германию: признание аттестата, переводы, Anabin, Studienkolleg, апостиль, APS и подтверждение средств (Sperrkonto).',
    blocks: [
      { t: 'p', text: 'Статья [Как подать заявку в университет Германии](/blog/germany-how-to-apply-uni-assist) отвечает на вопрос, куда и когда подавать. Здесь — что подготовить: признают ли ваш аттестат, как заверять копии и переводы, зачем нужен Anabin, нужны ли апостиль и APS, сколько денег подтверждать для визы. Сведения проверены на официальных сайтах 18 ноября 2026 года. Там, где официальный источник ничего не говорит, мы так и пишем.' },
      { t: 'h2', id: 'certificate', text: 'Даёт ли ваш аттестат доступ к вузу' },
      {
        t: 'ul',
        items: [
          '**Не каждый иностранный аттестат подходит.** По данным DAAD, без права на поступление в вуз (Hochschulzugangsberechtigung) сразу в немецкий вуз не попасть. Часто нужно пройти 2–3 семестра похожего обучения в вузе своей страны или подготовительный курс в Германии.',
          '**Как проверить.** В [базе DAAD о допуске](https://www.daad.de/en/studying-in-germany/requirements/admission-database/) можно сверить свой аттестат по стране (около 140 стран, только бакалавриат). Результат не обязывает: решение всегда принимает вуз.',
          '**Studienkolleg** — подготовительный курс при вузах Германии: обычно два семестра, у сильных студентов один. Для приёма нужен немецкий на уровне B1–B2, в конце сдают экзамен Feststellungsprüfung: он открывает доступ ко всем вузам страны. Подавать можно напрямую в Studienkolleg или через uni-assist.',
          '**Магистратура.** База DAAD её не описывает. Что нужно от диплома и оценок, смотрите на странице программы и у вуза.',
        ],
      },
      { t: 'h2', id: 'anabin', text: 'Anabin: проверка вуза и диплома' },
      {
        t: 'ul',
        items: [
          '**Что это.** База данных Конференции министров образования земель (KMK), которую ведёт её центр ZAB. Она только на немецком. Ею пользуются вузы и ведомства, а DAAD советует и самому абитуриенту проверить по ней, признан ли его аттестат.',
          '**Статус вуза H+.** По руководству Anabin, диплом, как правило, можно признать, только если он получен в государственном или государственно признанном вузе: у таких вузов статус H+.',
          '**Статус H+/−.** Для дипломов из некоторых стран признание требует дополнительных условий.',
          '**Ограничения.** База не претендует на полноту. Если по ней нельзя подтвердить, что диплом эквивалентен немецкому, можно запросить официальную оценку документов (Zeugnisbewertung). Решение о зачислении всё равно принимает вуз.',
        ],
      },
      { t: 'h2', id: 'copies', text: 'Копии и переводы' },
      {
        t: 'ul',
        items: [
          '**Через uni-assist** документы загружают сканами в PDF. Скан должен быть полным и читаемым. Нужны официальные документы: с подписью и печатью учебного заведения, ссылкой на автоматическую выдачу или кодом проверки.',
          '**Перевод.** Документы загружают на языке оригинала вместе с переводом на немецкий или английский. Переводить должен присяжный переводчик или лицо, чьи переводы допускает суд, либо отдел выдавшей школы или вуза, которому это разрешено.',
          '**DAAD пишет строже:** принимаются только официально заверенные копии и переводы; заверить можно, например, в посольстве Германии в вашей стране (платно). Некоторые вузы принимают и документы на английском и французском. Поэтому сверьтесь с тем, как принимает именно ваш вуз.',
          '**Нотариус.** На страницах uni-assist для Грузии, Армении, Азербайджана, Казахстана, Киргизии, Узбекистана, Украины, России и Беларуси сказано, что подпись и личность переводчика заверяет нотариус вашей страны.',
          '**Турция** строже: принимается только штамп присяжного переводчика (yeminli tercüman). Штамп только на английском или немецком не принимается.',
        ],
      },
      { t: 'h2', id: 'apostille', text: 'Апостиль и APS' },
      {
        t: 'ul',
        items: [
          '**Апостиль.** На страницах uni-assist для Грузии, Армении, Азербайджана, Казахстана, Киргизии, Узбекистана, Украины, России, Беларуси и Турции апостиль и легализация не упоминаются. Это не значит, что их не потребуют нигде: вуз, посольство или ведомство, куда вы подаёте, могут просить своё. Уточните у них до того, как платить за апостиль.',
          '**APS** — проверка документов, которую проводят службы при посольствах Германии в ряде стран, например в Китае и Индии. Индийская служба пишет, что сертификат обычно входит в документы на студенческую визу. На страницах uni-assist для стран из списка выше и на страницах DAAD о требованиях к поступлению APS не упоминается; нужен ли он вам, подтвердит немецкое посольство.',
          '**Посредники.** uni-assist пишет, что не сотрудничает с коммерческими агентствами, а APS в Пекине — что для подачи агентства не нужны. Не платите посреднику за справку, пока посольство или вуз не подтвердили, что она нужна.',
        ],
      },
      { t: 'h2', id: 'countries', text: 'Что просят по странам' },
      { t: 'p', text: 'На страницах «Info country by country» uni-assist для каждой страны перечислил особенности. Главное по странам региона:' },
      {
        t: 'ul',
        items: [
          '**Грузия:** аттестат о полном общем образовании с обзором предметов и оценок (его выдаёт школа); диплом вуза — с приложением (Diploma Supplement) и кредитами ECTS.',
          '**Армения:** к аттестату, выданному с 2018 года, нужно подтверждение школы о профиле аттестата.',
          '**Азербайджан и Киргизия:** если программа даёт меньше 60 кредитов в год, приложите действующий регламент вуза.',
          '**Казахстан:** для аттестата, выданного в 2015–2018 годах, нужно отдельное подтверждение 11 лет обучения — через личное дело ученика.',
          '**Узбекистан:** для выписки из вуза приложите официальную шкалу оценок с проходным баллом.',
          '**Украина:** у частного вуза нужны документы об аккредитации вуза и программы: одной лицензии недостаточно.',
          '**Россия:** в выписках с 2016 года должны быть зачётные единицы; если их меньше 60 в год, приложите регламент вуза.',
          '**Турция:** диплом лицея плюс вторая часть результатов YKS/ÖSYM с названием вуза, факультета и типом баллов.',
        ],
      },
      { t: 'h2', id: 'funds', text: 'Деньги для визы: Sperrkonto и другие способы' },
      {
        t: 'ul',
        items: [
          '**Сколько.** По DAAD, студент должен подтвердить 992 евро в месяц, или 11 904 евро в год (с января 2025 года). Актуальную сумму сверьте с посольством: на официальных страницах, которые мы читали, суммы на 2026 год нет.',
          '**Способы.** По DAAD: доход родителей, средства на блокированном счёте (Sperrkonto), банковская гарантия или признанная стипендия. МИД Германии добавляет обязательство третьего лица, у которого достаточно доходов или имущества (Verpflichtungserklärung).',
          '**Блокированный счёт** — счёт в Германии, на который вносят сумму как гарантию. Официальные страницы, которые мы читали, не называют банков и сервисов, где его открывают: спросите посольство.',
          '**Когда.** Подтверждение средств подают вместе с заявлением на визу. МИД пишет, что нужны и документы о том, что вас приняли в вуз.',
        ],
      },
      { t: 'p', text: 'Суммы для других стран: [Сколько денег нужно показать для студенческой визы](/blog/proof-of-funds-student-visa). Про плату за обучение и исключения: [Бесплатно ли учиться в Германии, Чехии и Финляндии](/blog/free-tuition-germany-czechia-finland).' },
      { t: 'h2', id: 'plan', text: 'Порядок действий' },
      {
        t: 'ol',
        items: [
          'Проверьте аттестат в базе DAAD, а вуз и диплом — в Anabin. Если аттестат не даёт доступа, узнайте про Studienkolleg или год обучения на родине.',
          'Откройте страницу вашей страны на uni-assist и сверьте список документов.',
          'Закажите официальные документы, заверенные переводы и сканы заранее: на это нужно время. Отмечайте готовое в [чек-листе документов](/checklist).',
          'Подайте заявку не позднее чем за 8 недель до срока, как советует uni-assist. Общие даты DAAD: до 15 июля на зимний семестр, до 15 января на летний; срок вуза важнее.',
          'После зачисления спросите посольство про список документов и подтверждение средств для визы.',
        ],
      },
      { t: 'h2', id: 'sources', text: 'Источники' },
      { t: 'p', text: 'DAAD: [условия поступления](https://www.daad.de/en/studying-in-germany/requirements/overview/), [база допуска](https://www.daad.de/en/studying-in-germany/requirements/admission-database/), [Studienkolleg](https://www.daad.de/en/studying-in-germany/requirements/studienkollegs/), [порядок подачи](https://www.daad.de/en/studying-in-germany/requirements/application-process/). uni-assist: [документы и переводы](https://www.uni-assist.de/en/how-to-apply/plan-your-application/educational-certificates-translations/), [информация по странам](https://www.uni-assist.de/en/tools/info-country-by-country/). [Anabin](https://anabin.kmk.org/). [МИД Германии, вопросы о студенческой визе](https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/606850-606850). Проверено 18 ноября 2026 года. Условия меняются: перед подачей сверьте их на сайтах.' },
      { t: 'cta', href: '/deadlines/de', text: 'Сроки подачи в Германии' },
      { t: 'cta', href: '/checklist', text: 'Чек-лист документов' },
    ],
  },
  en: {
    title: 'Documents for a German university: translations, anabin, Sperrkonto',
    seoTitle: 'German university documents: anabin, Sperrkonto, APS',
    description: 'What to prepare to study in Germany: certificate recognition, certified translations, anabin, Studienkolleg, apostille, APS and proof of funds (Sperrkonto).',
    blocks: [
      { t: 'p', text: 'The article [How to apply to a German university](/blog/germany-how-to-apply-uni-assist) answers where and when to apply. This one covers what to prepare: whether your certificate is recognised, how to certify copies and translations, what anabin is for, whether you need an apostille or APS, and how much money to prove for the visa. Everything was checked on the official sites on 18 November 2026. Where an official source says nothing, we say so.' },
      { t: 'h2', id: 'certificate', text: 'Does your certificate give access to a university' },
      {
        t: 'ul',
        items: [
          '**Not every foreign certificate is enough.** According to DAAD, without a university entrance qualification (Hochschulzugangsberechtigung) you cannot go straight into a German university. You often need 2–3 semesters of comparable study at a university in your home country or a preparatory course in Germany.',
          '**How to check.** In the [DAAD admission database](https://www.daad.de/en/studying-in-germany/requirements/admission-database/) you can check your certificate by country (about 140 countries, bachelor\'s level only). The result is not binding: the university always decides.',
          '**The Studienkolleg** is a preparatory course at German universities: usually two semesters, one for strong students. You need German at B1–B2 to enter, and you finish with the Feststellungsprüfung exam, which opens access to all universities in the country. You can apply to a Studienkolleg directly or through uni-assist.',
          '**Master\'s.** The DAAD database does not cover it. For what a diploma and grades must show, see the programme page and ask the university.',
        ],
      },
      { t: 'h2', id: 'anabin', text: 'Anabin: checking a university and a degree' },
      {
        t: 'ul',
        items: [
          '**What it is.** A database of the Standing Conference of the Ministers of Education (KMK), run by its centre ZAB. It is in German only. Universities and authorities use it, and DAAD advises applicants to use it to check whether their certificate is recognised.',
          '**Institution status H+.** According to the anabin guide, a degree can generally be recognised only if it was earned at a state or state-recognised institution: such institutions have the status H+.',
          '**Status H+/-.** For degrees from some countries, recognition requires further conditions.',
          '**Limits.** The database does not claim to be complete. If it cannot show that a degree is equivalent to a German one, you can request an official assessment of your documents (Zeugnisbewertung). The university still decides on admission.',
        ],
      },
      { t: 'h2', id: 'copies', text: 'Copies and translations' },
      {
        t: 'ul',
        items: [
          '**Through uni-assist** you upload scans as PDF. A scan must be complete and legible. You need official certificates: bearing a signature and stamp of the issuing institution, a note that they were issued automatically, or a verification code.',
          '**Translation.** Upload documents in the original language with a translation into German or English. The translator must be a sworn translator or a person whose translations a court accepts, or a department of the issuing school or university that is authorised to do so.',
          '**DAAD is stricter:** only officially certified copies and translations are accepted; you can have them certified, for example, at the German embassy in your country (for a fee). Some universities also accept documents in English and French. So check how your own university accepts them.',
          '**A notary.** The uni-assist pages for Georgia, Armenia, Azerbaijan, Kazakhstan, Kyrgyzstan, Uzbekistan, Ukraine, Russia and Belarus say that a notary of your country attests the translator\'s signature and identity.',
          '**Turkey** is stricter: only the stamp of a sworn translator (yeminli tercüman) is accepted. A stamp in English or German alone is not accepted.',
        ],
      },
      { t: 'h2', id: 'apostille', text: 'Apostille and APS' },
      {
        t: 'ul',
        items: [
          '**Apostille.** The uni-assist pages for Georgia, Armenia, Azerbaijan, Kazakhstan, Kyrgyzstan, Uzbekistan, Ukraine, Russia, Belarus and Turkey do not mention apostille or legalisation. That does not mean nobody will ask for one: the university, an embassy or an authority you apply to may want their own. Ask them before you pay for an apostille.',
          '**APS** is a document check run by services attached to German embassies in a number of countries, for example China and India. The Indian service says the certificate is generally part of the documents for the student visa. The uni-assist pages for the countries listed above and the DAAD pages on entry requirements do not mention APS; whether you need it, the German embassy will confirm.',
          '**Agents.** uni-assist says it does not cooperate with commercial agencies, and APS in Beijing says agencies are not needed to apply. Do not pay an agent for a certificate until the embassy or the university has confirmed that you need it.',
        ],
      },
      { t: 'h2', id: 'countries', text: 'What is asked by country' },
      { t: 'p', text: 'On its "Info country by country" pages uni-assist lists the particulars of each country. The main points for the region:' },
      {
        t: 'ul',
        items: [
          '**Georgia:** the certificate of complete general education with an overview of subjects and grades (the school issues it); a university diploma with the Diploma Supplement and ECTS credits.',
          '**Armenia:** a certificate issued from 2018 needs a school confirmation of the certificate\'s profile.',
          '**Azerbaijan and Kyrgyzstan:** if the programme gives fewer than 60 credits a year, add the university\'s current regulations.',
          '**Kazakhstan:** for a certificate issued in 2015–2018 you need a separate proof of 11 years of schooling, through the student\'s personal file.',
          '**Uzbekistan:** for a university transcript add the official grading scale with the pass mark.',
          '**Ukraine:** for a private university you need documents on the accreditation of the institution and of the programme: a licence alone is not enough.',
          '**Russia:** transcripts from 2016 must show credit points; if there are fewer than 60 a year, add the university\'s regulations.',
          '**Turkey:** the lise diploma plus the second part of the YKS/ÖSYM results naming the university, faculty and score type.',
        ],
      },
      { t: 'h2', id: 'funds', text: 'Money for the visa: Sperrkonto and other ways' },
      {
        t: 'ul',
        items: [
          '**How much.** According to DAAD a student must prove EUR 992 a month, or EUR 11,904 a year (since January 2025). Check the current amount with the embassy: the official pages we read give no amount for 2026.',
          '**Ways to prove it.** According to DAAD: parents\' income, money on a blocked account (Sperrkonto), a bank guarantee or a recognised scholarship. The Federal Foreign Office adds a declaration of commitment by a person with enough income or assets (Verpflichtungserklärung).',
          '**A blocked account** is an account in Germany into which you pay a sum as security. The official pages we read do not name banks or services that open one: ask the embassy.',
          '**When.** You submit proof of funds with your visa application. The Foreign Office says you also need documents showing that a university has accepted you.',
        ],
      },
      { t: 'p', text: 'The amounts for other countries: [How much money you must show for a student visa](/blog/proof-of-funds-student-visa). On tuition and its exceptions: [Is study free in Germany, Czechia and Finland?](/blog/free-tuition-germany-czechia-finland).' },
      { t: 'h2', id: 'plan', text: 'What to do, in order' },
      {
        t: 'ol',
        items: [
          'Check your certificate in the DAAD database and your university and degree in anabin. If the certificate does not give access, find out about a Studienkolleg or a year of study at home.',
          'Open the page for your country on uni-assist and compare its list of documents.',
          'Order official documents, certified translations and scans early: they take time. Tick off what is ready in the [document checklist](/checklist).',
          'Apply at least 8 weeks before the deadline, as uni-assist advises. DAAD\'s general dates: 15 July for the winter semester, 15 January for the summer semester; the university\'s own deadline matters more.',
          'After admission ask the embassy for its list of documents and about proof of funds for the visa.',
        ],
      },
      { t: 'h2', id: 'sources', text: 'Sources' },
      { t: 'p', text: 'DAAD: [entry requirements](https://www.daad.de/en/studying-in-germany/requirements/overview/), [admission database](https://www.daad.de/en/studying-in-germany/requirements/admission-database/), [Studienkollegs](https://www.daad.de/en/studying-in-germany/requirements/studienkollegs/), [application process](https://www.daad.de/en/studying-in-germany/requirements/application-process/). uni-assist: [documents and translations](https://www.uni-assist.de/en/how-to-apply/plan-your-application/educational-certificates-translations/), [info country by country](https://www.uni-assist.de/en/tools/info-country-by-country/). [Anabin](https://anabin.kmk.org/). [Federal Foreign Office, FAQ on student visas](https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/606850-606850). Checked on 18 November 2026. Conditions change: check them on the sites before you apply.' },
      { t: 'cta', href: '/deadlines/de', text: 'Application deadlines in Germany' },
      { t: 'cta', href: '/checklist', text: 'Document checklist' },
    ],
  },
};
