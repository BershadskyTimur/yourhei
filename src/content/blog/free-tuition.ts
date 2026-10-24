import type { Article } from '@/lib/blog/types';

export const freeTuition: Article = {
  slug: 'free-tuition-germany-czechia-finland',
  published: '2026-11-16',
  updated: '2026-11-16',
  ru: {
    title: 'Бесплатно ли учиться в Германии, Чехии и Финляндии',
    description: 'Что на самом деле бесплатно в Германии, Чехии и Финляндии, а за что придётся платить: правила платы за обучение по официальным страницам, с исключениями.',
    blocks: [
      { t: 'p', text: '«Бесплатное обучение» — самый популярный запрос абитуриентов, и самый обманчивый. Бесплатным бывает **обучение**, но не жизнь вокруг него: проживание, страховка, взносы и подтверждение средств для визы остаются на вас. К тому же у каждого правила есть исключения. Ниже — три страны, у которых на официальных страницах написано, что и где бесплатно. Мы проверили эти страницы 24 октября 2026 года.' },
      { t: 'h2', id: 'germany', text: 'Германия: бесплатно в большинстве государственных вузов, но есть исключения' },
      {
        t: 'ul',
        items: [
          '**Общее правило.** По данным DAAD, обычно нет платы за бакалавриат и большинство магистерских программ в государственных вузах.',
          '**Баден-Вюртемберг.** Граждане стран вне ЕС платят 1 500 евро за семестр за бакалавриат, магистратуру, программы Diplom и государственные экзамены. Докторанты от платы освобождены.',
          '**Бавария.** Плата для студентов из-за пределов ЕС и ЕЭЗ «может действовать» и достигать нескольких тысяч евро за семестр; вузы решают сами, брать ли её и сколько.',
          '**Частные вузы.** Они могут брать существенно больше.',
          '**Некоторые «продолженные» магистерские программы** (continuing education) могут быть платными.',
          '**Семестровый взнос.** Это не плата за обучение, он оплачивает студенческие услуги и самоуправление. Он зависит от вуза и составляет от 70 до 430 евро; платится при зачислении и перед каждым семестром.',
        ],
      },
      { t: 'p', text: 'Для визы нужно подтвердить средства на жизнь: в Германии это заблокированный счёт, по 992 евро в месяц ([подробнее о суммах для визы](/blog/proof-of-funds-student-visa)).' },
      { t: 'h2', id: 'czechia', text: 'Чехия: бесплатно на чешском, на английском обычно платно' },
      {
        t: 'ul',
        items: [
          '**Программы на чешском** в государственных вузах бесплатны независимо от гражданства. Платить придётся за сопутствующее: вступительный взнос, жильё и жизнь; при превышении стандартного срока обучения могут взять дополнительную плату.',
          '**Нужен чешский.** Для большинства программ на чешском требуется уровень не ниже B2.',
          '**Программы на английском.** По данным портала Study in Czechia, у большинства они стоят от 0 до 6 000 евро в год, а медицина, искусство и некоторые узкие направления — 8 000–25 000 евро в год. Точная сумма зависит от вуза и программы.',
          '**Частные вузы** сами устанавливают плату.',
        ],
      },
      { t: 'h2', id: 'finland', text: 'Финляндия: бесплатно на финском и шведском и в докторантуре' },
      {
        t: 'ul',
        items: [
          '**Бакалавриат и магистратура на английском.** Студенты из-за пределов ЕС, ЕЭЗ и Швейцарии обычно платят; по данным Study in Finland, типичный диапазон — от 9 000 до 20 000 евро в год. Некоторые студенты могут быть освобождены по статусу проживания или другим основаниям.',
          '**Программы на финском или шведском** плату за обучение не берут.',
          '**Докторантура** бесплатна независимо от гражданства; жизнь вы оплачиваете сами.',
          '**Вступительный взнос.** Заявители из-за пределов ЕС/ЕЭЗ и Швейцарии платят 100 евро.',
          '**Стипендии вузов.** Платные студенты нередко могут на них претендовать: условия смотрите у вуза.',
        ],
      },
      { t: 'h2', id: 'compare', text: 'Коротко: что бесплатно' },
      {
        t: 'ul',
        items: [
          '**Германия:** бакалавриат и большинство магистратур в государственных вузах (кроме Баден-Вюртемберга для студентов вне ЕС, Баварии, частных вузов).',
          '**Чехия:** программы на чешском в государственных вузах.',
          '**Финляндия:** программы на финском и шведском, докторантура.',
        ],
      },
      { t: 'h2', id: 'check', text: 'Как проверить бесплатные программы на YourHEI' },
      { t: 'p', text: 'В [каталоге](/catalog) можно выбрать страну и поставить галочку «Только бесплатное обучение», а затем добавить язык обучения. Дальше откройте страницу заведения: там указаны цена программы, срок подачи и ссылка на официальную страницу. Сроки подачи по Германии, Чехии и Финляндии собраны в [календаре](/deadlines).' },
      { t: 'p', text: 'Правила платы меняются и у вузов бывают свои условия, поэтому перед подачей заявки подтвердите их на официальной странице программы.' },
      {
        t: 'p',
        text: 'Источники: [DAAD, расходы на учёбу и жизнь в Германии](https://www.daad.de/en/studying-in-germany/living-in-germany/finances/); [Study in Czechia, чешский язык и бесплатное обучение](https://studyin.gov.cz/plan-your-studies/learn-czech-study-tuition-free/); [Study in Czechia, стипендии и финансы](https://studyin.gov.cz/plan-your-studies/scholarships-and-finances); [Study in Finland, плата за обучение и стоимость жизни](https://www.studyinfinland.fi/funding-your-studies/fees-and-cost-living).',
      },
      { t: 'cta', href: '/catalog', text: 'Найти бесплатные программы' },
      { t: 'cta', href: '/deadlines', text: 'Сроки подачи' },
    ],
  },
  en: {
    title: 'Is study free in Germany, Czechia and Finland?',
    description: 'What is really free in Germany, Czechia and Finland and what you still pay for: the tuition fee rules from the official pages, with the exceptions.',
    blocks: [
      { t: 'p', text: '“Free tuition” is the most popular search of applicants and the most misleading one. **Tuition** can be free, but not the life around it: housing, insurance, fees and proof of funds for the visa stay with you. And every rule has exceptions. Below are three countries whose official pages say what is free and where. We checked these pages on 24 October 2026.' },
      { t: 'h2', id: 'germany', text: 'Germany: free at most state universities, with exceptions' },
      {
        t: 'ul',
        items: [
          '**The general rule.** According to DAAD, there are generally no fees for bachelor’s courses or most master’s courses at state higher education institutions.',
          '**Baden-Württemberg.** Non-EU citizens pay EUR 1,500 per semester for bachelor’s, master’s, Diplom and state examination programmes. Doctoral students are exempt.',
          '**Bavaria.** Fees for students from outside the EU/EEA “may also apply” and can reach several thousand euros per semester; each institution decides whether it charges them and how much.',
          '**Private universities.** They may charge substantially more.',
          '**Some continuing education master’s programmes** may charge tuition fees.',
          '**The semester contribution.** It is not tuition: it pays for student services and the student government. It varies between institutions, from EUR 70 to EUR 430, and is paid at enrolment and before each semester.',
        ],
      },
      { t: 'p', text: 'For the visa you must prove that you can pay for your living: in Germany this is a blocked account, EUR 992 a month ([more about the amounts](/blog/proof-of-funds-student-visa)).' },
      { t: 'h2', id: 'czechia', text: 'Czechia: free in Czech, usually paid in English' },
      {
        t: 'ul',
        items: [
          '**Programmes taught in Czech** at public universities are tuition-free regardless of nationality. You still pay for the rest: an admission fee, housing and living; extra fees may apply if you go over the standard length of study.',
          '**You need Czech.** Most programmes taught in Czech require at least B2 level.',
          '**Programmes taught in English.** According to the Study in Czechia portal, most cost 0–6,000 EUR a year, while medicine, arts and some specialised fields cost 8,000–25,000 EUR a year. The exact amount depends on the university and the programme.',
          '**Private universities** set their own fees.',
        ],
      },
      { t: 'h2', id: 'finland', text: 'Finland: free in Finnish and Swedish and at doctoral level' },
      {
        t: 'ul',
        items: [
          '**English-taught bachelor’s and master’s.** Students from outside the EU, the EEA and Switzerland usually pay; according to Study in Finland the typical range is EUR 9,000 to EUR 20,000 a year. Some students may be exempt based on their residence status or other grounds.',
          '**Programmes taught in Finnish or Swedish** do not charge tuition fees.',
          '**Doctoral programmes** are tuition-free regardless of nationality; you pay for your living yourself.',
          '**The application fee.** Applicants from outside the EU/EEA and Switzerland pay EUR 100.',
          '**University scholarships.** Fee-paying students are often eligible to apply: check the conditions with the university.',
        ],
      },
      { t: 'h2', id: 'compare', text: 'In short: what is free' },
      {
        t: 'ul',
        items: [
          '**Germany:** bachelor’s and most master’s at state universities (except Baden-Württemberg for non-EU students, Bavaria, private universities).',
          '**Czechia:** programmes taught in Czech at public universities.',
          '**Finland:** programmes taught in Finnish and Swedish, and doctoral studies.',
        ],
      },
      { t: 'h2', id: 'check', text: 'How to find free programmes on YourHEI' },
      { t: 'p', text: 'In the [catalogue](/catalog) choose a country and tick “Only free tuition”, then add the language of instruction. Then open the page of the institution: it shows the price of the programme, the deadline and the link to the official page. The deadlines for Germany, Czechia and Finland are collected in the [calendar](/deadlines).' },
      { t: 'p', text: 'Fee rules change and universities have conditions of their own, so confirm them on the official page of the programme before you apply.' },
      {
        t: 'p',
        text: 'Sources: [DAAD, costs of education and living in Germany](https://www.daad.de/en/studying-in-germany/living-in-germany/finances/); [Study in Czechia, learn Czech and study tuition-free](https://studyin.gov.cz/plan-your-studies/learn-czech-study-tuition-free/); [Study in Czechia, scholarships and finances](https://studyin.gov.cz/plan-your-studies/scholarships-and-finances); [Study in Finland, fees and cost of living](https://www.studyinfinland.fi/funding-your-studies/fees-and-cost-living).',
      },
      { t: 'cta', href: '/catalog', text: 'Find free programmes' },
      { t: 'cta', href: '/deadlines', text: 'Application deadlines' },
    ],
  },
};
