import type { Translations } from '@/lib/blog/types';

// Machine translation of the article on tuition by country (pl).
export const plMore4: Translations = {
  'how-much-does-it-cost-to-study-abroad-tuition-by-country': {
    title: 'Ile kosztują studia za granicą: czesne w 5 krajach',
    description: 'Ile płacą studenci zagraniczni w USA, Australii, Holandii, Finlandii i Szwecji: typowe czesne na studiach licencjackich i magisterskich według danych oficjalnych.',
    blocks: [
      { t: 'p', text: 'Najczęstsze pytanie kandydata brzmi: „ile to kosztuje?”. Odpowiedź zależy od kraju, uczelni i programu, ale rząd wielkości jest jasny. Poniżej typowe **czesne** dla studentów zagranicznych w pięciu krajach, obliczone na podstawie opublikowanych cen w bazie YourHEI (dane z października 2026 r.). Koszty utrzymania nie są wliczone: o nich na końcu artykułu.' },
      { t: 'h2', id: 'how', text: 'Jak liczyliśmy' },
      {
        t: 'ul',
        items: [
          '**Mediana** to cena środkowa: połowa programów jest tańsza, a połowa droższa. Jest uczciwsza niż średnia, bo kilka bardzo drogich programów jej nie zniekształca.',
          '**Przedział** pokazuje, gdzie leży 80 % cen: pomijamy najtańsze 10 % i najdroższe 10 %.',
          '**Cena za rok.** Gdy źródło podaje cenę całych studiów, dzielimy ją przez długość w latach.',
          '**Tylko programy ze znaną ceną**, która dotyczy studentów zagranicznych. Dla pozostałych nie mamy ceny i jej nie wymyślamy.',
        ],
      },
      { t: 'h2', id: 'usa', text: 'USA' },
      {
        t: 'ul',
        items: [
          '**Typowa uczelnia:** około 17 500 $ rocznie (mediana z 3 083 uczelni z opublikowaną ceną, w tym community colleges).',
          '**Przedział:** od 6 600 $ do 47 500 $ rocznie.',
          '**Jak to czytać.** Dla uczelni stanowych baza zawiera cenę dla studentów z innych stanów, którą zwykle płacą też studenci zagraniczni. Uczelnie prywatne mają jedną cenę dla wszystkich. To tylko czesne, bez zakwaterowania, książek i ubezpieczenia.',
          'Studia licencjackie częściej prowadzą drogie uczelnie: licząc po programach, a nie po uczelniach, mediana jest wyższa, około 31 000 $.',
        ],
      },
      { t: 'p', text: 'Uczelnie i programy w USA: [Studia w USA](/study/us).' },
      { t: 'h2', id: 'australia', text: 'Australia' },
      {
        t: 'ul',
        items: [
          '**Studia licencjackie:** około 40 400 dolarów australijskich rocznie (przedział 24 200–57 100), 3 300 programów.',
          '**Studia magisterskie:** około 24 000 dolarów australijskich rocznie (przedział 12 000–38 800), 1 570 programów.',
          'Źródłem jest oficjalny rejestr CRICOS, który podaje całkowity koszt kursu; dzielimy go przez długość.',
        ],
      },
      { t: 'p', text: 'Programy w Australii: [Studia w Australii](/study/au).' },
      { t: 'h2', id: 'netherlands', text: 'Holandia' },
      {
        t: 'ul',
        items: [
          '**Studia licencjackie:** około 16 900 euro rocznie (przedział 11 800–24 500), 109 programów.',
          '**Studia magisterskie:** około 22 900 euro rocznie (przedział 19 600–26 000), 385 programów.',
          'Cena dla studentów spoza EOG jest podana dla około jednej trzeciej programów (494 z 1 474): dla pozostałych źródło nie podaje ceny dla takich studentów. W takim wypadku zapytaj uczelnię.',
        ],
      },
      { t: 'p', text: 'Programy w Holandii: [Studia w Holandii](/study/nl); jak i kiedy aplikować: [Holandia: Studielink i terminy](/blog/netherlands-application-deadlines-studielink); stypendium: [NL Scholarship](/blog/nl-scholarship-netherlands-how-to-apply).' },
      { t: 'h2', id: 'finland', text: 'Finlandia' },
      {
        t: 'ul',
        items: [
          '**Studia licencjackie:** około 10 000 euro rocznie (przedział 9 500–12 000), 262 programy.',
          '**Studia magisterskie:** około 12 000 euro rocznie (przedział 10 000–18 000), 589 programów.',
          'Studia po fińsku lub szwedzku oraz doktoranckie są bezpłatne ([więcej](/blog/free-tuition-germany-czechia-finland)).',
        ],
      },
      { t: 'p', text: 'Programy w Finlandii: [Studia w Finlandii](/study/fi).' },
      { t: 'h2', id: 'sweden', text: 'Szwecja' },
      {
        t: 'ul',
        items: [
          '**Studia licencjackie:** około 150 000 koron szwedzkich rocznie (przedział 97 000–290 000), 101 programów.',
          '**Studia magisterskie:** około 147 000 koron szwedzkich rocznie (przedział 97 000–192 500), 894 programy.',
          'Źródłem jest oficjalny szwedzki portal rekrutacyjny universityadmissions.se, który podaje całkowity koszt programu; dzielimy go przez długość. Studenci z UE, EOG i Szwajcarii nie płacą: dla nich studia są bezpłatne.',
        ],
      },
      { t: 'h2', id: 'germany', text: 'A Niemcy i Czechy?' },
      { t: 'p', text: 'Na państwowych uczelniach w Niemczech studia są w większości przypadków bezpłatne, a w Czechach bezpłatne są programy po czesku. Te zasady i wyjątki omówiono osobno: [Czy studia w Niemczech, Czechach i Finlandii są bezpłatne?](/blog/free-tuition-germany-czechia-finland).' },
      { t: 'h2', id: 'living', text: 'Czesne to nie cały koszt' },
      {
        t: 'ul',
        items: [
          'Do wizy studenckiej trzeba udowodnić, że stać cię na utrzymanie: kwoty dla 14 krajów są w artykule [Ile pieniędzy wykazać do wizy studenckiej](/blog/proof-of-funds-student-visa).',
          'Rzeczywiste koszty są zwykle wyższe niż minimum wizowe, zwłaszcza w dużych miastach.',
          'Płatne czesne można obniżyć stypendium: [pełne stypendia dla studentów zagranicznych](/blog/fully-funded-scholarships-for-international-students) i [baza stypendiów krajowych](/scholarships).',
        ],
      },
      { t: 'note', text: 'Ceny zmieniają się co roku, a uczelnie mają własne warunki i zniżki. Przed złożeniem dokumentów sprawdź cenę na oficjalnej stronie programu: każda strona uczelni w YourHEI zawiera link.' },
      { t: 'p', text: 'W [katalogu](/catalog) możesz wyświetlić ceny w swojej walucie i filtrować programy według kraju, poziomu i budżetu.' },
      {
        t: 'p',
        text: 'Źródła danych: [US College Scorecard](https://collegescorecard.ed.gov/data/); [CRICOS, rejestr kursów dla studentów zagranicznych w Australii](https://cricos.education.gov.au/); [Study in NL](https://www.studyinnl.org/); [Studyinfo, Finlandia](https://opintopolku.fi/konfo/en/); [universityadmissions.se, Szwecja](https://www.universityadmissions.se/).',
      },
      { t: 'cta', href: '/catalog', text: 'Znajdź program według budżetu' },
      { t: 'cta', href: '/scholarships', text: 'Stypendia' },
    ],
  },
};
