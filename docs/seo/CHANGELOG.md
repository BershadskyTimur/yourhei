# SEO: журнал правок

Каждая правка: дата, что изменено, какие адреса или шаблоны затронуты. Основание — [AUDIT.md](AUDIT.md) (аудит 9 ноября 2026), пункты плана из раздела 8.

## 9 ноября 2026, пункт 1: честные title и description страниц вузов

**Затронуто:** все страницы `/{язык}/institutions/{страна}/{slug}` (5 708 вузов). В поиске открыты только `ru` и `en`, на остальных языках страницы вузов `noindex`, как и раньше.

**Правило:** title обещает только то, что есть на странице.
- **Цена есть:** в title стоит учебный год, к которому относятся цены (`academic_year` программ: США — 2025/26, Европа — 2026/27–2027/28, Австралия — 2026). Не «поступление 2027».
- **Цены нет:** слов «стоимость» и «fees» в title нет, вместо них «программы и поступление», «Programmes & How to Apply».
- **Русское и оригинальное название различаются:** сначала пробуется «Русское (Оригинальное)». Если с ним title длиннее 60 символов, остаётся одно название.

**Шаблоны (`messages/*.json`, раздел `Seo`):**

| Ключ | ru | en |
|---|---|---|
| `institutionTitleFee` | `{name}: стоимость обучения {year}` | `{name}: Tuition Fees {year} & Admission` |
| `institutionTitleFeeShort` | `{name}: стоимость {year}` | `{name}: Fees {year}` |
| `institutionTitleProgrammes` | `{name}, {place}: программы и поступление` | `{name}, {place}: Programmes & How to Apply` |
| `institutionTitleProgrammesShort` | `{name}: программы и поступление` | `{name}: Programmes & How to Apply` |
| `institutionTitleProgrammesShortest` | `{name}: программы` | `{name}: Programmes` |

Из этих вариантов берётся первый, который укладывается в 60 символов. Порядок: с оригинальным названием, затем без него.

**Description** собирается из предложений по важности. Следующее предложение добавляется, только пока текст не длиннее 155 символов:
1. Цена с годом: «обучение для иностранцев — 61 000 $ в год (2025/26)». Если цены нет, вместо неё одно из двух:
   - число программ, уровни и «Стоимость уточняется»;
   - «обучение бесплатное», если бесплатны все программы.
2. Ближайший срок подачи, если он есть.
3. Число программ и уровни.
4. Языки обучения.
5. «Требования и официальный сайт — на странице», если в базе есть сайт.

Цифры берутся только из базы. Если цены нет, так и написано: «Стоимость уточняется» или «Fees not confirmed yet».

**Удалены ключи:** `institutionTitle`, `institutionTitleNoCountry`, `institutionTitleShort`, `institutionDescription`, `institutionDescriptionPrice`.

**Код:**
- `src/lib/seo/institution-meta.ts` — новый файл: варианты title и сборка description.
- `src/lib/seo/tuition-range.ts` — `tuitionYear`, `shortAcademicYear`.
- `generateMetadata` в `src/app/[locale]/institutions/[country]/[slug]/page.tsx`.
- Тесты: `institution-meta.test.ts`, `tuition-range.test.ts`.

**Примеры (локальная сборка):**

| Страница | Было | Стало |
|---|---|---|
| `/ru/institutions/tr/bilkent-university` | Bilkent…: стоимость обучения и программы (цен нет) | Билькентский университет, Ankara: программы и поступление |
| `/ru/institutions/fi/university-of-turku` | Университет Турку, Финляндия: стоимость обучения и программы | Университет Турку (University of Turku): стоимость 2027/28 |
| `/ru/institutions/us/harvard-university` | Гарвардский университет, США: стоимость обучения… | Гарвардский университет: стоимость обучения 2025/26 |
| `/en/institutions/us/dominican-school-of-philosophy-theology` | …: tuition fees and programmes (цен нет) | Dominican School of Philosophy & Theology: Programmes |
| `/en/institutions/au/sunshine-coast-grammar-school` | …: tuition fees and programmes | Sunshine Coast Grammar School: Tuition Fees 2026 & Admission |

## 9 ноября 2026, пункт 2: русские названия на проверку

- `docs/seo/name_ru_review.csv` — 208 вузов с показами в русском поиске (GSC, 3 месяца), у которых нет `names.ru`.
  - В 180 строках предложено русское название, в 28 предложено оставить латиницу (австралийские «Pty Ltd» и подобные, по-русски их не ищут).
  - Для каждой строки предложен ещё и русский город: сейчас на RU-страницах «Ankara», «Waltham».
- Источник: у 5 вузов есть Wikidata, но русских названий там нет. Все названия в списке — **предложения**. Столбец «уверенность»:
  - «устоявшееся» — название есть в русской Википедии или в прессе;
  - «транскрипция — проверить» — составлено по правилам транскрипции.
- **В базу ничего не записано.** После проверки владельцем (столбец «ОК») названия запишутся в `names.ru` и `city.ru`.
- Отдельное поле `name_ru` не добавлялось: `names.ru` уже есть и уже используется на RU-страницах.

## 9 ноября 2026, пункт 3: служебные страницы закрыты от поиска

- `noindex, follow`, свой title и canonical без параметров получили:
  - `/{язык}/login` (в том числе `?next=…`), `/register`, `/forgot-password`, `/reset-password`;
  - `/survey`, `/matches`, `/favorites`, `/compare`, `/profile`.
  - Код: `src/lib/seo/private-page.ts` и `generateMetadata` в каждой из этих страниц.
- До этого у них не было ни `noindex`, ни своего title: в индекс попадал адрес `/en/login?next=/institutions/us/helms-college` с title главной.
- `/cabinet`, `/admin`, `/shared/*` уже были `noindex`.
- **robots.txt не менялся** (отличие от плана в AUDIT.md). login, register, forgot-password и reset-password в нём и так не закрыты, поэтому Google увидит их `noindex`. survey, matches, favorites, compare и profile остаются закрытыми в robots.txt, чтобы роботы не тратили на них чтения базы. Этих адресов в Search Console нет.
