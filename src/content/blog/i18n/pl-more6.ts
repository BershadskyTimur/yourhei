import type { Translations } from '@/lib/blog/types';

// Machine translation of the articles on tuition in Australia and in the Netherlands (pl).
export const plMore6: Translations = {
  'australia-tuition-fees-international-students': {
    title: 'Ile kosztują studia w Australii dla studentów zagranicznych',
    description: 'Ile kosztuje rok nauki w Australii dla studenta zagranicznego: licencjat, magisterium, kształcenie zawodowe, kursy angielskiego i duże uczelnie, według rejestru CRICOS.',
    blocks: [
      { t: 'p', text: 'Rok studiów licencjackich na australijskim uniwersytecie kosztuje studenta zagranicznego około **43 000 AUD**. To typowa cena (mediana) 4562 kierunków na 63 uniwersytetach na 2026 rok. Kształcenie zawodowe w college’ach kosztuje trzy razy mniej, około 13 500 AUD rocznie. Poniżej ceny według poziomu i na dużych uniwersytetach oraz ile pieniędzy trzeba wykazać do wizy.' },
      { t: 'h2', id: 'levels', text: 'Ceny według poziomu' },
      {
        t: 'ul',
        items: [
          '**Licencjat na uniwersytecie:** około 43 000 AUD rocznie. 80% kierunków kosztuje od 30 800 do 58 300 AUD (4562 kierunki).',
          '**Magisterium na uniwersytecie:** około 35 300 AUD rocznie. 80% kierunków kosztuje od 22 100 do 54 900 AUD (705 kierunków na 35 uniwersytetach; duże uniwersytety mają w rejestrze mniej studiów magisterskich niż licencjackich).',
          '**Kształcenie zawodowe (VET) w college’ach i instytutach:** około 13 500 AUD rocznie, 80% od 8000 do 25 000 AUD (3768 kursów).',
          '**Kursy języka angielskiego:** około 17 100 AUD rocznie, 80% od 11 900 do 25 600 AUD (948 kursów).',
          '**Szkoła dla uczniów zagranicznych:** około 31 000 AUD rocznie (838 programów).',
        ],
      },
      { t: 'h2', id: 'universities', text: 'Ceny na dużych uniwersytetach (licencjat)' },
      { t: 'p', text: 'Typowa cena roku na studiach licencjackich uczelni, od najniższej:' },
      {
        t: 'ul',
        items: [
          '[Uniwersytet Deakin](/institutions/au/deakin-university): około 44 400 AUD',
          '[Uniwersytet Queensland](/institutions/au/university-of-queensland): około 47 200 AUD',
          '[Uniwersytet Macquarie](/institutions/au/macquarie-university): około 48 200 AUD',
          '[Uniwersytet RMIT](/institutions/au/rmit-university): około 49 000 AUD',
          '[Uniwersytet w Melbourne](/institutions/au/university-of-melbourne): około 49 100 AUD',
          '[Uniwersytet Technologiczny w Sydney](/institutions/au/university-of-technology-sydney): około 51 000 AUD',
          '[Uniwersytet Australii Zachodniej](/institutions/au/university-of-western-australia): około 51 100 AUD',
          '[Uniwersytet Nowej Południowej Walii](/institutions/au/university-of-new-south-wales): około 56 000 AUD',
          '[Australijski Uniwersytet Narodowy](/institutions/au/australian-national-university): około 56 100 AUD',
          '[Uniwersytet Monash](/institutions/au/monash-university): około 59 300 AUD',
          '[Uniwersytet w Sydney](/institutions/au/university-of-sydney): około 63 600 AUD',
        ],
      },
      { t: 'p', text: 'Ceny kierunków jednej uczelni bardzo się różnią. Cenę konkretnego kierunku znajdziesz na jego karcie na stronie uczelni.' },
      { t: 'cta', href: '/institutions/au', text: 'Wszystkie placówki w Australii' },
      { t: 'cta', href: '/study/au', text: 'Studia w Australii: kierunki' },
      { t: 'h2', id: 'how', text: 'Jak liczyliśmy' },
      {
        t: 'ul',
        items: [
          '**Źródłem** jest CRICOS, oficjalny rejestr rządu Australii: zawiera każdy kierunek, na który można przyjechać na wizie studenckiej, z ceną dla studentów zagranicznych. W naszej bazie jest 1540 placówek i około 19 000 kierunków z ceną na 2026 rok.',
          '**Cena za rok.** Rejestr podaje cenę całego kierunku; dzielimy ją przez długość w latach.',
          '**Mediana** to cena pośrodku: połowa kierunków kosztuje mniej, połowa więcej.',
          '**Tylko czesne.** Zakwaterowanie, jedzenie, ubezpieczenie zdrowotne dla studentów (OSHC) i wiza nie są wliczone.',
        ],
      },
      { t: 'h2', id: 'visa-money', text: 'Ile pieniędzy potrzeba na życie' },
      { t: 'p', text: 'Do wizy studenckiej (subclass 500) trzeba wykazać pieniądze na utrzymanie: **29 710 AUD rocznie** dla jednego studenta, według australijskiego Ministerstwa Spraw Wewnętrznych na 2026 rok. To kwota ponad czesne i podróż. Przed złożeniem wniosku sprawdź dokumenty i kwotę na stronie ministerstwa.' },
      { t: 'note', text: 'Kwoty dla innych krajów: [ile pieniędzy trzeba wykazać do wizy studenckiej](/blog/proof-of-funds-student-visa).' },
      { t: 'h2', id: 'cheaper', text: 'Jeśli to za drogo' },
      { t: 'p', text: 'Porównaj z innymi krajami: [ile kosztują studia za granicą](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country), [kraje, w których studia są bezpłatne lub prawie bezpłatne](/blog/free-tuition-germany-czechia-finland). Stypendia, które pokrywają wszystko: [pełne stypendia dla studentów zagranicznych](/blog/fully-funded-scholarships-for-international-students).' },
      { t: 'h2', id: 'sources', text: 'Źródła' },
      { t: 'p', text: 'Ceny: [CRICOS](https://cricos.education.gov.au/), Ministerstwo Edukacji rządu Australii, otwarte dane na data.gov.au, pobrane w październiku 2026 r. Pieniądze na życie: [Student visa (subclass 500)](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500), Ministerstwo Spraw Wewnętrznych, sprawdzono 8 października 2026 r. Przed złożeniem aplikacji sprawdź cenę na stronie kierunku.' },
    ],
  },
  'netherlands-tuition-fees-international-students': {
    title: 'Ile kosztują studia w Holandii dla studentów zagranicznych',
    description: 'Ile kosztuje rok nauki w Holandii: opłata ustawowa dla obywateli UE, ceny dla pozostałych według uczelni i koszty dokumentu pobytowego, według oficjalnych danych.',
    blocks: [
      { t: 'p', text: 'Rok studiów magisterskich w Holandii kosztuje studenta spoza UE około **22 900 €**, rok licencjatu około **16 900 €**. To typowe ceny (mediany) 501 kierunków na lata akademickie 2026/27 i 2027/28. Obywatele UE, EOG, Szwajcarii i Surinamu płacą opłatę ustawową: **2694 €** w roku 2026/27, a większość kierunków na 2027/28 podaje **2771 €**.' },
      { t: 'h2', id: 'who-pays', text: 'Kto ile płaci' },
      {
        t: 'ul',
        items: [
          '**Opłata ustawowa (wettelijk collegegeld)** dotyczy obywateli EOG, Szwajcarii i Surinamu, którzy nie mają jeszcze takiego samego dyplomu z publicznej holenderskiej uczelni. Jest taka sama na wszystkich uczelniach publicznych.',
          '**Opłata uczelni (instellingscollegegeld)** dotyczy wszystkich pozostałych, także studentów z krajów WNP, Azji i Afryki. Każda uczelnia ustala ją sama, więc różni się między uczelniami i kierunkami.',
          'Niektóre uczelnie pobierają od studentów spoza EOG także opłatę za aplikację: od 75 do 100 €, według Study in NL.',
        ],
      },
      { t: 'h2', id: 'levels', text: 'Ceny dla studentów spoza UE' },
      {
        t: 'ul',
        items: [
          '**Magisterium:** około 22 900 € rocznie. 80% kierunków kosztuje od 19 600 do 26 000 € (385 kierunków).',
          '**Licencjat:** około 16 900 € rocznie. 80% kierunków kosztuje od 11 800 do 24 500 € (116 kierunków).',
          'Magisterium w Holandii trwa zwykle rok lub dwa lata, licencjat trzy lata na uniwersytecie badawczym i cztery na uczelni nauk stosowanych.',
        ],
      },
      { t: 'h2', id: 'universities', text: 'Ceny na dużych uniwersytetach' },
      { t: 'p', text: 'Typowa cena roku dla studenta spoza UE:' },
      {
        t: 'ul',
        items: [
          '[Uniwersytet Radboud](/institutions/nl/radboud-university): licencjat około 15 800 €, magisterium około 19 600 €',
          '[Uniwersytet w Lejdzie](/institutions/nl/leiden-university): licencjat około 14 700 €, magisterium około 22 900 €',
          '[Uniwersytet Twente](/institutions/nl/university-of-twente): licencjat około 16 900 €, magisterium około 22 300 €',
          '[Uniwersytet w Groningen](/institutions/nl/university-of-groningen): magisterium około 22 800 €',
          '[Uniwersytet Amsterdamski](/institutions/nl/university-of-amsterdam): licencjat około 17 600 €, magisterium około 25 900 €',
        ],
      },
      { t: 'cta', href: '/institutions/nl', text: 'Wszystkie placówki w Holandii' },
      { t: 'cta', href: '/study/nl', text: 'Studia w Holandii: kierunki' },
      { t: 'h2', id: 'how', text: 'Jak liczyliśmy' },
      {
        t: 'ul',
        items: [
          '**Źródłem** jest Study in NL (Nuffic), oficjalny portal o studiach w Holandii. W naszej bazie jest 39 uczelni i 1481 kierunków; 501 z nich podaje cenę dla studentów spoza UE.',
          '**Mediana** to cena pośrodku: połowa kierunków kosztuje mniej, połowa więcej.',
          '**Tylko czesne.** Zakwaterowanie, jedzenie, ubezpieczenie i dokument pobytowy nie są wliczone.',
        ],
      },
      { t: 'h2', id: 'permit', text: 'Dokument pobytowy i pieniądze na życie' },
      {
        t: 'ul',
        items: [
          '**Opłata IND** za zezwolenie na pobyt w celu studiów wynosi 254 € (kwota na 2026 rok; IND zmienia ją co roku 1 stycznia). Zwykle wniosek za studenta składa uczelnia.',
          '**Pieniądze na życie:** IND wymaga wykazania 1130,77 € miesięcznie (norma na 2026 rok), czyli około 13 600 € na rok studiów.',
          '**Praca:** z zezwoleniem na pobyt w celu studiów można pracować do 16 godzin tygodniowo albo na pełny etat w czerwcu, lipcu i sierpniu; pracodawca zwykle potrzebuje zezwolenia na pracę.',
        ],
      },
      { t: 'note', text: 'Na holenderskie uczelnie aplikuje się przez Studielink, a wiele kierunków ma wczesne terminy: [terminy i jak działa Studielink](/blog/netherlands-application-deadlines-studielink). Stypendium dla studentów spoza EOG: [NL Scholarship](/blog/nl-scholarship-netherlands-how-to-apply).' },
      { t: 'h2', id: 'cheaper', text: 'Jeśli to za drogo' },
      { t: 'p', text: 'Porównaj z innymi krajami: [ile kosztują studia za granicą](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country), [Niemcy, Czechy, Finlandia: gdzie studia są bezpłatne lub prawie bezpłatne](/blog/free-tuition-germany-czechia-finland), [koszt studiów w Szwecji](/blog/sweden-tuition-fees-international-students).' },
      { t: 'h2', id: 'sources', text: 'Źródła' },
      { t: 'p', text: 'Ceny kierunków: Study in NL (Nuffic), lata akademickie 2026/27 i 2027/28. Opłata ustawowa i kto ją płaci: [Study in NL, Tuition fees](https://www.studyinnl.org/finances/tuition-fees). Opłata za dokument pobytowy: [IND, Fees](https://ind.nl/en/fees-costs-of-an-application). Pieniądze na życie: [IND, Required amounts](https://ind.nl/en/required-amounts-income-requirements). Sprawdzono 18 listopada 2026 r. Przed złożeniem aplikacji sprawdź cenę na stronie kierunku.' },
    ],
  },
};
