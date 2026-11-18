import type { Translations } from '@/lib/blog/types';

// Machine translation of the articles on tuition in Australia and in the Netherlands (tr).
export const trMore6: Translations = {
  'australia-tuition-fees-international-students': {
    title: 'Avustralya’da uluslararası öğrenciler için eğitim ücretleri',
    description: 'Avustralya’da bir yıllık eğitim uluslararası öğrenciye ne kadara mal olur: lisans, yüksek lisans, mesleki eğitim, İngilizce kursları ve büyük üniversiteler, CRICOS verileriyle.',
    blocks: [
      { t: 'p', text: 'Avustralya’da bir üniversitede bir yıllık lisans eğitimi uluslararası öğrenciye yaklaşık **43.000 AUD**’ye mal olur. Bu, 2026 yılı için 63 üniversitedeki 4.562 programın tipik fiyatıdır (medyan). Kolejlerde mesleki eğitim bunun üçte biri kadardır, yılda yaklaşık 13.500 AUD. Aşağıda seviyeye ve büyük üniversitelere göre fiyatlar ile vize için ne kadar para göstermeniz gerektiği yer alıyor.' },
      { t: 'h2', id: 'levels', text: 'Seviyeye göre fiyatlar' },
      {
        t: 'ul',
        items: [
          '**Üniversitede lisans:** yılda yaklaşık 43.000 AUD. Programların %80’i 30.800 ile 58.300 AUD arasında (4.562 program).',
          '**Üniversitede yüksek lisans:** yılda yaklaşık 35.300 AUD. Programların %80’i 22.100 ile 54.900 AUD arasında (35 üniversitede 705 program; büyük üniversiteler kayıtta lisanstan daha az yüksek lisans programı listeliyor).',
          '**Kolej ve enstitülerde mesleki eğitim (VET):** yılda yaklaşık 13.500 AUD, %80’i 8.000 ile 25.000 AUD arasında (3.768 program).',
          '**İngilizce dil kursları:** yılda yaklaşık 17.100 AUD, %80’i 11.900 ile 25.600 AUD arasında (948 kurs).',
          '**Uluslararası öğrenciler için okul:** yılda yaklaşık 31.000 AUD (838 program).',
        ],
      },
      { t: 'h2', id: 'universities', text: 'Büyük üniversitelerde fiyatlar (lisans)' },
      { t: 'p', text: 'Üniversitenin lisans programlarında bir yılın tipik fiyatı, en düşükten başlayarak:' },
      {
        t: 'ul',
        items: [
          '[Deakin Üniversitesi](/institutions/au/deakin-university): yaklaşık 44.400 AUD',
          '[Queensland Üniversitesi](/institutions/au/university-of-queensland): yaklaşık 47.200 AUD',
          '[Macquarie Üniversitesi](/institutions/au/macquarie-university): yaklaşık 48.200 AUD',
          '[RMIT Üniversitesi](/institutions/au/rmit-university): yaklaşık 49.000 AUD',
          '[Melbourne Üniversitesi](/institutions/au/university-of-melbourne): yaklaşık 49.100 AUD',
          '[Sidney Teknoloji Üniversitesi](/institutions/au/university-of-technology-sydney): yaklaşık 51.000 AUD',
          '[Batı Avustralya Üniversitesi](/institutions/au/university-of-western-australia): yaklaşık 51.100 AUD',
          '[Yeni Güney Galler Üniversitesi](/institutions/au/university-of-new-south-wales): yaklaşık 56.000 AUD',
          '[Avustralya Ulusal Üniversitesi](/institutions/au/australian-national-university): yaklaşık 56.100 AUD',
          '[Monash Üniversitesi](/institutions/au/monash-university): yaklaşık 59.300 AUD',
          '[Sidney Üniversitesi](/institutions/au/university-of-sydney): yaklaşık 63.600 AUD',
        ],
      },
      { t: 'p', text: 'Aynı üniversitenin programları arasında fiyatlar çok farklıdır. Belirli bir programın fiyatı, üniversite sayfasındaki program kartında yer alır.' },
      { t: 'cta', href: '/institutions/au', text: 'Avustralya’daki tüm kurumlar' },
      { t: 'cta', href: '/study/au', text: 'Avustralya’da eğitim: alanlar' },
      { t: 'h2', id: 'how', text: 'Nasıl hesapladık' },
      {
        t: 'ul',
        items: [
          '**Kaynak**, Avustralya Hükümeti’nin resmi kaydı CRICOS’tur: öğrenci vizesiyle gelinebilecek her programı, uluslararası öğrenciler için fiyatıyla listeler. Veri tabanımızda 1.540 kurum ve 2026 fiyatı olan yaklaşık 19.000 program var.',
          '**Yıllık fiyat.** Kayıt programın tamamının fiyatını verir; biz bunu yıl cinsinden süreye böleriz.',
          '**Medyan** ortadaki fiyattır: programların yarısı daha ucuz, yarısı daha pahalıdır.',
          '**Yalnızca eğitim ücreti.** Konaklama, yemek, öğrenci sağlık sigortası (OSHC) ve vize dahil değildir.',
        ],
      },
      { t: 'h2', id: 'visa-money', text: 'Yaşamak için ne kadar para gerekir' },
      { t: 'p', text: 'Öğrenci vizesi (subclass 500) için yaşam masraflarını karşılayacak parayı göstermeniz gerekir: Avustralya İçişleri Bakanlığı’na göre 2026 yılı için tek bir öğrenci için **yılda 29.710 AUD**. Bu, eğitim ücreti ve yol masrafına ek bir tutardır. Başvurmadan önce belgeleri ve tutarı bakanlığın sitesinden kontrol edin.' },
      { t: 'note', text: 'Diğer ülkeler için tutarlar: [öğrenci vizesi için ne kadar para göstermek gerekir](/blog/proof-of-funds-student-visa).' },
      { t: 'h2', id: 'cheaper', text: 'Çok pahalıysa' },
      { t: 'p', text: 'Diğer ülkelerle karşılaştırın: [yurt dışında okumak ne kadar tutar](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country), [eğitimin ücretsiz ya da neredeyse ücretsiz olduğu ülkeler](/blog/free-tuition-germany-czechia-finland). Her şeyi karşılayan burslar: [uluslararası öğrenciler için tam burslar](/blog/fully-funded-scholarships-for-international-students).' },
      { t: 'h2', id: 'sources', text: 'Kaynaklar' },
      { t: 'p', text: 'Fiyatlar: [CRICOS](https://cricos.education.gov.au/), Avustralya Hükümeti Eğitim Bakanlığı, data.gov.au açık verileri, Ekim 2026’da indirildi. Yaşam masrafları: [Student visa (subclass 500)](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500), İçişleri Bakanlığı, 8 Ekim 2026’da kontrol edildi. Başvurmadan önce fiyatı program sayfasından doğrulayın.' },
    ],
  },
  'netherlands-tuition-fees-international-students': {
    title: 'Hollanda’da uluslararası öğrenciler için eğitim ücretleri',
    description: 'Hollanda’da bir yıllık eğitim ne kadar tutar: AB vatandaşları için yasal ücret, diğerleri için üniversitelere göre fiyatlar ve oturma izni masrafları, resmi verilerle.',
    blocks: [
      { t: 'p', text: 'Hollanda’da bir yıllık yüksek lisans AB dışından bir öğrenciye yaklaşık **22.900 €**, bir yıllık lisans yaklaşık **16.900 €** tutar. Bunlar 2026/27 ve 2027/28 akademik yılları için 501 programın tipik fiyatlarıdır (medyan). AB, AEA, İsviçre ve Surinam vatandaşları yasal ücreti öder: 2026/27’de **2.694 €**; 2027/28 programlarının çoğu **2.771 €** belirtiyor.' },
      { t: 'h2', id: 'who-pays', text: 'Kim ne öder' },
      {
        t: 'ul',
        items: [
          '**Yasal ücret (wettelijk collegegeld)**, henüz Hollanda’daki devlet destekli bir kurumdan aynı dereceyi almamış AEA, İsviçre ve Surinam vatandaşları içindir. Tüm devlet kurumlarında aynıdır.',
          '**Kurum ücreti (instellingscollegegeld)** diğer herkes içindir; BDT, Asya ve Afrika’dan gelen öğrenciler de buna dahildir. Her kurum kendi ücretini belirler, bu yüzden kurumlar ve programlar arasında farklılık gösterir.',
          'Bazı kurumlar AEA dışından gelen öğrencilerden ayrıca başvuru ücreti alır: Study in NL’e göre 75 ile 100 € arası.',
        ],
      },
      { t: 'h2', id: 'levels', text: 'AB dışından öğrenciler için fiyatlar' },
      {
        t: 'ul',
        items: [
          '**Yüksek lisans:** yılda yaklaşık 22.900 €. Programların %80’i 19.600 ile 26.000 € arasında (385 program).',
          '**Lisans:** yılda yaklaşık 16.900 €. Programların %80’i 11.800 ile 24.500 € arasında (116 program).',
          'Hollanda’da yüksek lisans genellikle bir veya iki yıl sürer; lisans araştırma üniversitesinde üç, uygulamalı bilimler üniversitesinde dört yıldır.',
        ],
      },
      { t: 'h2', id: 'universities', text: 'Büyük üniversitelerde fiyatlar' },
      { t: 'p', text: 'AB dışından bir öğrenci için bir yılın tipik fiyatı:' },
      {
        t: 'ul',
        items: [
          '[Radboud Üniversitesi](/institutions/nl/radboud-university): lisans yaklaşık 15.800 €, yüksek lisans yaklaşık 19.600 €',
          '[Leiden Üniversitesi](/institutions/nl/leiden-university): lisans yaklaşık 14.700 €, yüksek lisans yaklaşık 22.900 €',
          '[Twente Üniversitesi](/institutions/nl/university-of-twente): lisans yaklaşık 16.900 €, yüksek lisans yaklaşık 22.300 €',
          '[Groningen Üniversitesi](/institutions/nl/university-of-groningen): yüksek lisans yaklaşık 22.800 €',
          '[Amsterdam Üniversitesi](/institutions/nl/university-of-amsterdam): lisans yaklaşık 17.600 €, yüksek lisans yaklaşık 25.900 €',
        ],
      },
      { t: 'cta', href: '/institutions/nl', text: 'Hollanda’daki tüm kurumlar' },
      { t: 'cta', href: '/study/nl', text: 'Hollanda’da eğitim: alanlar' },
      { t: 'h2', id: 'how', text: 'Nasıl hesapladık' },
      {
        t: 'ul',
        items: [
          '**Kaynak**, Hollanda’da eğitim hakkındaki resmi portal Study in NL’dir (Nuffic). Veri tabanımızda 39 kurum ve 1.481 program var; bunların 501’i AB dışından öğrenciler için fiyat belirtiyor.',
          '**Medyan** ortadaki fiyattır: programların yarısı daha ucuz, yarısı daha pahalıdır.',
          '**Yalnızca eğitim ücreti.** Konaklama, yemek, sigorta ve oturma izni dahil değildir.',
        ],
      },
      { t: 'h2', id: 'permit', text: 'Oturma izni ve yaşam masrafları' },
      {
        t: 'ul',
        items: [
          '**IND ücreti**, eğitim amaçlı oturma izni için 254 €’dur (2026 tutarı; IND bunu her yıl 1 Ocak’ta değiştirir). Başvuruyu genellikle kurum öğrenci adına yapar.',
          '**Yaşam masrafları:** IND ayda 1.130,77 € göstermenizi ister (2026 normu), yani bir eğitim yılı için yaklaşık 13.600 €.',
          '**Çalışma:** eğitim amaçlı oturma izniyle haftada 16 saate kadar ya da haziran, temmuz ve ağustos aylarında tam zamanlı çalışabilirsiniz; işverenin genellikle çalışma iznine ihtiyacı vardır.',
        ],
      },
      { t: 'note', text: 'Hollanda’daki kurumlara Studielink üzerinden başvurulur ve birçok programın son başvuru tarihi erkendir: [son tarihler ve Studielink nasıl işler](/blog/netherlands-application-deadlines-studielink). AEA dışından öğrenciler için bir burs: [NL Scholarship](/blog/nl-scholarship-netherlands-how-to-apply).' },
      { t: 'h2', id: 'cheaper', text: 'Çok pahalıysa' },
      { t: 'p', text: 'Diğer ülkelerle karşılaştırın: [yurt dışında okumak ne kadar tutar](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country), [Almanya, Çekya, Finlandiya: eğitimin ücretsiz ya da neredeyse ücretsiz olduğu yerler](/blog/free-tuition-germany-czechia-finland), [İsveç’te eğitim ücretleri](/blog/sweden-tuition-fees-international-students).' },
      { t: 'h2', id: 'sources', text: 'Kaynaklar' },
      { t: 'p', text: 'Program fiyatları: Study in NL (Nuffic), 2026/27 ve 2027/28 akademik yılları. Yasal ücret ve kimin ödediği: [Study in NL, Tuition fees](https://www.studyinnl.org/finances/tuition-fees). Oturma izni ücreti: [IND, Fees](https://ind.nl/en/fees-costs-of-an-application). Yaşam masrafları: [IND, Required amounts](https://ind.nl/en/required-amounts-income-requirements). 18 Kasım 2026’da kontrol edildi. Başvurmadan önce fiyatı program sayfasından doğrulayın.' },
    ],
  },
};
