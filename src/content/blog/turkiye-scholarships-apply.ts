import type { Article } from '@/lib/blog/types';

export const turkiyeScholarshipsApply: Article = {
  slug: 'turkiye-scholarships-how-to-apply',
  published: '2026-10-24',
  updated: '2026-10-24',
  ru: {
    title: 'Türkiye Burslari: как подать заявку на стипендию Турции',
    description: 'Как устроена стипендия правительства Турции: уровни, сроки приёма заявок по календарю, список документов, требование к турецкому языку и подача на официальном портале.',
    blocks: [
      { t: 'p', text: 'Türkiye Burslari (Türkiye Scholarships) — государственная стипендия Турции для иностранных студентов. Мы собрали на одном экране то, что сказано на официальном сайте: на какие уровни она рассчитана, когда принимают заявки, какие документы нужны и что важно знать про язык. Страницы проверены 24 октября 2026 года.' },
      { t: 'h2', id: 'what', text: 'Что это за программа' },
      {
        t: 'ul',
        items: [
          '**Уровни.** На сайте перечислены программы уровня колледжа (associate), бакалавриата, магистратуры, докторантуры и исследовательские стипендии. Бакалавриат доступен по определённым направлениям: от инженерных до медицинских, гуманитарных и общественных наук.',
          '**Что входит.** Среди категорий на сайте: ежемесячная стипендия, проживание, медицинская страховка, авиабилет и языковой курс. Размеры и условия по каждой категории смотрите на официальной странице.',
          '**Отбор.** Конкурс основан на заслугах, с упором на академические достижения. Подробности об этапах оценки собраны на отдельной странице сайта.',
          '**Подача.** Заявки принимаются онлайн и бесплатно в системе TBBS: tbbs.turkiyeburslari.gov.tr.',
        ],
      },
      { t: 'h2', id: 'calendar', text: 'Когда подавать' },
      { t: 'p', text: 'Календарь на официальном сайте указывает месяцы, а не точные даты, и не называет год, поэтому конкретные даты нового набора проверяйте в объявлении.' },
      {
        t: 'ul',
        items: [
          '**Общий набор:** заявки с 10 января по 20 февраля; оценка в марте–апреле; собеседования в апреле–июне; результаты в начале августа; оформление документов в августе; переезд в Турцию в сентябре.',
          '**Стипендия за успехи (Success Scholarship):** заявки в октябре–ноябре, результаты в ноябре.',
          '**Исследовательская стипендия:** четыре периода в году: январь–март (результаты в апреле), апрель–июнь (в июле), июль–сентябрь (в октябре), октябрь–декабрь (в январе).',
        ],
      },
      { t: 'h2', id: 'documents', text: 'Какие документы нужны' },
      { t: 'p', text: 'Все кандидаты загружают в систему TBBS:' },
      {
        t: 'ul',
        items: [
          'действующий документ, удостоверяющий личность (удостоверение личности или паспорт);',
          'фотографию, сделанную в течение последнего года;',
          'результаты национальных экзаменов, если они есть;',
          'диплом или временное свидетельство об окончании;',
          'приложение с оценками (transcript);',
          'результаты международных экзаменов (например GRE, GMAT или SAT), если их требует выбранный вуз или программа;',
          'результаты международных языковых тестов (например TOEFL или DELF), если они требуются;',
          'только для докторантуры: тему исследования и образец ваших прежних письменных работ.',
        ],
      },
      { t: 'h2', id: 'language', text: 'Язык: что нужно знать заранее' },
      { t: 'p', text: 'Многие программы в Турции преподаются на турецком. По правилам сайта, кандидатам без сертификата турецкого уровня C1, в том числе выбравшим программы на английском или другом языке, нужно пройти годовой курс турецкого языка и получить сертификат C1 до конца учебного года.' },
      { t: 'h2', id: 'checklist', text: 'Как подготовиться' },
      {
        t: 'ol',
        items: [
          'Откройте [список документов](/checklist) и отметьте, чего не хватает: диплом, оценки, паспорт и переводы лучше собирать заранее.',
          'Выберите направление в разделе программ на официальном сайте и посмотрите, какие экзамены или языковые тесты требует вуз.',
          'Подавайте заявку только на официальном портале. По данным сайта, подача бесплатна: если с вас просят деньги за подачу, это повод усомниться.',
          'Сверьте с календарём, когда открывается набор, и поставьте себе напоминание: общий набор длится около полутора месяцев.',
        ],
      },
      { t: 'p', text: 'Сравнить эту программу с другими стипендиями полного финансирования можно в статье [Стипендии с полным финансированием](/blog/fully-funded-scholarships-for-international-students), а список и фильтр по гражданству есть на [странице стипендий](/scholarships). Мы не гарантируем, что вы получите стипендию.' },
      {
        t: 'p',
        text: 'Источники: [официальный сайт Türkiye Burslari](https://turkiyeburslari.gov.tr/); [календарь заявок](https://turkiyeburslari.gov.tr/calendar); [документы и условия подачи](https://turkiyeburslari.gov.tr/applysteps).',
      },
      { t: 'cta', href: '/scholarships', text: 'Все стипендии' },
      { t: 'cta', href: '/checklist', text: 'Чек-лист документов' },
    ],
  },
  en: {
    title: 'Türkiye Burslari: how to apply for the Turkish government scholarship',
    description: 'How the Turkish government scholarship works: levels, application periods from the calendar, the document list, the Turkish language requirement and where to apply.',
    blocks: [
      { t: 'p', text: 'Türkiye Burslari (Türkiye Scholarships) is the Turkish government scholarship for international students. Here is what the official website says in one place: which levels it covers, when applications are open, which documents you need and what to know about the language. We checked the pages on 24 October 2026.' },
      { t: 'h2', id: 'what', text: 'What the programme is' },
      {
        t: 'ul',
        items: [
          '**Levels.** The website lists associate, bachelor’s, master’s and PhD programmes, and research scholarships. Bachelor’s places are in designated fields, from engineering to health sciences, humanities and social sciences.',
          '**What is included.** The categories on the website include a monthly stipend, accommodation, health insurance, a flight ticket and a language course. Amounts and conditions for each are on the official page.',
          '**Selection.** The competition is merit-based, with an emphasis on academic excellence. The stages of evaluation are described on a separate page of the website.',
          '**Applying.** Applications are online and free of charge, in the TBBS system: tbbs.turkiyeburslari.gov.tr.',
        ],
      },
      { t: 'h2', id: 'calendar', text: 'When to apply' },
      { t: 'p', text: 'The calendar on the official site gives months, not exact dates, and does not name the year, so check the announcement for the exact dates of a new call.' },
      {
        t: 'ul',
        items: [
          '**General application period:** applications from 10 January to 20 February; evaluation in March–April; interviews in April–June; results in early August; initial procedures in August; transfer to Türkiye in September.',
          '**Success Scholarship:** applications in October–November, results in November.',
          '**Research Scholarship:** four periods a year: January–March (results in April), April–June (in July), July–September (in October), October–December (in January).',
        ],
      },
      { t: 'h2', id: 'documents', text: 'Which documents you need' },
      { t: 'p', text: 'Every candidate uploads the following to the TBBS system:' },
      {
        t: 'ul',
        items: [
          'a valid identity document (ID card or passport);',
          'a photo taken within the last year;',
          'national exam results, if applicable;',
          'a diploma or a temporary graduation certificate;',
          'a transcript;',
          'international exam results (such as GRE, GMAT or SAT), if your chosen university or programme requires them;',
          'international language test results (such as TOEFL or DELF), if required;',
          'for PhD applications only: a research topic proposal and a written sample of your past research.',
        ],
      },
      { t: 'h2', id: 'language', text: 'Language: what to know in advance' },
      { t: 'p', text: 'Many programmes in Türkiye are taught in Turkish. According to the website, candidates without a C1 Turkish certificate, including those in English or other-language programmes, must attend a one-year Turkish language course and reach C1 by the end of their academic year.' },
      { t: 'h2', id: 'checklist', text: 'How to prepare' },
      {
        t: 'ol',
        items: [
          'Open the [document checklist](/checklist) and tick what you already have: diploma, grades, passport and translations are better collected in advance.',
          'Choose your field in the programmes section of the official website and see which exams or language tests the university requires.',
          'Apply only on the official portal. According to the website it is free of charge: if you are asked to pay for applying, treat it with suspicion.',
          'Check the calendar for when the call opens and set a reminder: the general period lasts about a month and a half.',
        ],
      },
      { t: 'p', text: 'To compare this programme with other fully funded scholarships, read [Fully funded scholarships](/blog/fully-funded-scholarships-for-international-students); the list with a citizenship filter is on the [scholarships page](/scholarships). We do not guarantee that you will receive a scholarship.' },
      {
        t: 'p',
        text: 'Sources: [Türkiye Burslari official website](https://turkiyeburslari.gov.tr/); [application calendar](https://turkiyeburslari.gov.tr/calendar); [documents and conditions](https://turkiyeburslari.gov.tr/applysteps).',
      },
      { t: 'cta', href: '/scholarships', text: 'All scholarships' },
      { t: 'cta', href: '/checklist', text: 'Document checklist' },
    ],
  },
};
