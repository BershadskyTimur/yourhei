# SEO-аудит yourhei.com — 9 ноября 2026

Только проверка, в коде ничего не менялось. Источники:
- выгрузка Search Console (веб-поиск, 3 месяца по 7.11.2026), лежит в `docs/seo/gsc-2026-11-09/`;
- код (`src/config/seo.ts`, `src/lib/seo/*`, страницы в `src/app/[locale]/…`);
- живой HTML сайта (запрос с User-Agent Googlebot, 9.11.2026): 85 страниц, топ-30 из таблицы ниже и страницы с «fees»;
- база Supabase (только чтение, короткие сводные запросы).

## 0. Коротко

1. **Сайт технически в порядке**: страницы отдаются сервером целиком (SSR), у каждой есть свой title, description, canonical и H1, есть hreflang и JSON-LD (вуз, FAQ, хлебные крошки, статья). Ошибок «404 / canonical на чужой адрес / noindex по ошибке» на проверенных страницах нет.
2. **Главная проблема CTR — title обещает то, чего на странице нет.** У 746 опубликованных вузов цен нет, а title всё равно говорит «стоимость обучения / tuition fees» (пример: Bilkent, Seattle School, William James College, Dominican School). И наоборот: где цена есть, её нет в title — только в description.
3. **Часть гипотез из задания данные не подтверждают** (подробности в разделах 4 и 1):
   - У австралийских школ (All Saints, Haileybury, Perth College, Sunshine Coast) стоимость **есть** и уже стоит в description. Они на позициях 50–90 не из-за пустой страницы, а потому что по запросу «all saints college fees» Google показывает сайты самих школ, а таких «All Saints» в Австралии с десяток.
   - Русские названия уже хранятся в базе (`names.ru`) — отдельное поле `name_ru` не нужно. Но заполнено мало: у 86 из 294 вузов с показами на RU.
   - Стипендий конкретных вузов на опубликованных страницах нет вообще (0). Шаблон «Fees {год}, Scholarships & Admission» был бы обещанием без содержания.
   - KA/ES/ZH «0 показов» — это решение владельца, а не ошибка: KA закрыт `noindex`, ES/ZH открыты только 7.11 (в выгрузку не успели) и только для не-вузовских страниц.
   - Большая часть «236 запросов в топ-10 с 1 кликом» — навигационные запросы («ecpi university», «thomas university»): человек ищет сам вуз, и первым стоит официальный сайт. Title тут поможет мало; заметный эффект дадут запросы «название + стоимость/fees».
4. **Мусор в индексе**: страница входа (`/en/login?next=…`) индексируется — у неё нет noindex, нет canonical и чужой title (как у главной). То же у `/register`, `/forgot-password`, `/reset-password`.
5. **Качество данных**: 18 опубликованных «вузов» с названием «n/a» / «NA», 63 названия-списка из нескольких школ (title до 190 символов), 174 вуза без английского названия, города на RU-страницах латиницей («Ankara», «Cleveland»).

---

## 1. Почему у KA / ES / ZH 0 показов

| Вопрос | Что на самом деле |
|---|---|
| Сколько языков | На сайте не 5, а **16** языков (`src/config/locales.ts`). |
| Кто открыт поисковикам | `src/config/seo.ts`: **ru, en** — все страницы; **es, zh, de, fr, pl** — все, кроме страниц вузов и списков вузов (решение владельца от 07.11.2026); **ka и ещё 8 языков — `noindex`**. |
| ES/ZH в sitemap | Да, с 7.11: по 309 адресов на каждый язык (главная, блог 25, дедлайны 48, study 218, страны 8, служебные). Страниц вузов на es/zh в sitemap нет (5 755 адресов есть только у ru и en). |
| KA в sitemap | Нет. На живом `/ka` и `/ka/blog`: `<meta name="robots" content="noindex, follow">`. |
| hreflang | Взаимный: на `/en`, `/ru`, `/es`, `/zh`, `/es/blog` одинаковый набор `ru, en, es, zh, de, fr, pl, x-default`. Коды правильные (ISO 639-1). `x-default` → `/en/…`. На страницах вузов набор `ru, en, x-default` — тоже взаимный. |
| canonical | У каждой языковой версии — на себя (`/es/blog` → `/es/blog`). Правильно. |
| Переведён ли текст | Интерфейс и блог на es/zh переведены (статьи — машинный перевод с пометкой). Страница вуза на es: title испанский («Universidad Duke: programas, precios y plazos»), но названия программ, город и т. п. — на английском; поэтому владелец и оставил их `noindex`. |
| Почему ES получает 0 | Данные GSC — по 7.11, а ES открыт 7.11. Плюс у Латинской Америки спрос — на страницы вузов (их ~1 500 показов на EN), а ES-версии вузов закрыты. |

**Вывод:** технической ошибки нет. Чтобы ES/ZH получали показы, нужно либо подождать 2–4 недели (блог, дедлайны, study), либо **открыть ES для страниц вузов** — это решение владельца (вопрос 1 в конце).

## 2. Мусор в индексе и дубли главной

| Адрес | Что сейчас | Что не так |
|---|---|---|
| `/en/login?next=/institutions/us/helms-college` (3 показа) | 200, **нет robots-noindex, нет canonical**, title = title главной | Индексируется; дубль title главной. |
| `/…/register`, `/…/forgot-password`, `/…/reset-password` | Нет `generateMetadata` вообще → то же самое | То же. |
| `/…/survey`, `/matches`, `/favorites`, `/compare`, `/profile`, `/shared`, `/cabinet`, `/admin` | Закрыты в `robots.txt` | Нормально, но закрытие в robots.txt не убирает адрес из индекса, если на него есть ссылки. Надёжнее — `noindex` в самой странице и **не** закрывать в robots.txt (иначе Google не увидит noindex). |
| Фильтры с параметрами (`/catalog?…`) | canonical всегда без параметров | В GSC таких адресов нет — проблем нет. |
| `/` | **307** (временный) → `/en` (или язык браузера) | Google показывает «/» как отдельный адрес (39 показов). Не дубль (200 у него нет), но временный редирект мешает склеить сигналы. |
| `/en`, `/ru` | 200, canonical на себя, title разный | Это разные языковые версии, не дубли. Нормально. |
| `/about` (без языка) | редирект → `/en/about` | Так же, как `/`. |

**Предложение:** `noindex, follow` для login/register/forgot/reset/survey/matches/favorites/compare/profile/shared/cabinet/admin; вынуть их из `PRIVATE` в robots.txt (кроме `/api/`, `/auth/`). Для `/` — оставить определение языка, но проверить, можно ли отдавать 308 вместо 307 для Googlebot без `Accept-Language` (решение принимаем после правки 1–3; приоритет низкий).

## 3. Как собираются title / description / H1

Всё строится через `seoMetadata()` (`src/lib/seo/metadata.ts`), тексты — в `messages/<язык>.json`, раздел `Seo`. Длина title подгоняется `fitTitle()` до 60 символов, description — `trimDescription()` до 160.

| Тип | Title (ru / en) | Description | H1 |
|---|---|---|---|
| Вуз | «{name}, {страна}: стоимость обучения и программы» → короче «{name}: стоимость обучения и программы» → «{name}: стоимость обучения». EN: «{name}, {country}: tuition fees and programmes». **Слова «стоимость/fees» есть всегда, даже без цен.** | С ценой: «{name} ({город}, {страна}): стоимость обучения — {диапазон} в год. Программ: N; уровни: …». Без цены: «…: программы и стоимость обучения. Программ: N…». Года данных нет, дедлайна нет, языка обучения нет. | Название вуза. Ниже серым — оригинальное, если отличается. |
| Блог | Ручной `seoTitle` или заголовок статьи | Ручное, 90–170 символов | Заголовок статьи |
| Дедлайны (месяц) | «Сроки подачи документов {в стране}: {месяц}» | С числом сроков, вузов и первой датой — хорошее | = title |
| Дедлайны (страна) | «Application deadlines: Czechia» — **30 символов, мало** | С числом дат и вузов | = title |
| Study (страна + направление) | «Study {field} in {country}» (иногда с числом программ) | «Programmes: 244. Institutions: 27. The data comes from…» — **сухо, без цен и сроков** | = title |
| Главная | «YourHEI — подбор вуза, колледжа или школы» | Карта и подборка… | «Найдите, где учиться» |

**Русское название вуза на RU-страницах** используется, если оно есть в `names.ru` (Гарвард, Дьюк, Турку, Беннингтонский колледж). Если нет — показывается английское (ECPI, Thomas University, Bentley). Город — всегда из `city.ru`, а он почти везде пустой → «Ankara», «Cleveland», «Middlesex County» (у Гарварда!), «Budapest District XI».

## 4. Какие данные реально есть в базе

Опубликовано 5 708 заведений (ещё 8 687 в черновиках — на сайте не показываются).

| Данные | Есть у | Комментарий |
|---|---|---|
| Хотя бы одна программа | 5 705 | |
| Стоимость (у программ) | **4 959** (87%) | Валюта и период (год / семестр / весь курс). Сайт пересчитывает в «в год». |
| Год данных (`academic_year`) | у всех программ | США — 2025/2026 (IPEDS), Европа — 2026/27–2027/28, Австралия — 2026. **«Поступление 2027» с ценами 2025/26 в title писать нельзя**, только «стоимость 2025/26». |
| Дедлайны | **308** (5%) | В основном NL, FI, SE, DE, CZ. У США и Австралии дедлайнов нет. |
| Стипендии конкретного вуза | **0** | Есть только общие (страница `/scholarships`, данные `data/scholarships/national.json`). |
| Официальный сайт | 4 839 (85%) | Кнопка «Официальный сайт» на странице уже есть. |
| Русское название (`names.ru`) | **467** (8%) | Из 294 вузов с показами на RU — у **86**. |
| Wikidata | 513 | |
| Дата проверки | у всех | На странице уже есть «Данные проверены 7 октября 2026 г.» |

**Страницы из запросов с «fees»** (все — Австралия, данные есть):

| Страница | Цена на сайте | Позиция | Почему низко |
|---|---|---|---|
| all-saints-anglican-school-limited | A$29 480–30 130 / год (2026) | 52 | 629 показов по «all saints … fees» — запросы про **другие** All Saints (Perth, Bathurst, Catholic). В названии «Limited». |
| all-saints-college (Bull Creek, Perth) | A$26 393–39 375 | 78 | Конкурент — сайт школы и сайты-агрегаторы школ Австралии. |
| haileybury-college | A$7 038–29 286 | 59 | То же. Нижняя граница A$7 038 подозрительно мала — проверить данные. |
| perth-college | A$32 448–45 954 | 68 | То же. |
| sunshine-coast-grammar-school | A$32 017–43 450 | **7.5** по «… fees 2026» | Здесь title с ценой и годом может дать клики. |

Вывод: для «fees» помогут **цена и год прямо в title** и честное название (без «Limited»), а не новые данные.

## 5. Дубли вузов и обрезанные slug

- **Суффикс страны в slug** (`-se`, `-de`, `-nl`, `-gb`, `-fi`): 460 опубликованных. Почти всегда это **не дубль**: адрес без суффикса занят черновиком из другого источника. Настоящий дубль «оба опубликованы» не найден; один случай «опубликован с суффиксом, черновик без»: `cz/tomas-bata-university-in-zlin-cz` (246 программ) и черновик `tomas-bata-university-in-zlin` (0 программ) — ничего делать не нужно.
- **Одинаковые названия внутри страны** (35 групп). Часть — разные заведения с одним именем в разных штатах (Bethel University, Lincoln University — это нормально). Подозрительные — нужно смотреть руками:
  - AU: `holmes-institute` ×3, `scotch-college` ×3, `victoria-university` и `victoria-university-02475d` (один сайт vu.edu.au), `presbyterian-ladies-college` ×2, `trinity-grammar-school` ×2, `st-aloysius-college` ×2, `lotus-college` ×2.
  - US: `spartan-college-of-aeronautics-and-technology` ×3 (один сайт), `laurel-technical-institute` ×2, `southern-technical-college` ×2, `cambridge-college-of-healthcare-technology` ×2, `ata-college` ×3 — скорее кампусы одной сети с одинаковым названием.
- **Мусорные названия**: **18** опубликованных с названием «n/a» / «NA» (AU, slug `n-a-03756j` и т. п.). Это кандидаты на снятие с публикации.
- **Названия-списки**: 63 заведения, где в названии через запятую перечислены несколько школ (пример: «Hills Adventist College, Hurstville Adventist School, Macarthur…» — title 190 символов). Сайт режет только по «;», а не по «,».
- **Обрезанные slug**: 103 slug ровно 60 символов (обрезка при импорте), например `hills-adventist-college-hurstville-adventist-school-macarthu`, `hochschule-fur-technik-und-wirtschaft-dresden-university-of--de` (двойной дефис). Менять их **не нужно** — адреса уже в индексе, а длина slug на позиции почти не влияет.
- **Без английского названия**: 174 (в основном DE и NL с суффиксом) — показывается оригинальное, это нормально.

## 6. Структурированные данные, ссылки, рендер, скорость

- **JSON-LD** (проверено на 85 страницах, все валидный JSON):
  - вуз: `CollegeOrUniversity` или `EducationalOrganization` (name, alternateName = оригинальное название, url = официальный сайт, address, foundingDate, sameAs = Wikidata), `FAQPage` (только вопросы, на которые есть ответ), `BreadcrumbList`;
  - блог: `Article` (дата публикации и изменения) + `BreadcrumbList`;
  - дедлайны и study: `BreadcrumbList`; главная: `Organization` + `WebSite`.
  - Отзывов/рейтингов (aggregateRating) нет — правильно.
  - Чего не хватает: на RU-странице `name` = русское название, а `alternateName` = оригинал — так и надо; но `sameAs` указывает только на Wikidata, а официальный сайт стоит в `url`. Это верно по schema.org — менять не нужно. Можно добавить `sameAs` на Википедию, где есть Wikidata. Хлебная крошка вуза: «YourHEI → страна (study) → вуз» — в ней нет списка вузов страны (`/institutions/<страна>`).
- **Рендер**: всё в HTML с сервера (SSR + кэш на сутки), H1 и тексты видны без JavaScript. Ок.
- **Перелинковка**:
  - вуз → направления (study), список вузов страны, гид по стране. **Нет**: ссылок на дедлайны страны, на статьи блога, блока «похожие вузы».
  - блог → общие страницы (`/catalog`, `/checklist`, `/scholarships`, `/deadlines/<страна>`) и внизу статьи — `/study/<страна>` и `/institutions/<страна>`. **Нет ссылок на конкретные вузы** (например, из Stipendium Hungaricum — на BME, Corvinus; из Finland Studyinfo — на Турку, Оулу, Metropolia).
  - дедлайны → вузы есть.
- **Скорость** (замер 9.11, телефонный User-Agent, тёплый кэш): ответ сервера 0.4–1.4 с, страница целиком 0.7–2.6 с. HTML страниц вузов тяжёлый: 120–455 КБ (все программы в одном HTML). PageSpeed Insights сегодня не ответил (дневная квота API исчерпана); последний полевой замер (19.10): LCP 0.4–0.8 с, CLS 0. Отдельные «холодные» страницы — 4–10 с при первом заходе (PROGRESS.md). Core Web Vitals в Search Console владелец может посмотреть в отчёте «Основные интернет-показатели».

## 7. Топ-30 страниц: позиции 1–15, больше всего показов

Цены и сроки — из базы и с живой страницы (ничего не придумано). Длины посчитаны скриптом. Русские названия, помеченные «на проверку», войдут в `docs/seo/name_ru_review.csv` на шаге 2.

| # | Страница | Показы / поз. | Сейчас: title (длина) | Сейчас: description (длина) | Предлагаю: title (длина) | Предлагаю: description (длина) | Примечание |
|---|---|---|---|---|---|---|---|
| 1 | `/ru/blog/stipendium-hungaricum-how-to-apply` | 73 / 8.85 | Stipendium Hungaricum: как получить стипендию Венгрии (53) | Как получить Stipendium Hungaricum: шаги подачи, срок (в наборе 2026/2027 — 15 января), номинация и экзамены. По официальным страницам программы. (145) | Stipendium Hungaricum: как подать заявку — шаги и сроки (55) | без изменений | меняем только порядок слов под запрос «как подать» |
| 2 | `/ru/institutions/tr/bilkent-university` | 63 / 13.78 | Билькентский университет: стоимость обучения и программы (56) | Билькентский университет (Ankara, Турция): программы и стоимость обучения. Программ: 24; уровни: Бакалавриат. (109) | Билькентский университет (Bilkent), Анкара: программы (53) | Билькентский университет (Анкара, Турция): 24 программы бакалавриата на английском. Стоимость уточняется — требования и официальный сайт на странице. (149) | цен в базе нет → убрать «стоимость» из title |
| 3 | `/ru/institutions/us/the-seattle-school-of-theology-psychology` | 61 / 6.36 | The Seattle School of Theology & Psychology: стоимость обучения (63) | The Seattle School of Theology & Psychology (Seattle, США): программы и стоимость обучения. Программ: 3; уровни: Магистратура. (126) | The Seattle School of Theology & Psychology: магистратура (57) | The Seattle School of Theology & Psychology (Сиэтл, США): 3 магистерские программы. Стоимость уточняется; требования и официальный сайт — на странице. (150) | цен нет → без «стоимости» |
| 4 | `/ru/institutions/us/delta-state-university` | 49 / 8.14 | Delta State University, США: стоимость обучения и программы (59) | Delta State University (Cleveland, США): стоимость обучения — 8 605 $ в год. Программ: 40; уровни: Бакалавриат, Магистратура. (125) | Delta State University: стоимость 2025/26 — 8 605 $ (51) | Delta State University (Кливленд, Миссисипи, США): обучение для иностранцев — 8 605 $ в год (2025/26). 40 программ бакалавриата и магистратуры. (143) | год данных и цифра в title; город по-русски |
| 5 | `/ru/institutions/us/ecpi-university` | 46 / 8.61 | ECPI University, США: стоимость обучения и программы (52) | ECPI University (Virginia Beach, США): стоимость обучения — 18 484 $ в год. Программ: 74; уровни: Колледж, Бакалавриат, Магистратура. (133) | ECPI University: стоимость обучения 2025/26 — 18 484 $ (54) | ECPI University (Вирджиния-Бич, США): обучение для иностранцев — 18 484 $ в год (2025/26). 74 программы: колледж, бакалавриат, магистратура. (140) | запрос «ecpi university» навигационный: №1 у официального сайта |
| 6 | `/ru/institutions/us/york-technical-college` | 40 / 8.2 | York Technical College, США: стоимость обучения и программы (59) | York Technical College (Rock Hill, США): стоимость обучения — 13 340 $ в год. Программ: 25; уровни: Колледж. (108) | York Technical College: стоимость 2025/26 — 13 340 $ (52) | York Technical College (Рок-Хилл, Южная Каролина): обучение для иностранцев — 13 340 $ в год (2025/26). 25 программ колледжа, официальный сайт. (143) |  |
| 7 | `/` | 39 / 12.92 | YourHEI — find your school, college or university (49) | A map and a personal match of universities, colleges and schools in Europe, Asia, the Americas, Oceania, the Caucasus and Central Asia. (135) | (редирект 307 → /en; правка в разделе 2) | без изменений | временный редирект: Google держит «/» как отдельный адрес |
| 8 | `/en/institutions/us/dominican-school-of-philosophy-theology` | 33 / 7.85 | Dominican School of Philosophy & Theology: tuition fees (55) | Dominican School of Philosophy & Theology (Berkeley, United States): programmes and tuition. Programmes: 2; levels: Master's degree. (132) | Dominican School of Philosophy & Theology, Berkeley (51) | Dominican School of Philosophy & Theology in Berkeley, California: 2 master's programmes. Fees not confirmed yet; requirements and official website inside. (155) | цен нет → title не должен обещать «tuition fees» |
| 9 | `/ru/institutions/fi/university-of-turku` | 33 / 10.64 | Университет Турку, Финляндия: стоимость обучения и программы (60) | Университет Турку (Turku, Финляндия): стоимость обучения — 1 500 € – 12 000 € в год. Программ: 41; уровни: Бакалавриат, Магистратура, PhD (докторантура). (153) | Университет Турку: стоимость 2027/28 и сроки подачи (51) | Университет Турку (Турку, Финляндия): 1 500–12 000 € в год (2027/28), ближайший срок подачи — 21 января 2027 г. 41 программа на английском языке. (145) | есть и цены, и дедлайн |
| 10 | `/en/deadlines/nl/2027-03` | 31 / 7.68 | Application deadlines in the Netherlands: March 2027 (52) | When to apply in the Netherlands in March 2027: 22 deadlines at 11 institutions, the first on March 1, 2027. Dates from official programme pages. (145) | Netherlands application deadlines, March 2027: 22 dates (55) | без изменений | description уже хороший |
| 11 | `/ru` | 24 / 12.42 | YourHEI — подбор вуза, колледжа или школы (41) | Карта и подборка вузов, колледжей и школ Европы, Азии, Америки, Океании, Кавказа и Центральной Азии. (100) | YourHEI — вузы за границей: цены, сроки подачи, стипендии (57) | Карта и подбор вузов, колледжей и школ за границей: стоимость обучения для иностранцев, сроки подачи и стипендии — по официальным источникам. (141) |  |
| 12 | `/ru/institutions/us/thomas-university` | 23 / 9.3 | Thomas University, США: стоимость обучения и программы (54) | Thomas University (Thomasville, США): стоимость обучения — 11 640 $ в год. Программ: 35; уровни: Колледж, Бакалавриат, Магистратура. (132) | Thomas University: стоимость обучения 2025/26 — 11 640 $ (56) | Thomas University (Томасвилл, Джорджия, США): обучение для иностранцев — 11 640 $ в год (2025/26). 35 программ: колледж, бакалавриат, магистратура. (147) |  |
| 13 | `/ru/institutions/de/hwr-berlin-berlin-school-of-economics-and-law-de` | 22 / 7.09 | HWR Berlin (Berlin School of Economics and Law): стоимость обучения (67) | HWR Berlin (Berlin School of Economics and Law) (Berlin, Германия): стоимость обучения — 6 800 € – 19 900 € в год. (114) | HWR Berlin: стоимость обучения и сроки подачи 2027 (50) | Берлинская школа экономики и права (HWR Berlin): 6 800–19 900 € в год (2027/28), ближайший срок — 15 ноября 2026 г. 18 программ на англ. и нем. (143) | русское название — на проверку |
| 14 | `/en/deadlines/nl/2027-09` | 21 / 7.29 | Application deadlines in the Netherlands: September 2027 (56) | When to apply in the Netherlands in September 2027: 1 deadline at 1 institution, the first on September 1, 2027. Dates from official programme pages. (149) | (оставить; кандидат на noindex: 1 срок в 1 вузе) | без изменений | тонкая страница |
| 15 | `/ru/institutions/us/st-john-s-university-new-york` | 21 / 7.71 | St. John's University-New York: стоимость обучения (50) | St. John's University-New York (Queens, США): стоимость обучения — 53 020 $ в год. Программ: 49; уровни: Колледж, Бакалавриат, Магистратура. (140) | St. John's University (Нью-Йорк): стоимость 2025/26 (51) | Университет Святого Иоанна (St. John's, Квинс, Нью-Йорк): обучение для иностранцев — 53 020 $ в год (2025/26). 49 программ всех уровней, официальный сайт. (154) | русское название — на проверку |
| 16 | `/en/deadlines/nl/2027-01` | 21 / 7.95 | Application deadlines in the Netherlands: January 2027 (54) | When to apply in the Netherlands in January 2027: 34 deadlines at 16 institutions, the first on January 1, 2027. Dates from official programme pages. (149) | Netherlands application deadlines, January 2027: 34 dates (57) | без изменений |  |
| 17 | `/ru/institutions/au/australasia-language-college` | 21 / 7.95 | Australasia Language College: стоимость обучения и программы (60) | Australasia Language College (Burwood, Австралия): стоимость обучения — 10 000 A$ – 14 000 A$ в год. Программ: 6; уровни: Колледж, Языковые курсы. (146) | Australasia Language College: стоимость обучения 2026 (53) | Australasia Language College (Бервуд, Сидней): 10 000–14 000 A$ в год (2026). 6 программ: колледж и курсы английского. Официальный сайт и требования. (149) |  |
| 18 | `/ru/blog/erasmus-mundus-joint-masters-how-to-apply` | 20 / 6.4 | Erasmus Mundus: как поступить в магистратуру со стипендией (58) | Erasmus Mundus Joint Masters: кто может подать заявку, как подавать прямо в программу и что покрывает стипендия. Приём обычно идёт с октября по январь. (151) | (оставить: CTR 10%) | без изменений |  |
| 19 | `/en/institutions/au/sunshine-coast-grammar-school` | 19 / 10 | Sunshine Coast Grammar School: tuition fees and programmes (58) | Sunshine Coast Grammar School (Forest Glen, Australia) tuition: A$32,017 – A$43,450 per year. Programmes: 3; levels: School. (124) | Sunshine Coast Grammar School Fees 2026: A$32,017–43,450 (56) | Sunshine Coast Grammar School, Forest Glen QLD: international student fees A$32,017–43,450 a year (2026), 3 school programmes. Official website inside. (151) | запрос «sunshine coast grammar school fees 2026» на позиции 7.5 |
| 20 | `/ru/institutions/us/william-james-college` | 19 / 11.89 | William James College, США: стоимость обучения и программы (58) | William James College (Newton, США): программы и стоимость обучения. Программ: 10; уровни: Бакалавриат, Магистратура. (117) | William James College (Ньютон, США): программы (46) | William James College (Ньютон, Массачусетс, США): 10 программ бакалавриата и магистратуры. Стоимость уточняется; требования и официальный сайт. (143) | цен нет |
| 21 | `/about` | 18 / 2.89 | About YourHEI: how we help you choose where to study (52) | YourHEI helps applicants and their families choose where to study: an interactive map of universities, colleges and schools, a short survey about your goals,… (158) | (редирект на /en/about; правка не нужна) | без изменений |  |
| 22 | `/ru/institutions/hu/budapest-university-of-technology-and-economics` | 17 / 9.24 | Будапештский университет технологии и экономики: стоимость обучения (67) | Будапештский университет технологии и экономики (Budapest District XI, Венгрия): стоимость обучения — 4 400 € – 8 000 € в год. (126) | Будапештский технологический (BME): стоимость 2026/27 (53) | Будапештский университет технологии и экономики (BME): 4 400–8 000 € в год (2026/27), 28 программ на английском. Требования и официальный сайт. (143) | короткая форма названия — на проверку |
| 23 | `/en/institutions/au/hills-adventist-college-hurstville-adventist-school-macarthu` | 16 / 9.81 | Hills Adventist College, Hurstville Adventist School, Macarthur Adventist College, Mountain View Adventist College, Wahroonga Adventist School, Sydney Adventist School - Auburn: tuition fees (190) | Hills Adventist College, Hurstville Adventist School, Macarthur Adventist College, Mountain View Adventist College, Wahroonga Adventist School, Sydney… (151) | Hills Adventist College & Sydney campuses: Fees 2026 (52) | Sydney Adventist schools (Hills, Hurstville, Macarthur and others): international fees A$16,739–20,358 a year (2026), 3 programmes. Official website. (149) | в базе название = список 6 школ; сейчас title 190 символов |
| 24 | `/ru/blog/finland-how-to-apply-studyinfo` | 16 / 10.19 | Поступление в Финляндию через Studyinfo: сроки и сбор (53) | Как поступить в финский вуз через Studyinfo: совместный набор в январе, набор на январский старт, требования и сбор 100 евро для студентов вне ЕС. (146) | (оставить) | без изменений |  |
| 25 | `/ru/institutions/se/university-of-skovde-se` | 15 / 6.47 | University of Skövde, Швеция: стоимость обучения и программы (60) | University of Skövde (Skövde, Швеция): стоимость обучения — 110 000 SEK – 155 000 SEK в год. Программ: 25; уровни: Бакалавриат, Магистратура. (141) | Университет Шёвде (Skövde): стоимость и сроки 2027 (50) | Университет Шёвде (Шёвде, Швеция): 110 000–155 000 SEK в год (2027/28), ближайший срок подачи — 15 января 2027 г. 25 программ на английском языке. (146) | русское название — на проверку |
| 26 | `/en/deadlines/cz` | 15 / 9.47 | Application deadlines: Czechia (30) | Upcoming deadlines at institutions in Czechia: 49 dates at 12 institutions. Open an institution to see its programmes and the link to apply. (140) | Czechia application deadlines: 49 dates at 12 universities (58) | без изменений | title сейчас 30 символов |
| 27 | `/ru/institutions/us/bennington-college` | 14 / 9.36 | Беннингтонский колледж, США: стоимость обучения и программы (59) | Беннингтонский колледж (Bennington, США): стоимость обучения — 66 262 $ в год. Программ: 72; уровни: Колледж, Бакалавриат, Магистратура. (136) | Беннингтонский колледж: стоимость обучения 2025/26 (50) | Беннингтонский колледж (Bennington College, Вермонт, США): обучение для иностранцев — 66 262 $ в год (2025/26). 72 программы, официальный сайт. (143) | запрос «беннингтонский колледж» на позиции 10.7 |
| 28 | `/en/institutions/au/australian-scholar-s-college` | 14 / 10 | Australian Scholar's College: tuition fees and programmes (57) | Australian Scholar's College (Melbourne, Australia) tuition: A$15,000 – A$16,667 per year. Programmes: 4; levels: College, Master's degree. (139) | Australian Scholar's College, Melbourne: Fees 2026 (50) | Australian Scholar's College, Melbourne: international student fees A$15,000–16,667 a year (2026). 4 programmes: college and master's. How to apply. (148) | официального сайта в базе нет |
| 29 | `/ru/institutions/us/bentley-university` | 13 / 6.38 | Bentley University, США: стоимость обучения и программы (55) | Bentley University (Waltham, США): стоимость обучения — 61 000 $ в год. Программ: 80; уровни: Бакалавриат, Магистратура. (120) | Университет Бентли (Bentley): стоимость 2025/26 (47) | Университет Бентли (Bentley University, Уолтем, США): обучение для иностранцев — 61 000 $ в год (2025/26). 80 программ бакалавриата и магистратуры. (147) | русское название — на проверку |
| 30 | `/ru/institutions/us/southern-university-and-a-m-college` | 13 / 12.77 | Southern University and A & M College: стоимость обучения (57) | Southern University and A & M College (Baton Rouge, США): стоимость обучения — 17 272 $ в год. Программ: 40; уровни: Бакалавриат, Магистратура. (143) | Southern University A&M: стоимость обучения 2025/26 (51) | Southern University and A&M College (Батон-Руж, Луизиана): обучение для иностранцев — 17 272 $ в год (2025/26). 40 программ бакалавриата и магистратуры. (152) |  |

Общие правила для новых шаблонов (вывод из таблицы):
- **есть цена** → в title цена или хотя бы «стоимость {год данных}»; год — из `academic_year` (2025/26 для США), не «поступление 2027»;
- **нет цены** → в title нет слов «стоимость / fees», вместо них «программы», «магистратура», город;
- description: цена с годом, ближайший дедлайн (если есть), язык обучения, город по-русски на RU;
- длинное название → короткая форма (своё поле или первая часть до запятой), иначе title выходит за 60 символов.

---

## 8. План по приоритету

Эффект — ожидаемое влияние на клики за 4–6 недель; сложность — объём работы. Порядок = эффект × простота.

| # | Что | Эффект | Сложность | Что затронет |
|---|---|---|---|---|
| 1 | **Честные title вузов**: без цены — не обещать «стоимость/fees»; с ценой — цена и год данных в title (RU и EN). Description: цена + год, ближайший дедлайн, язык, город. | Высокий (5 755 страниц ×2 языка, 87% показов сайта) | Средняя: `messages/*.json` (раздел `Seo`), `generateMetadata` страницы вуза, тесты | `/{ru,en}/institutions/*/*` |
| 2 | **Русские названия и города** для вузов с RU-показами: дописать `names.ru` (поле уже есть) и `city.ru`, список на проверку → `docs/seo/name_ru_review.csv` (сначала 208 вузов из GSC без `names.ru`). Без вашего ОК в базу не пишу. | Высокий для RU (там все клики) | Средняя: список готовлю я, проверяете вы | RU-страницы вузов |
| 3 | **noindex для служебных страниц** (login, register, forgot/reset-password, survey, matches, favorites, compare, profile, shared, cabinet, admin) + убрать их из запрета в robots.txt, чтобы Google увидел noindex. | Средний (чистота индекса) | Низкая | эти шаблоны, `src/app/robots.ts` |
| 4 | **Короткие названия** для 63 «названий-списков» и снятие с публикации 18 «n/a» (список на ваше ОК). | Средний | Низкая–средняя | AU-страницы |
| 5 | **Перелинковка**: вуз → дедлайны страны и 3–5 статей блога о стране; блок «Похожие вузы в стране» (по направлениям, с ценой); статьи (stipendium-hungaricum, erasmus-mundus, netherlands-studielink, germany-uni-assist, finland-studyinfo) → конкретные вузы и месяцы дедлайнов; в хлебные крошки вуза добавить список вузов страны. | Средний (помогает страницам на 11–25) | Средняя | страница вуза, 5 статей, `breadcrumbList` |
| 6 | **Блок-ответ вверху страницы вуза**: стоимость (год, источник), ближайший дедлайн, кнопка «Официальный сайт», «данные проверены: дата»; если цены нет — «стоимость уточняется». Большая часть данных уже есть ниже на странице — нужно поднять и собрать в одно место. | Средний (поведение, сниппеты) | Средняя (UI — во всех темах и 16 языках) | страница вуза |
| 7 | **Study и дедлайны**: description study с ценами (мин–макс по направлению) и ближайшим сроком; title страны дедлайнов длиннее («Czechia application deadlines: 49 dates at 12 universities»). | Средний для EN (study: 266 показов, позиция 58) | Низкая | 2 шаблона |
| 8 | **Блог**: ответ в 2–3 предложениях в начале, даты и суммы таблицами, дата обновления (уже показывается, если отличается от даты публикации). EN без RU и наоборот — **таких нет**: у всех 25 статей есть обе версии (тип `Article` требует ru и en). Без перевода на другие языки — одна статья (`how-much-does-it-cost-to-study-abroad-tuition-by-country`). | Низкий–средний | Средняя (25 статей × 2 языка) | `src/content/blog/*` |
| 9 | **Список кандидатов на noindex** (не применяю без ОК): 18 «n/a»; 86 вузов с 1 программой без цены и дедлайна; 60 без цены, дедлайна и сайта; месяцы дедлайнов с 1 датой (`/deadlines/nl/2027-09`). | Низкий (чистота) | Низкая | список в отдельном файле |
| 10 | **Открыть ES для страниц вузов** (Латинская Америка: ~1 500 показов на EN-страницы) — только после пункта 1 и вашего решения. | Потенциально высокий для ES | Низкая в коде, но решение ваше | `src/config/seo.ts` |
| 11 | `/` и `/about`: 308 вместо 307 для запроса без языка. | Низкий | Низкая | `src/proxy.ts` |

Schema.org (пункт 4 из задания) почти готова: менять нужно только `alternateName` (добавить русское название на EN-странице и английское на RU) и хлебные крошки — это входит в пункты 2 и 5.

После всех правок: сборка, тесты, lint; по 3 страницы каждого типа на RU и EN — title, description, canonical, hreflang, JSON-LD; запись в `docs/seo/CHANGELOG.md`; один деплой (каждый деплой сбрасывает кэш и тратит трафик базы).

## 9. Вопросы к владельцу

1. **ES для страниц вузов**: открываем (пункт 10) или пока оставляем `noindex`, как вы решили 7.11?
2. **KA**: оставляем `noindex` (перевод не проверен человеком) — верно?
3. **EN-шаблон**: «Fees {год}, Scholarships & Admission» без стипендий у вузов будет неправдой. Предлагаю «{Name}: Fees 2025/26 & Admission» (с ценой) и «{Name}, {City}: Programmes & How to Apply» (без цены). Согласны?
4. **Год в title**: пишем год данных («стоимость 2025/26»), а не «поступление 2027» — согласны?
5. **«n/a» и названия-списки**: снять 18 «n/a» с публикации и сократить 63 названия — делать?
