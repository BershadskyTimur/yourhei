import type { Translations } from '@/lib/blog/types';

// Machine translation of the articles on tuition in Australia and in the Netherlands (de).
export const deMore6: Translations = {
  'australia-tuition-fees-international-students': {
    title: 'Studiengebühren in Australien für internationale Studierende',
    description: 'Was ein Studienjahr in Australien internationale Studierende kostet: Bachelor, Master, Berufsbildung, Englischkurse und große Universitäten, laut CRICOS-Register.',
    blocks: [
      { t: 'p', text: 'Ein Jahr Bachelor an einer australischen Universität kostet internationale Studierende etwa **43.000 AUD**. Das ist der typische Preis (Median) von 4.562 Studiengängen an 63 Universitäten für 2026. Berufliche Bildung an Colleges kostet ein Drittel davon, etwa 13.500 AUD pro Jahr. Unten stehen die Preise nach Stufe und an den großen Universitäten sowie wie viel Geld man für das Visum nachweisen muss.' },
      { t: 'h2', id: 'levels', text: 'Preise nach Stufe' },
      {
        t: 'ul',
        items: [
          '**Bachelor an einer Universität:** etwa 43.000 AUD pro Jahr. 80 % der Studiengänge kosten zwischen 30.800 und 58.300 AUD (4.562 Studiengänge).',
          '**Master an einer Universität:** etwa 35.300 AUD pro Jahr. 80 % der Studiengänge kosten zwischen 22.100 und 54.900 AUD (705 Studiengänge an 35 Universitäten; die großen Universitäten führen im Register weniger Master- als Bachelorstudiengänge).',
          '**Berufliche Bildung (VET) an Colleges und Instituten:** etwa 13.500 AUD pro Jahr, 80 % zwischen 8.000 und 25.000 AUD (3.768 Kurse).',
          '**Englischkurse:** etwa 17.100 AUD pro Jahr, 80 % zwischen 11.900 und 25.600 AUD (948 Kurse).',
          '**Schule für internationale Schülerinnen und Schüler:** etwa 31.000 AUD pro Jahr (838 Angebote).',
        ],
      },
      { t: 'h2', id: 'universities', text: 'Preise an den großen Universitäten (Bachelor)' },
      { t: 'p', text: 'Der typische Jahrespreis der Bachelorstudiengänge der Universität, vom niedrigsten an:' },
      {
        t: 'ul',
        items: [
          '[Deakin University](/institutions/au/deakin-university): etwa 44.400 AUD',
          '[University of Queensland](/institutions/au/university-of-queensland): etwa 47.200 AUD',
          '[Macquarie University](/institutions/au/macquarie-university): etwa 48.200 AUD',
          '[RMIT University](/institutions/au/rmit-university): etwa 49.000 AUD',
          '[University of Melbourne](/institutions/au/university-of-melbourne): etwa 49.100 AUD',
          '[University of Technology Sydney](/institutions/au/university-of-technology-sydney): etwa 51.000 AUD',
          '[University of Western Australia](/institutions/au/university-of-western-australia): etwa 51.100 AUD',
          '[University of New South Wales](/institutions/au/university-of-new-south-wales): etwa 56.000 AUD',
          '[Australian National University](/institutions/au/australian-national-university): etwa 56.100 AUD',
          '[Monash University](/institutions/au/monash-university): etwa 59.300 AUD',
          '[University of Sydney](/institutions/au/university-of-sydney): etwa 63.600 AUD',
        ],
      },
      { t: 'p', text: 'Innerhalb einer Universität unterscheiden sich die Preise der Studiengänge stark. Den Preis eines bestimmten Studiengangs finden Sie auf seiner Karte auf der Seite der Universität.' },
      { t: 'cta', href: '/institutions/au', text: 'Alle Einrichtungen in Australien' },
      { t: 'cta', href: '/study/au', text: 'Studieren in Australien: Fachrichtungen' },
      { t: 'h2', id: 'how', text: 'Wie wir gerechnet haben' },
      {
        t: 'ul',
        items: [
          '**Die Quelle** ist CRICOS, das offizielle Register der australischen Regierung: Es führt jeden Studiengang, für den man mit einem Studentenvisum einreisen kann, mit seinem Preis für internationale Studierende. Unsere Datenbank enthält 1.540 Anbieter und etwa 19.000 Studiengänge mit einem Preis für 2026.',
          '**Preis pro Jahr.** Das Register nennt den Preis des ganzen Studiengangs; wir teilen ihn durch die Dauer in Jahren.',
          '**Der Median** ist der Preis in der Mitte: Die Hälfte der Studiengänge kostet weniger, die andere Hälfte mehr.',
          '**Nur Studiengebühren.** Wohnen, Essen, die Krankenversicherung für Studierende (OSHC) und das Visum sind nicht enthalten.',
        ],
      },
      { t: 'h2', id: 'visa-money', text: 'Wie viel Geld man zum Leben braucht' },
      { t: 'p', text: 'Für das Studentenvisum (subclass 500) muss man Geld für den Lebensunterhalt nachweisen: **29.710 AUD pro Jahr** für eine Person, laut dem australischen Innenministerium für 2026. Das kommt zu den Studiengebühren und der Reise hinzu. Prüfen Sie die Unterlagen und den Betrag vor dem Antrag auf der Website des Ministeriums.' },
      { t: 'note', text: 'Beträge für andere Länder: [wie viel Geld man für ein Studentenvisum nachweisen muss](/blog/proof-of-funds-student-visa).' },
      { t: 'h2', id: 'cheaper', text: 'Wenn es zu teuer ist' },
      { t: 'p', text: 'Vergleichen Sie mit anderen Ländern: [was ein Studium im Ausland kostet](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country), [Länder, in denen das Studium kostenlos oder fast kostenlos ist](/blog/free-tuition-germany-czechia-finland). Stipendien, die alles abdecken: [Vollstipendien für internationale Studierende](/blog/fully-funded-scholarships-for-international-students).' },
      { t: 'h2', id: 'sources', text: 'Quellen' },
      { t: 'p', text: 'Preise: [CRICOS](https://cricos.education.gov.au/), Bildungsministerium der australischen Regierung, offene Daten auf data.gov.au, heruntergeladen im Oktober 2026. Lebensunterhalt: [Student visa (subclass 500)](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500), Innenministerium, geprüft am 8. Oktober 2026. Prüfen Sie vor der Bewerbung den Preis auf der Seite des Studiengangs.' },
    ],
  },
  'netherlands-tuition-fees-international-students': {
    title: 'Studiengebühren in den Niederlanden für internationale Studierende',
    description: 'Was ein Studienjahr in den Niederlanden kostet: die gesetzliche Gebühr für EU-Bürger, die Preise für alle anderen nach Universität und die Kosten des Aufenthaltstitels.',
    blocks: [
      { t: 'p', text: 'Ein Jahr Master in den Niederlanden kostet Studierende von außerhalb der EU etwa **22.900 €**, ein Jahr Bachelor etwa **16.900 €**. Das sind typische Preise (Mediane) von 501 Studiengängen für die Studienjahre 2026/27 und 2027/28. Bürger der EU, des EWR, der Schweiz und Surinames zahlen die gesetzliche Gebühr: **2.694 €** im Jahr 2026/27, und die meisten Studiengänge für 2027/28 nennen **2.771 €**.' },
      { t: 'h2', id: 'who-pays', text: 'Wer was zahlt' },
      {
        t: 'ul',
        items: [
          '**Die gesetzliche Gebühr (wettelijk collegegeld)** gilt für Bürger des EWR, der Schweiz und Surinames, die noch keinen gleichen Abschluss einer staatlich finanzierten niederländischen Hochschule haben. Sie ist an allen öffentlichen Hochschulen gleich.',
          '**Die Hochschulgebühr (instellingscollegegeld)** gilt für alle anderen, auch für Studierende aus der GUS, Asien und Afrika. Jede Hochschule legt sie selbst fest, daher unterscheidet sie sich zwischen Hochschulen und Studiengängen.',
          'Manche Hochschulen verlangen von Studierenden außerhalb des EWR zusätzlich eine Bewerbungsgebühr: zwischen 75 und 100 €, laut Study in NL.',
        ],
      },
      { t: 'h2', id: 'levels', text: 'Preise für Studierende von außerhalb der EU' },
      {
        t: 'ul',
        items: [
          '**Master:** etwa 22.900 € pro Jahr. 80 % der Studiengänge kosten zwischen 19.600 und 26.000 € (385 Studiengänge).',
          '**Bachelor:** etwa 16.900 € pro Jahr. 80 % der Studiengänge kosten zwischen 11.800 und 24.500 € (116 Studiengänge).',
          'Ein Master dauert in den Niederlanden meist ein oder zwei Jahre, ein Bachelor an einer Forschungsuniversität drei und an einer Hochschule für angewandte Wissenschaften vier Jahre.',
        ],
      },
      { t: 'h2', id: 'universities', text: 'Preise an den großen Universitäten' },
      { t: 'p', text: 'Der typische Jahrespreis für Studierende von außerhalb der EU:' },
      {
        t: 'ul',
        items: [
          '[Radboud-Universität](/institutions/nl/radboud-university): Bachelor etwa 15.800 €, Master etwa 19.600 €',
          '[Universität Leiden](/institutions/nl/leiden-university): Bachelor etwa 14.700 €, Master etwa 22.900 €',
          '[Universität Twente](/institutions/nl/university-of-twente): Bachelor etwa 16.900 €, Master etwa 22.300 €',
          '[Universität Groningen](/institutions/nl/university-of-groningen): Master etwa 22.800 €',
          '[Universität Amsterdam](/institutions/nl/university-of-amsterdam): Bachelor etwa 17.600 €, Master etwa 25.900 €',
        ],
      },
      { t: 'cta', href: '/institutions/nl', text: 'Alle Einrichtungen in den Niederlanden' },
      { t: 'cta', href: '/study/nl', text: 'Studieren in den Niederlanden: Fachrichtungen' },
      { t: 'h2', id: 'how', text: 'Wie wir gerechnet haben' },
      {
        t: 'ul',
        items: [
          '**Die Quelle** ist Study in NL (Nuffic), das offizielle Portal zum Studium in den Niederlanden. Unsere Datenbank enthält 39 Hochschulen und 1.481 Studiengänge; 501 davon nennen einen Preis für Studierende von außerhalb der EU.',
          '**Der Median** ist der Preis in der Mitte: Die Hälfte der Studiengänge kostet weniger, die andere Hälfte mehr.',
          '**Nur Studiengebühren.** Wohnen, Essen, Versicherung und Aufenthaltstitel sind nicht enthalten.',
        ],
      },
      { t: 'h2', id: 'permit', text: 'Aufenthaltstitel und Lebenshaltungskosten' },
      {
        t: 'ul',
        items: [
          '**Die IND-Gebühr** für einen Aufenthaltstitel zum Studium beträgt 254 € (Betrag für 2026; die IND ändert ihn jedes Jahr zum 1. Januar). Meist stellt die Hochschule den Antrag für die Studierenden.',
          '**Lebensunterhalt:** Die IND verlangt den Nachweis von 1.130,77 € pro Monat (Norm für 2026), also etwa 13.600 € für ein Studienjahr.',
          '**Arbeit:** Mit einem Aufenthaltstitel zum Studium darf man bis zu 16 Stunden pro Woche arbeiten, im Juni, Juli und August auch Vollzeit; der Arbeitgeber braucht meist eine Arbeitserlaubnis.',
        ],
      },
      { t: 'note', text: 'Man bewirbt sich an niederländischen Hochschulen über Studielink, und viele Studiengänge haben frühe Fristen: [Fristen und wie Studielink funktioniert](/blog/netherlands-application-deadlines-studielink). Ein Stipendium für Studierende außerhalb des EWR: [NL Scholarship](/blog/nl-scholarship-netherlands-how-to-apply).' },
      { t: 'h2', id: 'cheaper', text: 'Wenn es zu teuer ist' },
      { t: 'p', text: 'Vergleichen Sie mit anderen Ländern: [was ein Studium im Ausland kostet](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country), [Deutschland, Tschechien, Finnland: wo das Studium kostenlos oder fast kostenlos ist](/blog/free-tuition-germany-czechia-finland), [Studiengebühren in Schweden](/blog/sweden-tuition-fees-international-students).' },
      { t: 'h2', id: 'sources', text: 'Quellen' },
      { t: 'p', text: 'Preise der Studiengänge: Study in NL (Nuffic), Studienjahre 2026/27 und 2027/28. Die gesetzliche Gebühr und wer sie zahlt: [Study in NL, Tuition fees](https://www.studyinnl.org/finances/tuition-fees). Gebühr für den Aufenthaltstitel: [IND, Fees](https://ind.nl/en/fees-costs-of-an-application). Lebensunterhalt: [IND, Required amounts](https://ind.nl/en/required-amounts-income-requirements). Geprüft am 18. November 2026. Prüfen Sie vor der Bewerbung den Preis auf der Seite des Studiengangs.' },
    ],
  },
};
