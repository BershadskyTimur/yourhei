import type { Translations } from '@/lib/blog/types';

// Machine translation of the articles on tuition in Australia and in the Netherlands (az).
export const azMore6: Translations = {
  'australia-tuition-fees-international-students': {
    title: 'Avstraliyada əcnəbi tələbələr üçün təhsil haqqı',
    description: 'Avstraliyada əcnəbi tələbə üçün bir illik təhsil nə qədərdir: bakalavriat, magistratura, peşə təhsili, ingilis dili kursları və böyük universitetlər, CRICOS reyestrinə görə.',
    blocks: [
      { t: 'p', text: 'Avstraliya universitetində bakalavriatın bir ili əcnəbi tələbəyə təxminən **43 000 Avstraliya dolları**na başa gəlir. Bu, 2026-cı il üçün 63 universitetin 4 562 proqramı üzrə tipik qiymətdir (median). Kolleclərdə peşə təhsili üç dəfə ucuzdur — ildə təxminən 13 500 dollar. Aşağıda səviyyələr və böyük universitetlər üzrə qiymətlər, həmçinin viza üçün nə qədər pul göstərmək lazım olduğu verilib.' },
      { t: 'h2', id: 'levels', text: 'Səviyyələr üzrə qiymətlər' },
      {
        t: 'ul',
        items: [
          '**Universitetdə bakalavriat:** ildə təxminən 43 000 dollar. Proqramların 80%-i 30 800-dən 58 300 dollara qədərdir (4 562 proqram).',
          '**Universitetdə magistratura:** ildə təxminən 35 300 dollar. Proqramların 80%-i 22 100-dən 54 900 dollara qədər (35 universitetin 705 proqramı; böyük universitetlərin reyestrdə magistratura proqramları bakalavriatdan azdır).',
          '**Kollec və institutlarda peşə təhsili (VET):** ildə təxminən 13 500 dollar, 80%-i 8 000-dən 25 000-ə qədər (3 768 proqram).',
          '**İngilis dili kursları:** ildə təxminən 17 100 dollar, 80%-i 11 900-dən 25 600-ə qədər (948 kurs).',
          '**Əcnəbi şagirdlər üçün məktəb:** ildə təxminən 31 000 dollar (838 proqram).',
        ],
      },
      { t: 'h2', id: 'universities', text: 'Böyük universitetlərdə qiymətlər (bakalavriat)' },
      { t: 'p', text: 'Universitetin bakalavriat proqramları üzrə bir ilin tipik qiyməti, ən aşağıdan başlayaraq:' },
      {
        t: 'ul',
        items: [
          '[Dikin Universiteti](/institutions/au/deakin-university): təxminən 44 400 dollar',
          '[Kvinslend Universiteti](/institutions/au/university-of-queensland): təxminən 47 200 dollar',
          '[Makkuori Universiteti](/institutions/au/macquarie-university): təxminən 48 200 dollar',
          '[RMIT Universiteti](/institutions/au/rmit-university): təxminən 49 000 dollar',
          '[Melburn Universiteti](/institutions/au/university-of-melbourne): təxminən 49 100 dollar',
          '[Sidney Texnologiya Universiteti](/institutions/au/university-of-technology-sydney): təxminən 51 000 dollar',
          '[Qərbi Avstraliya Universiteti](/institutions/au/university-of-western-australia): təxminən 51 100 dollar',
          '[Yeni Cənubi Uels Universiteti](/institutions/au/university-of-new-south-wales): təxminən 56 000 dollar',
          '[Avstraliya Milli Universiteti](/institutions/au/australian-national-university): təxminən 56 100 dollar',
          '[Monaş Universiteti](/institutions/au/monash-university): təxminən 59 300 dollar',
          '[Sidney Universiteti](/institutions/au/university-of-sydney): təxminən 63 600 dollar',
        ],
      },
      { t: 'p', text: 'Bir universitet daxilində proqramların qiymətləri çox fərqlənir. Konkret proqramın qiymətini universitet səhifəsindəki onun kartında baxın.' },
      { t: 'cta', href: '/institutions/au', text: 'Avstraliyadakı bütün təhsil müəssisələri' },
      { t: 'cta', href: '/study/au', text: 'Avstraliyada təhsil: istiqamətlər' },
      { t: 'h2', id: 'how', text: 'Necə hesabladıq' },
      {
        t: 'ul',
        items: [
          '**Mənbə** CRICOS-dur, Avstraliya hökumətinin rəsmi reyestri: orada tələbə vizası ilə gəlmək mümkün olan hər proqram əcnəbilər üçün qiyməti ilə verilib. Bazamızda 1 540 müəssisə və 2026-cı il qiyməti olan təxminən 19 000 proqram var.',
          '**İllik qiymət.** Reyestr bütün proqramın qiymətini göstərir; biz onu illərlə müddətinə bölürük.',
          '**Median** ortadakı qiymətdir: proqramların yarısı daha ucuz, yarısı daha bahadır.',
          '**Yalnız təhsil haqqı.** Yaşayış, qida, tələbələr üçün tibbi sığorta (OSHC) və viza qiymətə daxil deyil.',
        ],
      },
      { t: 'h2', id: 'visa-money', text: 'Yaşamaq üçün nə qədər pul lazımdır' },
      { t: 'p', text: 'Tələbə vizası (subclass 500) üçün yaşamağa pulunuz olduğunu göstərməlisiniz: Avstraliya Daxili İşlər Nazirliyinin 2026-cı il məlumatına görə bir tələbə üçün **ildə 29 710 Avstraliya dolları**. Bu, təhsil haqqı və uçuşdan əlavədir. Müraciət etməzdən əvvəl sənədləri və məbləği nazirliyin saytında yoxlayın.' },
      { t: 'note', text: 'Digər ölkələr üçün məbləğlər: [tələbə vizası üçün nə qədər pul göstərmək lazımdır](/blog/proof-of-funds-student-visa).' },
      { t: 'h2', id: 'cheaper', text: 'Əgər bahadırsa' },
      { t: 'p', text: 'Digər ölkələrlə müqayisə edin: [xaricdə təhsil nə qədərə başa gəlir](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country), [təhsilin pulsuz və ya demək olar ki, pulsuz olduğu ölkələr](/blog/free-tuition-germany-czechia-finland). Hər şeyi əhatə edən təqaüdlər: [əcnəbi tələbələr üçün tam təqaüdlər](/blog/fully-funded-scholarships-for-international-students).' },
      { t: 'h2', id: 'sources', text: 'Mənbələr' },
      { t: 'p', text: 'Qiymətlər: [CRICOS](https://cricos.education.gov.au/), Avstraliya Təhsil Nazirliyi, data.gov.au saytında açıq məlumatlar, 2026-cı ilin oktyabrında yüklənib. Yaşamaq üçün pul: [Student visa (subclass 500)](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500), Daxili İşlər Nazirliyi, 8 oktyabr 2026-cı ildə yoxlanılıb. Müraciətdən əvvəl qiyməti proqram səhifəsində yoxlayın.' },
    ],
  },
  'netherlands-tuition-fees-international-students': {
    title: 'Niderlandda əcnəbi tələbələr üçün təhsil haqqı',
    description: 'Niderlandda bir illik təhsil nə qədərdir: Aİ vətəndaşları üçün qanuni haqq, digərləri üçün universitetlər üzrə qiymətlər və yaşayış icazəsinin xərcləri, rəsmi məlumatlara görə.',
    blocks: [
      { t: 'p', text: 'Niderlandda magistraturanın bir ili Aİ-dən kənar tələbəyə təxminən **22 900 avro**, bakalavriatın bir ili təxminən **16 900 avro**ya başa gəlir. Bunlar 2026/27 və 2027/28 tədris illəri üçün 501 proqram üzrə tipik qiymətlərdir (medianlar). Aİ, AİZ, İsveçrə və Surinam vətəndaşları qanuni haqq ödəyir: 2026/27-ci ildə **2 694 avro**, 2027/28-ci il proqramlarının çoxu isə **2 771 avro** göstərir.' },
      { t: 'h2', id: 'who-pays', text: 'Kim nə qədər ödəyir' },
      {
        t: 'ul',
        items: [
          '**Qanuni haqq (wettelijk collegegeld)** AİZ, İsveçrə və Surinam vətəndaşları üçündür, əgər onların hələ Niderlandın dövlət təhsil müəssisəsindən eyni dərəcəsi yoxdursa. O, bütün dövlət müəssisələrində eynidir.',
          '**Müəssisə haqqı (instellingscollegegeld)** qalan hamı üçündür, o cümlədən MDB, Asiya və Afrika ölkələrinin tələbələri üçün. Onu müəssisə özü təyin edir, buna görə də müəssisələr və proqramlar arasında fərqlənir.',
          'Bəzi müəssisələr AİZ-dən kənar tələbələrdən müraciət haqqı da alır: Study in NL-ə görə 75-dən 100 avroya qədər.',
        ],
      },
      { t: 'h2', id: 'levels', text: 'Aİ-dən kənar tələbələr üçün qiymətlər' },
      {
        t: 'ul',
        items: [
          '**Magistratura:** ildə təxminən 22 900 avro. Proqramların 80%-i 19 600-dən 26 000 avroya qədərdir (385 proqram).',
          '**Bakalavriat:** ildə təxminən 16 900 avro. Proqramların 80%-i 11 800-dən 24 500 avroya qədərdir (116 proqram).',
          'Niderlandda magistratura adətən bir və ya iki il, bakalavriat tədqiqat universitetində üç il, tətbiqi elmlər universitetində dörd il davam edir.',
        ],
      },
      { t: 'h2', id: 'universities', text: 'Böyük universitetlərdə qiymətlər' },
      { t: 'p', text: 'Aİ-dən kənar tələbə üçün bir ilin tipik qiyməti:' },
      {
        t: 'ul',
        items: [
          '[Radbaud Universiteti](/institutions/nl/radboud-university): bakalavriat təxminən 15 800 avro, magistratura təxminən 19 600 avro',
          '[Leyden Universiteti](/institutions/nl/leiden-university): bakalavriat təxminən 14 700 avro, magistratura təxminən 22 900 avro',
          '[Tvente Universiteti](/institutions/nl/university-of-twente): bakalavriat təxminən 16 900 avro, magistratura təxminən 22 300 avro',
          '[Qroningen Universiteti](/institutions/nl/university-of-groningen): magistratura təxminən 22 800 avro',
          '[Amsterdam Universiteti](/institutions/nl/university-of-amsterdam): bakalavriat təxminən 17 600 avro, magistratura təxminən 25 900 avro',
        ],
      },
      { t: 'cta', href: '/institutions/nl', text: 'Niderlanddakı bütün təhsil müəssisələri' },
      { t: 'cta', href: '/study/nl', text: 'Niderlandda təhsil: istiqamətlər' },
      { t: 'h2', id: 'how', text: 'Necə hesabladıq' },
      {
        t: 'ul',
        items: [
          '**Mənbə** Niderlandda təhsil haqqında rəsmi portal olan Study in NL-dir (Nuffic). Bazamızda 39 müəssisə və 1 481 proqram var; onlardan 501-də Aİ-dən kənar tələbələr üçün qiymət göstərilib.',
          '**Median** ortadakı qiymətdir: proqramların yarısı daha ucuz, yarısı daha bahadır.',
          '**Yalnız təhsil haqqı.** Yaşayış, qida, sığorta və yaşayış icazəsi qiymətə daxil deyil.',
        ],
      },
      { t: 'h2', id: 'permit', text: 'Yaşayış icazəsi və yaşamaq üçün pul' },
      {
        t: 'ul',
        items: [
          '**IND haqqı** təhsil üçün yaşayış icazəsinə 254 avrodur (2026-cı il məbləği; IND onu hər il 1 yanvarda dəyişir). Adətən müraciəti tələbə adından müəssisə təqdim edir.',
          '**Yaşamaq üçün pul:** IND ayda 1 130,77 avro göstərməyi tələb edir (2026-cı il norması), yəni bir tədris ili üçün təxminən 13 600 avro.',
          '**İş:** təhsil üçün yaşayış icazəsi ilə həftədə 16 saata qədər və ya iyun, iyul və avqustda tam ştat işləmək olar; işəgötürənə adətən iş icazəsi lazımdır.',
        ],
      },
      { t: 'note', text: 'Niderland müəssisələrinə müraciət Studielink vasitəsilə edilir və bir çox proqramın son tarixləri erkəndir: [son tarixlər və Studielink necə işləyir](/blog/netherlands-application-deadlines-studielink). AİZ-dən kənar tələbələr üçün təqaüd: [NL Scholarship](/blog/nl-scholarship-netherlands-how-to-apply).' },
      { t: 'h2', id: 'cheaper', text: 'Əgər bahadırsa' },
      { t: 'p', text: 'Digər ölkələrlə müqayisə edin: [xaricdə təhsil nə qədərə başa gəlir](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country), [Almaniya, Çexiya, Finlandiya: təhsilin pulsuz və ya demək olar ki, pulsuz olduğu yerlər](/blog/free-tuition-germany-czechia-finland), [İsveçdə təhsil haqqı](/blog/sweden-tuition-fees-international-students).' },
      { t: 'h2', id: 'sources', text: 'Mənbələr' },
      { t: 'p', text: 'Proqram qiymətləri: Study in NL (Nuffic), 2026/27 və 2027/28 tədris illəri. Qanuni haqq və onu kim ödəyir: [Study in NL, Tuition fees](https://www.studyinnl.org/finances/tuition-fees). Yaşayış icazəsi haqqı: [IND, Fees](https://ind.nl/en/fees-costs-of-an-application). Yaşamaq üçün pul: [IND, Required amounts](https://ind.nl/en/required-amounts-income-requirements). 18 noyabr 2026-cı ildə yoxlanılıb. Müraciətdən əvvəl qiyməti proqram səhifəsində yoxlayın.' },
    ],
  },
};
