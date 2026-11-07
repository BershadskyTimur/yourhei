import type { Translations } from '@/lib/blog/types';

// Machine translation of the article on tuition by country (de).
export const deMore4: Translations = {
  'how-much-does-it-cost-to-study-abroad-tuition-by-country': {
    title: 'Was ein Studium im Ausland kostet: Studiengebühren in 5 Ländern',
    description: 'Was internationale Studierende in den USA, Australien, den Niederlanden, Finnland und Schweden zahlen: typische Gebühren für Bachelor und Master.',
    blocks: [
      { t: 'p', text: 'Die häufigste Frage von Bewerbern lautet: „Was kostet das?“ Die Antwort hängt von Land, Hochschule und Studiengang ab, aber die Größenordnung ist klar. Unten stehen die typischen **Studiengebühren** für internationale Studierende in fünf Ländern, berechnet aus den veröffentlichten Preisen in der Datenbank von YourHEI (Stand Oktober 2026). Lebenshaltungskosten sind nicht enthalten: dazu am Ende des Artikels.' },
      { t: 'h2', id: 'how', text: 'Wie wir gerechnet haben' },
      {
        t: 'ul',
        items: [
          '**Der Median** ist der mittlere Preis: Die Hälfte der Studiengänge ist günstiger, die Hälfte teurer. Er ist fairer als der Durchschnitt, weil einige sehr teure Studiengänge ihn nicht verzerren.',
          '**Die Spanne** zeigt, wo 80 % der Preise liegen: Die günstigsten 10 % und die teuersten 10 % werden weggelassen.',
          '**Preis pro Jahr.** Wenn eine Quelle den Preis für das ganze Studium angibt, teilen wir ihn durch die Dauer in Jahren.',
          '**Nur Studiengänge mit bekanntem Preis**, der für internationale Studierende gilt. Für die anderen haben wir keinen Preis, und wir erfinden keinen.',
        ],
      },
      { t: 'h2', id: 'usa', text: 'USA' },
      {
        t: 'ul',
        items: [
          '**Eine typische Hochschule:** etwa 17 500 $ pro Jahr (Median über 3 083 Hochschulen mit veröffentlichtem Preis, Community Colleges eingeschlossen).',
          '**Spanne:** von 6 600 $ bis 47 500 $ pro Jahr.',
          '**So ist das zu lesen.** Bei staatlichen Universitäten enthält die Datenbank den Preis für Studierende aus anderen Bundesstaaten, den meist auch internationale Studierende zahlen. Private Universitäten verlangen von allen denselben Preis. Das sind nur die Studiengebühren, ohne Wohnen, Bücher und Versicherung.',
          'Bachelorstudiengänge gibt es häufiger an teuren Hochschulen: Über Studiengänge statt über Hochschulen gerechnet liegt der Median höher, bei etwa 31 000 $.',
        ],
      },
      { t: 'p', text: 'Hochschulen und Studiengänge in den USA: [Studieren in den USA](/study/us).' },
      { t: 'h2', id: 'australia', text: 'Australien' },
      {
        t: 'ul',
        items: [
          '**Bachelor:** etwa 40 400 australische Dollar pro Jahr (Spanne 24 200–57 100), 3 300 Studiengänge.',
          '**Master:** etwa 24 000 australische Dollar pro Jahr (Spanne 12 000–38 800), 1 570 Studiengänge.',
          'Quelle ist das offizielle Register CRICOS, das die Gesamtkosten des Studiums angibt; wir teilen sie durch die Dauer.',
        ],
      },
      { t: 'p', text: 'Studiengänge in Australien: [Studieren in Australien](/study/au).' },
      { t: 'h2', id: 'netherlands', text: 'Niederlande' },
      {
        t: 'ul',
        items: [
          '**Bachelor:** etwa 16 900 Euro pro Jahr (Spanne 11 800–24 500), 109 Studiengänge.',
          '**Master:** etwa 22 900 Euro pro Jahr (Spanne 19 600–26 000), 385 Studiengänge.',
          'Der Preis für Studierende von außerhalb des EWR ist bei etwa einem Drittel der Studiengänge angegeben (494 von 1 474): Bei den anderen nennt die Quelle keinen Preis für diese Studierenden. Fragen Sie dafür die Hochschule.',
        ],
      },
      { t: 'p', text: 'Studiengänge in den Niederlanden: [Studieren in den Niederlanden](/study/nl); wie und wann man sich bewirbt: [Niederlande: Studielink und Fristen](/blog/netherlands-application-deadlines-studielink); ein Stipendium: [NL Scholarship](/blog/nl-scholarship-netherlands-how-to-apply).' },
      { t: 'h2', id: 'finland', text: 'Finnland' },
      {
        t: 'ul',
        items: [
          '**Bachelor:** etwa 10 000 Euro pro Jahr (Spanne 9 500–12 000), 262 Studiengänge.',
          '**Master:** etwa 12 000 Euro pro Jahr (Spanne 10 000–18 000), 589 Studiengänge.',
          'Ein Studium auf Finnisch oder Schwedisch und die Promotion sind kostenlos ([mehr dazu](/blog/free-tuition-germany-czechia-finland)).',
        ],
      },
      { t: 'p', text: 'Studiengänge in Finnland: [Studieren in Finnland](/study/fi).' },
      { t: 'h2', id: 'sweden', text: 'Schweden' },
      {
        t: 'ul',
        items: [
          '**Bachelor:** etwa 150 000 schwedische Kronen pro Jahr (Spanne 97 000–290 000), 101 Studiengänge.',
          '**Master:** etwa 147 000 schwedische Kronen pro Jahr (Spanne 97 000–192 500), 894 Studiengänge.',
          'Quelle ist das offizielle schwedische Bewerbungsportal universityadmissions.se, das die Gesamtkosten eines Studiengangs angibt; wir teilen sie durch die Dauer. Studierende aus der EU, dem EWR und der Schweiz zahlen nichts: Für sie ist das Studium kostenlos.',
        ],
      },
      { t: 'h2', id: 'germany', text: 'Und Deutschland und Tschechien?' },
      { t: 'p', text: 'An staatlichen Hochschulen in Deutschland ist das Studium in den meisten Fällen kostenlos, und in Tschechien sind Studiengänge auf Tschechisch kostenlos. Diese Regeln und ihre Ausnahmen werden separat erklärt: [Ist das Studium in Deutschland, Tschechien und Finnland kostenlos?](/blog/free-tuition-germany-czechia-finland).' },
      { t: 'h2', id: 'living', text: 'Die Studiengebühren sind nicht alle Kosten' },
      {
        t: 'ul',
        items: [
          'Für ein Studienvisum müssen Sie nachweisen, dass Sie den Lebensunterhalt bezahlen können: Die Beträge für 14 Länder stehen in [Wie viel Geld man für ein Studienvisum nachweisen muss](/blog/proof-of-funds-student-visa).',
          'Die tatsächlichen Kosten liegen meist über dem Minimum für das Visum, besonders in großen Städten.',
          'Studiengebühren lassen sich mit einem Stipendium senken: [Vollstipendien für internationale Studierende](/blog/fully-funded-scholarships-for-international-students) und [die Datenbank staatlicher Stipendien](/scholarships).',
        ],
      },
      { t: 'note', text: 'Die Preise ändern sich jedes Jahr, und Hochschulen haben eigene Bedingungen und Ermäßigungen. Prüfen Sie vor der Bewerbung den Preis auf der offiziellen Seite des Studiengangs: Jede Hochschulseite auf YourHEI enthält den Link.' },
      { t: 'p', text: 'Im [Katalog](/catalog) können Sie die Preise in Ihrer Währung anzeigen und Studiengänge nach Land, Abschluss und Budget filtern.' },
      {
        t: 'p',
        text: 'Datenquellen: [US College Scorecard](https://collegescorecard.ed.gov/data/); [CRICOS, das Register der Studiengänge für internationale Studierende in Australien](https://cricos.education.gov.au/); [Study in NL](https://www.studyinnl.org/); [Studyinfo, Finnland](https://opintopolku.fi/konfo/en/); [universityadmissions.se, Schweden](https://www.universityadmissions.se/).',
      },
      { t: 'cta', href: '/catalog', text: 'Studiengang nach Budget finden' },
      { t: 'cta', href: '/scholarships', text: 'Stipendien' },
    ],
  },
};
