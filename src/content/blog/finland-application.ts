import type { Article } from '@/lib/blog/types';

export const finlandApplication: Article = {
  slug: 'finland-how-to-apply-studyinfo',
  published: '2026-11-30',
  updated: '2026-11-30',
  ru: {
    title: 'Как подать заявку в Финляндию: Studyinfo и совместный набор',
    description: 'Как поступить в финский вуз через Studyinfo: совместный набор в январе, набор на январский старт, требования для бакалавриата и магистратуры и сбор для студентов вне ЕС.',
    blocks: [
      { t: 'p', text: 'В Финляндии заявки подают через единый официальный портал Studyinfo.fi. Ниже — что сказано на официальных страницах Study in Finland о периодах набора и требованиях (проверено 24 октября 2026 года). Точные даты и условия программы всегда проверяйте на Studyinfo и на сайте вуза.' },
      { t: 'h2', id: 'portal', text: 'Где подавать' },
      { t: 'p', text: '**Studyinfo.fi** — официальный портал заявок. Новости и результаты тоже приходят через него.' },
      { t: 'h2', id: 'periods', text: 'Когда подавать' },
      {
        t: 'ul',
        items: [
          '**Основной совместный набор — в январе,** для обучения, которое начинается следующей осенью.',
          '**Осенний совместный набор** — для обучения, которое начинается в январе. На английском такое бывает для ограниченного числа программ.',
          '**Отдельные наборы.** Некоторые программы проводят собственные периоды, в основном с декабря по январь. Возможен и непрерывный приём: точные даты на странице программы.',
        ],
      },
      { t: 'p', text: 'Конкретных дат для программ на английском на странице нет: она советует всегда проверять срок подачи и требования на Studyinfo и на сайте вуза. Сроки программ, загруженные в наши данные, собраны в [календаре для Финляндии](/deadlines/fi).' },
      { t: 'h2', id: 'requirements', text: 'Что требуют' },
      {
        t: 'ul',
        items: [
          '**Бакалавриат:** аттестат о среднем образовании, дающий право на поступление в высшее учебное заведение в вашей стране.',
          '**Магистратура:** степень бакалавра. Для магистерских программ в университетах прикладных наук (UAS) дополнительно нужны два года соответствующего опыта работы.',
          '**Дополнительно** некоторые программы требуют вступительные экзамены, тесты SAT или GMAT или собеседование.',
          '**Английский язык.** Требования отличаются; среди широко принимаемых тестов страница называет IELTS, TOEFL, PTE и Cambridge.',
        ],
      },
      { t: 'h2', id: 'fee', text: 'Сборы' },
      { t: 'p', text: 'Заявители из-за пределов ЕС/ЕЭЗ и Швейцарии платят вступительный сбор 100 евро (по данным Study in Finland). Плата за обучение в программах на английском для них обычно тоже есть, а на финском и шведском её нет: подробности в статье [Бесплатно ли учиться в Германии, Чехии и Финляндии](/blog/free-tuition-germany-czechia-finland).' },
      { t: 'h2', id: 'plan', text: 'Как спланировать' },
      {
        t: 'ol',
        items: [
          'Найдите программы в [каталоге](/catalog) и откройте страницу каждой: на ней есть срок и ссылка на официальную страницу программы.',
          'Подготовьте документы заранее: диплом или аттестат, оценки, результаты английского теста. Отмечайте готовое в [чек-листе](/checklist).',
          'Не откладывайте на последние дни: основной совместный набор проходит раз в год.',
          'Для визы потребуется подтверждение средств: суммы собраны в статье [Сколько денег нужно показать для студенческой визы](/blog/proof-of-funds-student-visa).',
        ],
      },
      {
        t: 'p',
        text: 'Источники: [Study in Finland, приём в бакалавриат и магистратуру](https://www.studyinfinland.fi/admissions/bachelors-and-masters-admissions); [Study in Finland, плата и стоимость жизни](https://www.studyinfinland.fi/funding-your-studies/fees-and-cost-living).',
      },
      { t: 'cta', href: '/deadlines/fi', text: 'Сроки подачи в Финляндии' },
      { t: 'cta', href: '/catalog', text: 'Найти программы' },
    ],
  },
  en: {
    title: 'How to apply to Finland: Studyinfo and the joint application',
    description: 'How to apply to a Finnish university through Studyinfo: the joint application in January, the autumn round, the requirements and the fee for non-EU students.',
    blocks: [
      { t: 'p', text: 'In Finland applications go through one official portal, Studyinfo.fi. Below is what the official Study in Finland pages say about the application periods and the requirements (checked on 24 October 2026). Always confirm the exact dates and conditions of a programme on Studyinfo and on the university’s website.' },
      { t: 'h2', id: 'portal', text: 'Where to apply' },
      { t: 'p', text: '**Studyinfo.fi** is the official application portal. Updates and results also come through it.' },
      { t: 'h2', id: 'periods', text: 'When to apply' },
      {
        t: 'ul',
        items: [
          '**The main joint application is in January,** for studies starting the following autumn.',
          '**The autumn joint application** is for studies starting in January. In English this exists for a limited number of programmes.',
          '**Separate applications.** Some programmes run their own periods, mainly between December and January. Rolling admission is also possible: the exact dates are on the programme page.',
        ],
      },
      { t: 'p', text: 'The page gives no specific dates for English-taught programmes: it advises always checking the application dates and the admission requirements on Studyinfo and on the university’s website. The deadlines of programmes in our data are collected in the [calendar for Finland](/deadlines/fi).' },
      { t: 'h2', id: 'requirements', text: 'What is required' },
      {
        t: 'ul',
        items: [
          '**Bachelor’s:** a high-school diploma that qualifies you for higher education in your home country.',
          '**Master’s:** a bachelor’s degree. Master’s programmes at universities of applied sciences (UAS) also require two years of relevant work experience.',
          '**In addition,** some programmes require entrance exams, SAT or GMAT tests, or an interview.',
          '**English.** The requirements vary; the page lists IELTS, TOEFL, PTE and Cambridge as commonly accepted tests.',
        ],
      },
      { t: 'h2', id: 'fee', text: 'Fees' },
      { t: 'p', text: 'Applicants from outside the EU/EEA and Switzerland pay an application fee of EUR 100 (according to Study in Finland). For them tuition in English-taught programmes is usually charged too, while programmes in Finnish and Swedish are free: see [Is study free in Germany, Czechia and Finland?](/blog/free-tuition-germany-czechia-finland).' },
      { t: 'h2', id: 'plan', text: 'How to plan' },
      {
        t: 'ol',
        items: [
          'Find programmes in the [catalogue](/catalog) and open each page: it has the deadline and the link to the official programme page.',
          'Prepare documents in advance: diploma or certificate, grades, the English test result. Tick off what is ready in the [checklist](/checklist).',
          'Do not leave it to the last days: the main joint application is held once a year.',
          'For the visa you will need proof of funds: the amounts are in [How much money you must show for a student visa](/blog/proof-of-funds-student-visa).',
        ],
      },
      {
        t: 'p',
        text: 'Sources: [Study in Finland, bachelor’s and master’s admissions](https://www.studyinfinland.fi/admissions/bachelors-and-masters-admissions); [Study in Finland, fees and cost of living](https://www.studyinfinland.fi/funding-your-studies/fees-and-cost-living).',
      },
      { t: 'cta', href: '/deadlines/fi', text: 'Application deadlines in Finland' },
      { t: 'cta', href: '/catalog', text: 'Find programmes' },
    ],
  },
};
