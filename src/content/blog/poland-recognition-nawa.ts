import type { Article } from '@/lib/blog/types';

export const polandRecognitionNawa: Article = {
  slug: 'poland-recognition-of-certificate-and-diploma-nawa',
  published: '2026-11-10',
  updated: '2026-11-10',
  ru: {
    title: 'Поступление в Польшу: признание аттестата и диплома через NAWA',
    description: 'Нужно ли признавать аттестат или диплом для учёбы в Польше, какие документы грузить в системе SYRENA, сколько стоит заключение NAWA и чего оно не гарантирует.',
    blocks: [
      { t: 'p', text: 'Заявку на программу в Польше подают напрямую в выбранный университет: правила приёма, документы, сроки и взносы у каждого свои. Но у многих иностранцев есть общий шаг до или во время подачи: признание зарубежного аттестата или диплома. Его делает польское Национальное агентство академических обменов (NAWA) онлайн, бесплатно. Ниже то, что сказано на официальных страницах NAWA и Study in Poland (проверено 26 октября 2026 года).' },
      { t: 'h2', id: 'who-decides', text: 'Кто принимает решение о приёме' },
      {
        t: 'ul',
        items: [
          'По словам Study in Poland, решение о приёме принимает конкретный университет, а заявку подают прямо в выбранное высшее учебное заведение.',
          'Каждый университет сам задаёт требования, документы, сроки, взносы и возможные вступительные экзамены или собеседования. Читайте их на сайте университета.',
          'На Study in Poland можно искать программы на английском (их больше 400) по направлениям и уровню.',
        ],
      },
      { t: 'h2', id: 'what-is', text: 'Что такое заключение NAWA' },
      {
        t: 'ul',
        items: [
          '**Для аттестата.** Индивидуальное заключение директора NAWA подтверждает, что ваш аттестат даёт право подавать заявку на бакалавриат или программу единого цикла.',
          '**Для диплома.** Заключение подтверждает окончание высшего образования и присуждение степени. Это нужно, например, для продолжения учёбы в польском университете или для работодателя.',
          '**Что оно не делает.** Заключение подтверждает только право продолжить учёбу в Польше. Оно не подтверждает, что вас примут на конкретную программу: NAWA не оценивает ваши результаты, это делает университет по своим правилам.',
          '**Бесплатно.** Заключение выдаётся бесплатно, подаёт ли его владелец документа или учреждение.',
          '**Формат.** Это PDF с электронной подписью. Сроки не фиксированы: заключения выдают «как можно быстрее» в порядке поступления полных комплектов документов.',
        ],
      },
      { t: 'h2', id: 'when-needed', text: 'Когда заключение не нужно' },
      {
        t: 'ul',
        items: [
          'Аттестаты стран ЕС, ОЭСР и ЕАСТ, стран из международных соглашений о признании образования (на странице NAWA в пример приведены соглашения с Китаем и Украиной), а также аттестаты IB и EB признаются автоматически для поступления на бакалавриат и единый цикл.',
          'Если ваш аттестат уже признал региональный орган образования (Kurator Oświaty), заключение NAWA не нужно, и такие решения остаются в силе.',
          'Для всех остальных аттестатов заключение NAWA нужно. Списки на сайте NAWA не исчерпывающие: каждое заявление в SYRENA рассматривают отдельно.',
        ],
      },
      { t: 'h2', id: 'steps', text: 'Как получить заключение' },
      {
        t: 'ol',
        items: [
          '**Прочитайте инструкцию** SYRENA (User Manual) на странице NAWA до подачи заявления.',
          '**Подготовьте сканы** в формате PDF или JPG, каждый файл не больше 3 МБ. Заверенные копии не нужны: прикладывайте качественные цветные сканы оригиналов.',
          '**Заполните форму** в системе SYRENA и загрузите сканы документов.',
          '**Активируйте заявку:** нажмите на персональную ссылку, которую система пришлёт на указанную в форме почту. Без этого заявка не будет подана.',
          '**Следите за статусом** в SYRENA в любое время.',
          '**Скачайте заключение** после уведомления, которое система пришлёт сама.',
        ],
      },
      { t: 'note', text: 'Адрес электронной почты в SYRENA вводите в точности так же, как в форме, с теми же заглавными и строчными буквами: иначе система не найдёт заявку. Если пришло письмо, что заявка неполная, не подавайте новую, а дополните прежнюю.' },
      { t: 'h2', id: 'documents', text: 'Какие документы нужны' },
      { t: 'p', text: '**Для аттестата:**' },
      {
        t: 'ul',
        items: [
          'аттестат о среднем образовании, дающий доступ к высшему;',
          'приложение к аттестату с предметами и оценками, если оно есть;',
          'предыдущий документ об образовании, который был основанием для приёма в среднюю школу;',
          'заверенные переводы всех этих документов, кроме документов на английском, русском, украинском и белорусском;',
          'документ о смене фамилии, если она менялась;',
          'для несовершеннолетних: заявление, подписанное родителем или законным представителем;',
          'для беженцев: документ о статусе беженца.',
        ],
      },
      { t: 'p', text: '**Для диплома:**' },
      {
        t: 'ul',
        items: [
          'диплом, для которого вам нужно заключение;',
          'приложение к диплому с предметами и оценками;',
          'предыдущий документ об образовании, который был основанием для поступления, и приложение к нему, если есть;',
          'переводы всех документов, кроме документов на английском, русском, украинском и белорусском; переводы должен делать присяжный переводчик;',
          'удостоверение личности или паспорт;',
          'документ о смене фамилии, если она менялась, и документ о статусе беженца для беженцев.',
        ],
      },
      {
        t: 'ul',
        items: [
          '**Апостиль и легализация не нужны.** Документы, загруженные в SYRENA, не обязательно заверять апостилем или легализовать.',
          '**Переводы.** Если вуз выдал вместе с документами на языке оригинала и документы на английском, прикладывайте их как переводы и не добавляйте польские. Если трудно найти присяжного переводчика с вашего языка на польский, NAWA разрешает приложить переводы на английский.',
          '**Кто может подать.** Заявку подаёт сам владелец документа или учреждение, которому заключение будет предъявлено (университет, ведомство по видам на жительство, работодатель). Если заявку подаёт третье лицо или посредник, нужна нотариально заверенная доверенность, иначе заявку отклонят.',
        ],
      },
      { t: 'h2', id: 'plan', text: 'Как планировать' },
      {
        t: 'ol',
        items: [
          'Выберите программы в [каталоге](/catalog) и откройте на сайте каждого университета раздел о приёме: там сказано, нужно ли заключение NAWA и когда его предъявлять.',
          'Если ваш аттестат или диплом не признаётся автоматически, подайте заявление в SYRENA заранее: сроки выдачи не гарантированы.',
          'Подготовьте остальные документы по [чек-листу](/checklist): паспорт, переводы, языковой сертификат.',
          'Заранее посмотрите, сколько денег нужно показать на визу: суммы по странам в статье [Сколько денег нужно показать на студенческую визу](/blog/proof-of-funds-student-visa).',
          'Разрешено ли работать во время учёбы и после диплома, смотрите в статьях [о работе во время учёбы](/blog/work-during-studies-rules-by-country) и [о праве остаться после выпуска](/blog/after-graduation-work-permits-by-country).',
        ],
      },
      { t: 'p', text: 'Источники: [Study in Poland, как подать заявку](https://studyinpoland.pl/en/how-to-apply/); [NAWA, заключение по аттестату](https://nawa.gov.pl/en/recognition/how-to-obtain-a-recognition-statement/secondary-school-certificate); [NAWA, заключение по диплому](https://nawa.gov.pl/en/recognition/how-to-obtain-a-recognition-statement/diploma-of-higher-education); [NAWA, частые вопросы](https://www.nawa.gov.pl/en/recognition/recognition-for-academic-purposes/faq-frequently-asked-questions).' },
      { t: 'cta', href: '/catalog', text: 'Найти программу в Польше' },
      { t: 'cta', href: '/checklist', text: 'Чек-лист документов' },
    ],
  },
  en: {
    title: 'Applying to Poland: NAWA recognition of your certificate and diploma',
    description: 'Whether your certificate or diploma must be recognised for study in Poland, which documents to upload in SYRENA, what the NAWA statement costs and what it does not cover.',
    blocks: [
      { t: 'p', text: 'You apply for a programme in Poland directly to the university of your choice: each one sets its own admission rules, documents, deadlines and fees. But many international applicants have one common step before or during the application: the recognition of a foreign certificate or diploma. It is done online and free of charge by the Polish National Agency for Academic Exchange (NAWA). Below is what the official NAWA and Study in Poland pages say (checked on 26 October 2026).' },
      { t: 'h2', id: 'who-decides', text: 'Who decides on admission' },
      {
        t: 'ul',
        items: [
          'According to Study in Poland, admission is decided by the specific university, and you apply directly to the higher education institution of your choice.',
          'Each university sets its own requirements, documents, deadlines, fees and any entrance exams or interviews. Read them on the university website.',
          'On Study in Poland you can search for programmes taught in English (more than 400) by field and degree type.',
        ],
      },
      { t: 'h2', id: 'what-is', text: 'What the NAWA statement is' },
      {
        t: 'ul',
        items: [
          '**For a certificate.** The individual statement of the Director of NAWA confirms that your certificate gives you the right to apply for first-cycle studies or long-cycle studies.',
          '**For a diploma.** The statement confirms the completion of higher education and the award of an academic degree. You need it, for example, to continue studying at a Polish university or to show an employer.',
          '**What it does not do.** The statement confirms only the right to continue studies in Poland. It does not confirm that you will be admitted to a particular programme: NAWA does not interpret your results, the university does that under its own rules.',
          '**Free of charge.** The statement is issued free of charge, whether it is submitted by the holder of the document or by an institution.',
          '**Format.** It is a digitally signed PDF. The time is not fixed: statements are issued as quickly as possible, in the order in which complete sets of documents are received.',
        ],
      },
      { t: 'h2', id: 'when-needed', text: 'When the statement is not needed' },
      {
        t: 'ul',
        items: [
          'Certificates issued in EU, OECD or EFTA member countries, in countries covered by international agreements on recognition of education (the NAWA page gives the agreements with China and Ukraine as examples), and IB and EB certificates are recognised automatically for applying to first-cycle and long-cycle studies.',
          'If your certificate has already been recognised by the Regional Educational Authority (Kurator Oświaty), you do not need a NAWA statement, and such decisions remain valid.',
          'For all other certificates the NAWA statement is required. The lists on the NAWA website are not exhaustive: each application in SYRENA is considered individually.',
        ],
      },
      { t: 'h2', id: 'steps', text: 'How to get the statement' },
      {
        t: 'ol',
        items: [
          '**Read the instructions** (the SYRENA User Manual) on the NAWA page before you apply.',
          '**Prepare scans** in PDF or JPG format, each file no larger than 3 MB. Certified copies are not needed: attach good quality colour scans of the originals.',
          '**Fill in the form** in the SYRENA system and upload the scans of the documents.',
          '**Activate the application:** click the personal link that the system sends to the e-mail address given in the form. Without this the application is not submitted.',
          '**Check the status** in SYRENA at any time.',
          '**Download the statement** after the notification the system sends by itself.',
        ],
      },
      { t: 'note', text: 'Enter your e-mail address in SYRENA exactly as it was written in the form, with the same capital and small letters: otherwise the system will not find the application. If you get an e-mail that the application is incomplete, do not submit a new one, complete the old one.' },
      { t: 'h2', id: 'documents', text: 'Which documents you need' },
      { t: 'p', text: '**For a certificate:**' },
      {
        t: 'ul',
        items: [
          'the secondary school certificate giving access to higher education;',
          'the transcript, supplement or list of subjects and grades attached to the certificate, if there is one;',
          'the previous document of education, which was the basis for admission to secondary school;',
          'certified translations of all these documents, unless they are issued in English, Russian, Ukrainian or Belarusian;',
          'a document stating the change of surname, if the surname changed;',
          'for minors: a declaration signed by a parent or legal guardian;',
          'for refugees: a refugee status document.',
        ],
      },
      { t: 'p', text: '**For a diploma:**' },
      {
        t: 'ul',
        items: [
          'the diploma for which you need the statement;',
          'the transcript, supplement or list of subjects and grades attached to it;',
          'the previous document of education, which was the basis for admission to the studies, and its transcript, if applicable;',
          'translations of all the documents, unless they are issued in English, Russian, Ukrainian or Belarusian; the translations should be done by a sworn translator;',
          'an identity card or passport;',
          'a document stating the change of surname, if applicable, and a refugee status document for refugees.',
        ],
      },
      {
        t: 'ul',
        items: [
          '**No apostille or legalisation is needed.** The documents attached in SYRENA do not have to be certified with an apostille or legalised.',
          '**Translations.** If the institution issued documents in English together with the ones in the original language, attach them as translations and do not provide Polish ones. If it is difficult to find a sworn translator from your language into Polish, NAWA allows you to attach English translations.',
          '**Who can apply.** The application is submitted by the holder of the document or by the institution where the statement will be presented (a university, a residence permit office, an employer). If a third person or an intermediary submits it, a notarised authorisation is required, otherwise the application is rejected.',
        ],
      },
      { t: 'h2', id: 'plan', text: 'How to plan' },
      {
        t: 'ol',
        items: [
          'Choose programmes in the [catalogue](/catalog) and open the admission section of each university website: it says whether the NAWA statement is needed and when to present it.',
          'If your certificate or diploma is not recognised automatically, apply in SYRENA in advance: the time of issue is not guaranteed.',
          'Prepare the other documents with the [checklist](/checklist): passport, translations, language certificate.',
          'Look in advance at how much money you need to show for the visa: the amounts by country are in the article [How much money to show for a student visa](/blog/proof-of-funds-student-visa).',
          'Whether you may work during studies and after graduation is in the articles [on work during studies](/blog/work-during-studies-rules-by-country) and [on the right to stay after graduation](/blog/after-graduation-work-permits-by-country).',
        ],
      },
      { t: 'p', text: 'Sources: [Study in Poland, how to apply](https://studyinpoland.pl/en/how-to-apply/); [NAWA, secondary school certificate](https://nawa.gov.pl/en/recognition/how-to-obtain-a-recognition-statement/secondary-school-certificate); [NAWA, diploma of higher education](https://nawa.gov.pl/en/recognition/how-to-obtain-a-recognition-statement/diploma-of-higher-education); [NAWA, frequently asked questions](https://www.nawa.gov.pl/en/recognition/recognition-for-academic-purposes/faq-frequently-asked-questions).' },
      { t: 'cta', href: '/catalog', text: 'Find a programme in Poland' },
      { t: 'cta', href: '/checklist', text: 'Document checklist' },
    ],
  },
};
