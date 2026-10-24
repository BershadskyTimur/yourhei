import type { Article } from '@/lib/blog/types';

export const scholarshipsByCitizenship: Article = {
  slug: 'scholarships-by-citizenship-caucasus-central-asia',
  published: '2026-10-24',
  updated: '2026-10-24',
  ru: {
    title: 'Стипендии по гражданству: Кавказ, Украина, Центральная Азия',
    description: 'Какие стипендии открыты гражданам Грузии, Армении, Азербайджана, Украины, Казахстана и Узбекистана: списки стран сверены с официальными страницами программ.',
    blocks: [
      { t: 'p', text: 'Многие стипендии открыты не всем: организатор перечисляет страны, граждане которых могут подавать заявку. Мы сверили такие списки с официальными страницами и ниже показываем, что подтверждено для граждан шести стран.' },
      { t: 'h2', id: 'kinds', text: 'Три вида программ' },
      {
        t: 'ul',
        items: [
          '**Только для граждан одной страны.** Например, Bolashak — для граждан Казахстана, фонд «Эл-Юрт умиди» — для граждан Узбекистана. Обе рассчитаны на учёбу за рубежом.',
          '**Со списком стран.** Например, Visegrad Scholarship Programme и государственные стипендии Чехии: список указан на официальной странице, и мы показываем, входит ли в него ваша страна.',
          '**Список стран здесь не хранится.** Chevening, Swedish Institute, Australia Awards и другие: организатор называет страны на своей странице, и проверить гражданство нужно там.',
        ],
      },
      { t: 'h2', id: 'by-country', text: 'Подтверждено для граждан' },
      { t: 'scholarshipsFor', countries: ['GE', 'AM', 'AZ', 'UA', 'KZ', 'UZ'] },
      { t: 'p', text: 'Это программы, у которых на официальной странице есть список стран с вашей. Программы без такого списка (см. выше) могут тоже подойти: проверьте их на странице организатора или в [списке стипендий](/scholarships) с фильтром по гражданству.' },
      { t: 'h2', id: 'conditions', text: 'Условия, которые легко пропустить' },
      {
        t: 'ul',
        items: [
          '**Visegrad:** нельзя учиться в стране своего гражданства.',
          '**Государственные стипендии Чехии:** список стран меняется с каждым конкурсом; у нас указан список конкурса на 2027/28 учебный год, а актуальный нужно смотреть на официальной странице.',
          '**Bolashak:** стипендия присуждается один раз на каждый уровень обучения; для самостоятельных магистрантов нужно приглашение вуза из списка рекомендованных.',
          '**«Эл-Юрт умиди»:** только для граждан Узбекистана, обучающихся за рубежом.',
        ],
      },
      { t: 'p', text: 'Мы перечисляем программы и отправляем вас на официальную страницу; мы не гарантируем, что вы получите стипендию.' },
      { t: 'cta', href: '/scholarships', text: 'Проверить стипендии по своему гражданству' },
    ],
  },
  en: {
    title: 'Scholarships by citizenship: the Caucasus, Ukraine, Central Asia',
    description: 'Which scholarships are open to citizens of Georgia, Armenia, Azerbaijan, Ukraine, Kazakhstan and Uzbekistan: the country lists checked against the official pages.',
    blocks: [
      { t: 'p', text: 'Many scholarships are not open to everyone: the organiser lists the countries whose citizens may apply. We checked such lists against the official pages, and below we show what is confirmed for citizens of six countries.' },
      { t: 'h2', id: 'kinds', text: 'Three kinds of programmes' },
      {
        t: 'ul',
        items: [
          '**For citizens of one country only.** For example, Bolashak is for citizens of Kazakhstan and the El-Yurt Umidi Foundation is for citizens of Uzbekistan. Both are meant for study abroad.',
          '**With a list of countries.** For example, the Visegrad Scholarship Programme and the Czech government scholarships: the list is on the official page, and we show whether your country is on it.',
          '**The list of countries is not kept here.** Chevening, the Swedish Institute, Australia Awards and others: the organiser names the countries on its own page, and you must check your citizenship there.',
        ],
      },
      { t: 'h2', id: 'by-country', text: 'Confirmed for citizens of' },
      { t: 'scholarshipsFor', countries: ['GE', 'AM', 'AZ', 'UA', 'KZ', 'UZ'] },
      { t: 'p', text: 'These are the programmes whose official page has a list of countries that includes yours. Programmes without such a list (see above) may fit too: check them on the organiser’s page or in the [scholarship list](/scholarships) with the citizenship filter.' },
      { t: 'h2', id: 'conditions', text: 'Conditions that are easy to miss' },
      {
        t: 'ul',
        items: [
          '**Visegrad:** you cannot study in your own country of citizenship.',
          '**Czech government scholarships:** the list of countries changes with every call; the list here is the call for 2027/2028, and the current one is on the official page.',
          '**Bolashak:** it is awarded once for each level of study; independent master’s applicants need an offer from a university on the list of recommended universities.',
          '**El-Yurt Umidi:** only for citizens of Uzbekistan who study abroad.',
        ],
      },
      { t: 'p', text: 'We list the programmes and send you to the official page; we do not guarantee that you will receive a scholarship.' },
      { t: 'cta', href: '/scholarships', text: 'Check scholarships for your citizenship' },
    ],
  },
};
