import type { Translations } from '@/lib/blog/types';

// Machine translation of the article on tuition by country (tr).
export const trMore4: Translations = {
  'how-much-does-it-cost-to-study-abroad-tuition-by-country': {
    title: 'Yurt dışında okumak ne kadar tutar: 5 ülkede öğrenim ücretleri',
    description: 'Uluslararası öğrenciler ABD, Avustralya, Hollanda, Finlandiya ve İsveç’te öğrenim için ne öder: resmi verilere göre tipik lisans ve yüksek lisans ücretleri.',
    blocks: [
      { t: 'p', text: 'Bir adayın en sık sorduğu soru “ne kadar tutar?” sorusudur. Yanıt ülkeye, üniversiteye ve programa bağlıdır, ama büyüklük sırası bellidir. Aşağıda, beş ülkede uluslararası öğrenciler için tipik **öğrenim ücretleri** yer alıyor; YourHEI’deki yayımlanmış ücretlerden hesaplanmıştır (Ekim 2026 verileri). Yaşam giderleri dahil değildir: bunlar için yazının sonuna bakın.' },
      { t: 'h2', id: 'how', text: 'Nasıl hesapladık' },
      {
        t: 'ul',
        items: [
          '**Medyan**, ortadaki ücrettir: programların yarısı daha ucuz, yarısı daha pahalıdır. Ortalamadan daha adildir, çünkü birkaç çok pahalı program onu bozmaz.',
          '**Aralık**, ücretlerin %80’inin nerede olduğunu gösterir: en ucuz %10 ve en pahalı %10 dışarıda bırakılır.',
          '**Yıllık ücret.** Kaynak tüm programın ücretini veriyorsa, bunu yıl olarak süreye böleriz.',
          '**Yalnızca ücreti bilinen** ve uluslararası öğrenciler için geçerli olan programlar. Diğerleri için elimizde ücret yok ve biz uydurmuyoruz.',
        ],
      },
      { t: 'h2', id: 'usa', text: 'ABD' },
      {
        t: 'ul',
        items: [
          '**Tipik bir kurum:** yılda yaklaşık 17.500 $ (ücreti yayımlanmış 3.083 kurumun medyanı, topluluk kolejleri dahil).',
          '**Aralık:** yılda 6.600 $ ile 47.500 $ arası.',
          '**Nasıl okunmalı.** Devlet üniversiteleri için veri tabanında eyalet dışı öğrenci ücreti yer alır; uluslararası öğrenciler de genellikle bunu öder. Özel üniversiteler herkesten aynı ücreti alır. Bu yalnızca öğrenim ücretidir; konaklama, kitaplar ve sigorta dahil değildir.',
          'Lisans programları pahalı kurumlarda daha yaygındır: kurumlar yerine programlar üzerinden hesaplanınca medyan daha yüksektir, yaklaşık 31.000 $.',
        ],
      },
      { t: 'p', text: 'ABD’deki kurumlar ve programlar: [ABD’de eğitim](/study/us).' },
      { t: 'h2', id: 'australia', text: 'Avustralya' },
      {
        t: 'ul',
        items: [
          '**Lisans:** yılda yaklaşık 40.400 A$ (aralık 24.200–57.100 A$), 3.300 program.',
          '**Yüksek lisans:** yılda yaklaşık 24.000 A$ (aralık 12.000–38.800 A$), 1.570 program.',
          'Kaynak, programın toplam maliyetini veren resmi CRICOS siciline dayanır; biz bunu süreye böleriz.',
        ],
      },
      { t: 'p', text: 'Avustralya’daki programlar: [Avustralya’da eğitim](/study/au).' },
      { t: 'h2', id: 'netherlands', text: 'Hollanda' },
      {
        t: 'ul',
        items: [
          '**Lisans:** yılda yaklaşık 16.900 € (aralık 11.800–24.500 €), 109 program.',
          '**Yüksek lisans:** yılda yaklaşık 22.900 € (aralık 19.600–26.000 €), 385 program.',
          'AEA dışından gelen öğrenciler için ücret, programların yaklaşık üçte biri için verilmiştir (1.474 programın 494’ü): diğerleri için kaynakta bu öğrencilere yönelik ücret yoktur. Onlar için üniversiteye sorun.',
        ],
      },
      { t: 'p', text: 'Hollanda’daki programlar: [Hollanda’da eğitim](/study/nl); nasıl ve ne zaman başvurulur: [Hollanda: Studielink ve son tarihler](/blog/netherlands-application-deadlines-studielink); bir burs: [NL Scholarship](/blog/nl-scholarship-netherlands-how-to-apply).' },
      { t: 'h2', id: 'finland', text: 'Finlandiya' },
      {
        t: 'ul',
        items: [
          '**Lisans:** yılda yaklaşık 10.000 € (aralık 9.500–12.000 €), 262 program.',
          '**Yüksek lisans:** yılda yaklaşık 12.000 € (aralık 10.000–18.000 €), 589 program.',
          'Fince veya İsveççe öğrenim ile doktora ücretsizdir ([ayrıntı](/blog/free-tuition-germany-czechia-finland)).',
        ],
      },
      { t: 'p', text: 'Finlandiya’daki programlar: [Finlandiya’da eğitim](/study/fi).' },
      { t: 'h2', id: 'sweden', text: 'İsveç' },
      {
        t: 'ul',
        items: [
          '**Lisans:** yılda yaklaşık 150.000 SEK (aralık 97.000–290.000 SEK), 101 program.',
          '**Yüksek lisans:** yılda yaklaşık 147.000 SEK (aralık 97.000–192.500 SEK), 894 program.',
          'Kaynak, programın toplam maliyetini veren resmi İsveç başvuru portalı universityadmissions.se’dir; biz bunu süreye böleriz. AB, AEA ve İsviçre’den gelen öğrenciler hiçbir şey ödemez: onlar için öğrenim ücretsizdir.',
        ],
      },
      { t: 'h2', id: 'germany', text: 'Peki Almanya ve Çekya?' },
      { t: 'p', text: 'Almanya’daki devlet üniversitelerinde öğrenim çoğu durumda ücretsizdir, Çekya’da ise Çekçe programlar ücretsizdir. Bu kurallar ve istisnaları ayrı bir yazıda anlatılıyor: [Almanya, Çekya ve Finlandiya’da öğrenim ücretsiz mi?](/blog/free-tuition-germany-czechia-finland).' },
      { t: 'h2', id: 'living', text: 'Öğrenim ücreti tüm maliyet değildir' },
      {
        t: 'ul',
        items: [
          'Öğrenci vizesi için yaşam giderlerini karşılayabileceğinizi kanıtlamanız gerekir: 14 ülke için tutarlar [Öğrenci vizesi için ne kadar para gösterilmeli](/blog/proof-of-funds-student-visa) yazısındadır.',
          'Gerçek giderler genellikle vize için istenen en düşük tutardan yüksektir, özellikle büyük şehirlerde.',
          'Ücretli öğrenimin maliyeti bursla azaltılabilir: [uluslararası öğrenciler için tam burslar](/blog/fully-funded-scholarships-for-international-students) ve [ulusal burslar veri tabanı](/scholarships).',
        ],
      },
      { t: 'note', text: 'Ücretler her yıl değişir, üniversitelerin de kendi koşulları ve indirimleri vardır. Başvurmadan önce ücreti programın resmi sayfasından kontrol edin: bağlantı YourHEI’deki her kurum sayfasında bulunur.' },
      { t: 'p', text: '[Katalogda](/catalog) ücretleri kendi para biriminizde gösterebilir, programları ülkeye, düzeye ve bütçeye göre süzebilirsiniz.' },
      {
        t: 'p',
        text: 'Veri kaynakları: [US College Scorecard](https://collegescorecard.ed.gov/data/); [CRICOS, Avustralya’da uluslararası öğrencilere yönelik programların sicili](https://cricos.education.gov.au/); [Study in NL](https://www.studyinnl.org/); [Studyinfo, Finlandiya](https://opintopolku.fi/konfo/en/); [universityadmissions.se, İsveç](https://www.universityadmissions.se/).',
      },
      { t: 'cta', href: '/catalog', text: 'Bütçeye göre program bul' },
      { t: 'cta', href: '/scholarships', text: 'Burslar' },
    ],
  },
};
