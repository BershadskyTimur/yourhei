import type { Article } from '@/lib/blog/types';

export const visegradApply: Article = {
  slug: 'visegrad-scholarship-how-to-apply',
  published: '2026-11-19',
  updated: '2026-11-19',
  ru: {
    title: 'Visegrad Scholarship: учёба в Чехии, Венгрии, Польше, Словакии',
    description: 'Как устроена стипендия Вышеградского фонда: кто может подать заявку (включая Грузию, Армению, Азербайджан, Украину), 3 500 евро за семестр, сроки набора 2027 и документы.',
    blocks: [
      { t: 'p', text: 'Visegrad Scholarship — стипендия Международного Вышеградского фонда для студентов магистратуры и послемагистерских исследователей, которые хотят провести один–два семестра в университете Чехии, Венгрии, Польши или Словакии. Она открыта и гражданам стран Восточного партнёрства и Западных Балкан, среди них Грузия, Армения, Азербайджан и Украина. Ниже то, что сказано на официальной странице программы (проверено 27 октября 2026 года).' },
      { t: 'h2', id: 'what', text: 'Что это за программа' },
      {
        t: 'ul',
        items: [
          'Стипендия поддерживает студентов магистратуры и послемагистерских студентов и исследователей на срок до двух семестров в аккредитованных вузах Центральной и Восточной Европы. Таких вузов больше 190.',
          'Подойдут все дисциплины и любой язык обучения.',
          '**Формат.** До двух семестров на уровне магистратуры или послемагистерской программы (докторантура, постдок).',
          '**Выплаты.** 3 500 евро за семестр самому стипендиату и 2 000 евро за семестр принимающему вузу.',
        ],
      },
      { t: 'h2', id: 'who', text: 'Кто может подать заявку' },
      {
        t: 'ul',
        items: [
          'Нужна степень бакалавра или магистра.',
          '**Граждане Чехии, Венгрии, Польши и Словакии** могут учиться в любом аккредитованном вузе в другой стране Вышеграда и в Албании, Армении, Азербайджане, Беларуси, Боснии и Герцеговине, Грузии, Косове, Молдове, Черногории, Северной Македонии, Сербии и Украине.',
          '**Граждане Албании, Армении, Азербайджана, Беларуси, Боснии и Герцеговины, Грузии, Косова, Молдовы, Черногории, Северной Македонии, Сербии и Украины** могут учиться в странах Вышеграда.',
          'Страна вашего гражданства должна отличаться от страны принимающего вуза. Вы можете уже учиться в этом вузе, но предыдущие уровни обучения должны быть завершены в другой стране, не там, где вы просите стипендию.',
          'Расстояние между вашим нынешним работодателем или вузом (или постоянным местом жительства) и принимающим вузом должно превышать 150 км.',
          'Предпочтение отдают тем, кого раньше не поддерживали, и тем, чья тема исследования важна для региона Вышеграда.',
        ],
      },
      { t: 'h2', id: 'timeline', text: 'Сроки набора 2027' },
      {
        t: 'ul',
        items: [
          '**1 января 2027, 12:00:** начало приёма заявок.',
          '**15 апреля 2027, 12:00:** окончательный срок подачи.',
          '**31 мая 2027, 12:00:** объявление результатов.',
        ],
      },
      { t: 'h2', id: 'documents', text: 'Как подать заявку и какие документы' },
      {
        t: 'ul',
        items: [
          'Заявку подают онлайн через систему My Visegrad не позднее срока подачи. Документы нужны на английском или с переводом (заверенным присяжным переводчиком или официальным лицом университета).',
          '**Для магистерской стипендии:** скан выписки об оценках минимум за два последних завершённых семестра или приложение к диплому; скан письма о принятии от принимающего вуза (или подтверждение подачи документов, если вас ещё не приняли на момент заявки).',
          '**Для послемагистерской стипендии:** скан письма о принятии с подробным планом работы.',
          'Подробности и советы по поиску принимающего вуза есть в инструкции и правилах программы на странице.',
        ],
      },
      { t: 'h2', id: 'plan', text: 'Как планировать' },
      {
        t: 'ol',
        items: [
          'Выберите страну и вуз в Чехии, Венгрии, Польше или Словакии (для граждан Вышеграда — в другой стране региона) и проверьте, что расстояние больше 150 км.',
          'Свяжитесь с вузом и получите письмо о принятии: оно нужно к подаче. В [нашем каталоге](/catalog) можно найти университеты этих стран и программы.',
          'Подготовьте выписку об оценках, диплом и переводы по [чек-листу](/checklist).',
          'Сравните с другими стипендиями на [странице стипендий](/scholarships) с фильтром по гражданству. Если вы из Грузии, Армении, Азербайджана или Украины, посмотрите статью [Стипендии по гражданству](/blog/scholarships-by-citizenship-caucasus-central-asia).',
        ],
      },
      { t: 'p', text: 'Мы перечисляем программы и ведём вас на официальную страницу; мы не гарантируем, что вы получите стипендию.' },
      { t: 'p', text: 'Источник: [Международный Вышеградский фонд, Visegrad Scholarship Program](https://www.visegradfund.org/visegrad-scholarship-program-apply).' },
      { t: 'cta', href: '/scholarships', text: 'Все стипендии' },
      { t: 'cta', href: '/catalog', text: 'Найти программу в Чехии, Венгрии, Польше' },
    ],
  },
  en: {
    title: 'Visegrad Scholarship: study in Czechia, Hungary, Poland or Slovakia',
    description: 'How the Visegrad Fund scholarship works: who can apply (including Georgia, Armenia, Azerbaijan, Ukraine), 3,500 euros per semester, the 2027 dates and the documents.',
    blocks: [
      { t: 'p', text: 'The Visegrad Scholarship is a scholarship of the International Visegrad Fund for master\'s students and post-master\'s researchers who want to spend one or two semesters at a university in Czechia, Hungary, Poland or Slovakia. It is also open to citizens of the Eastern Partnership and Western Balkans countries, among them Georgia, Armenia, Azerbaijan and Ukraine. Below is what the official programme page says (checked on 27 October 2026).' },
      { t: 'h2', id: 'what', text: 'What this programme is' },
      {
        t: 'ul',
        items: [
          'The scholarship supports master\'s and post-master\'s students and researchers for up to two semesters at accredited higher education institutions in Central and Eastern Europe. There are more than 190 such institutions.',
          'All disciplines and any language of instruction are eligible.',
          '**Format.** Up to two semesters at master\'s or post-master\'s level (doctoral, postdoc).',
          '**Funding.** 3,500 euros per semester for the scholar plus 2,000 euros per semester for the host institution.',
        ],
      },
      { t: 'h2', id: 'who', text: 'Who can apply' },
      {
        t: 'ul',
        items: [
          'You must hold a bachelor\'s or master\'s degree.',
          '**Citizens of Czechia, Hungary, Poland and Slovakia** can study at any accredited institution in another Visegrad country and in Albania, Armenia, Azerbaijan, Belarus, Bosnia and Herzegovina, Georgia, Kosovo, Moldova, Montenegro, North Macedonia, Serbia and Ukraine.',
          '**Citizens of Albania, Armenia, Azerbaijan, Belarus, Bosnia and Herzegovina, Georgia, Kosovo, Moldova, Montenegro, North Macedonia, Serbia and Ukraine** can study in the Visegrad countries.',
          'The country of your citizenship must be different from the country of the host institution. You can already be enrolled at the university, but your previous levels of study must have been completed in a country other than the one where you apply for the scholarship.',
          'The distance between your current employer or university (or permanent residence) and the host university must exceed 150 km.',
          'Preference is given to applicants not supported previously and to those whose study or research topics are relevant to the Visegrad region.',
        ],
      },
      { t: 'h2', id: 'timeline', text: 'The 2027 dates' },
      {
        t: 'ul',
        items: [
          '**1 January 2027, 12:00:** the call opens.',
          '**15 April 2027, 12:00:** final application deadline.',
          '**31 May 2027, 12:00:** results announced.',
        ],
      },
      { t: 'h2', id: 'documents', text: 'How to apply and which documents' },
      {
        t: 'ul',
        items: [
          'The application is submitted online through My Visegrad by the deadline. The documents must be in English or accompanied by a translation (certified by a sworn translator or by a university official).',
          '**For the master\'s scholarship:** a scanned transcript of records covering at least the last two completed semesters or a diploma supplement; a scanned letter of acceptance from the host university (or proof of applying, if you are not yet accepted when you apply for the scholarship).',
          '**For the post-master\'s scholarship:** a scanned letter of acceptance with a detailed working plan.',
          'More information and advice on finding a host university is in the instructions and the rules on the programme page.',
        ],
      },
      { t: 'h2', id: 'plan', text: 'How to plan' },
      {
        t: 'ol',
        items: [
          'Choose a country and university in Czechia, Hungary, Poland or Slovakia (for citizens of the Visegrad countries, in another country of the region) and check that the distance is more than 150 km.',
          'Contact the university and get a letter of acceptance: you need it to apply. In [our catalogue](/catalog) you can find the universities of these countries and their programmes.',
          'Prepare your transcript, diploma and translations with the [checklist](/checklist).',
          'Compare with other scholarships on the [scholarships page](/scholarships) with the citizenship filter. If you are from Georgia, Armenia, Azerbaijan or Ukraine, see the article [Scholarships by citizenship](/blog/scholarships-by-citizenship-caucasus-central-asia).',
        ],
      },
      { t: 'p', text: 'We list the programmes and send you to the official page; we do not guarantee that you will get a scholarship.' },
      { t: 'p', text: 'Source: [International Visegrad Fund, Visegrad Scholarship Program](https://www.visegradfund.org/visegrad-scholarship-program-apply).' },
      { t: 'cta', href: '/scholarships', text: 'All scholarships' },
      { t: 'cta', href: '/catalog', text: 'Find a programme in Czechia, Hungary or Poland' },
    ],
  },
};
