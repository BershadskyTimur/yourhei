# YourHEI — сбор данных о заведениях

Инструкция для сессий Claude Code, в которых собираются черновики карточек. Черновики потом импортируются в админку и проверяются владельцем. Использовать после этапа 4 из `SPEC.md` (когда есть импорт и очередь проверки).

## Как запускать

Пример запроса владельца:

> Прочитай DATA_COLLECTION.md и собери черновики по 5 вузам Грузии: [список или «самые крупные государственные»].

Размер партии: 5–10 заведений за сессию, чтобы сохранить качество. Данные по стране (раздел 13 SPEC.md) — отдельной сессией: «собери данные страны Грузия».

## Правила

1. **Ничего не выдумывать.** Если значение не найдено — `null` и пояснение в `notes_for_reviewer`. Лучше пусто, чем неверно.
2. **Источники по приоритету:**
   1. официальный сайт заведения (страницы поступления, стоимости, программ);
   2. официальные государственные источники (министерство образования, визовые порталы, системы подачи);
   3. агрегаторы и рейтинги — только чтобы найти официальную ссылку или для позиции в рейтинге, не как источник цен и требований.
3. **Каждое значение — с источником:** ссылка, дата обращения, уверенность (`high` — прямо указано на официальной странице; `medium` — косвенно или из официального, но старого документа; `low` — неофициальный источник или догадка по контексту).
4. **Стоимость** — как указано: сумма, валюта, период (`year | semester | credit | total`), для кого (`domestic | international | eu | all`). Не пересчитывать валюты.
5. **Учебный год**, к которому относятся данные, указывать всегда (`academic_year`).
6. **Описания** — своими словами, коротко (2–3 предложения), без копирования текста с сайтов. Рейтинги — только позиция, год, ссылка.
7. **Языки:** названия в оригинале + `en` + `ru`; описание на `ru` и `en`. Остальные языки сайта заполняются позже.
8. **Этика сбора:** не обходить логины, платный доступ и капчи; соблюдать robots.txt; не делать массовых запросов к одному сайту.
9. **Коды:** страна — ISO 3166-1 alpha-2; язык — ISO 639-1; валюта — ISO 4217; направление — ISCED-F 2013 (4 цифры, детальный уровень, если можно определить; иначе 3 или 2 цифры); уровень — из списка ниже; тип — код из справочника типов.
10. **После сбора** запусти проверку файлов по схеме (скрипт из этапа 4) и исправь ошибки.
11. **В конце сессии** — короткий отчёт владельцу: что собрано, чего не нашлось, в чём есть сомнения и что проверить в первую очередь.

## Куда сохранять

- Заведения: `data/drafts/institutions/{country}/{slug}.json` (один файл — одно заведение).
- Страны: `data/drafts/countries/{country}.json`.

## Допустимые значения

- `type`: `university | college | school | language_school | foundation | vocational`
- `level`: `school | college | foundation | bachelor | master | phd | language_course`
- `format`: `on_campus | online | blended`
- `ownership`: `public | private`
- `confidence`: `high | medium | low`

## Формат черновика заведения

Пример со значениями-заглушками (`<…>`), реальные данные брать только из источников:

```json
{
  "schema_version": 1,
  "collected_at": "2026-10-05",
  "academic_year": "2026/2027",
  "institution": {
    "external_ids": { "ror": "<ror id или null>", "wikidata": "<Q-id или null>", "osm": null },
    "names": { "original": "<название на языке страны>", "en": "<English name>", "ru": "<название по-русски>" },
    "type": "university",
    "country": "GE",
    "city": { "original": "<город>", "en": "<city>", "ru": "<город>" },
    "location": { "lat": 0.0, "lng": 0.0 },
    "ownership": "public",
    "founded_year": null,
    "website": "https://<официальный сайт>",
    "description": { "ru": "<2–3 предложения своими словами>", "en": "<2-3 sentences>" },
    "dormitory": {
      "available": true,
      "cost": { "amount": null, "currency": "GEL", "period": "year", "applies_to": "all" }
    },
    "rankings": [
      { "name": "<название рейтинга>", "year": 2026, "position": "<например 801-1000>", "source_url": "https://<…>" }
    ]
  },
  "programs": [
    {
      "names": { "original": "<…>", "en": "<…>", "ru": "<…>" },
      "level": "bachelor",
      "isced_f": "0613",
      "languages": ["en"],
      "duration_years": 4,
      "format": "on_campus",
      "intakes": ["09"],
      "tuition": [
        { "amount": null, "currency": "GEL", "period": "year", "applies_to": "international" }
      ],
      "requirements": {
        "documents": ["passport", "school_certificate", "transcript", "apostille", "notarized_translation"],
        "min_scores": [ { "exam": "ielts", "min": null } ],
        "min_gpa": { "system": "<код системы оценок>", "value": null },
        "entrance_exams": null,
        "interview": null,
        "portfolio": null
      },
      "deadlines": [
        { "intake": "2027-09", "applies_to": "international", "date": null }
      ],
      "application_fee": { "amount": null, "currency": "GEL" },
      "application_url": null
    }
  ],
  "scholarships": [
    {
      "names": { "original": "<…>", "en": "<…>", "ru": "<…>" },
      "covers": "<tuition | living | full | partial>",
      "eligibility": { "ru": "<кратко>", "en": "<short>" },
      "url": "https://<…>"
    }
  ],
  "sources": [
    {
      "field": "programs[0].tuition[0].amount",
      "url": "https://<…>",
      "accessed_at": "2026-10-05",
      "confidence": "high"
    }
  ],
  "notes_for_reviewer": "<что не нашлось, в чём сомнения>"
}
```

Коды документов в `requirements.documents` совпадают со списком документов из регистрации (раздел 9 SPEC.md): `passport`, `study_visa`, `school_certificate`, `diploma`, `transcript`, `apostille`, `notarized_translation`, `recognition`, `proof_of_funds`, `health_insurance`, `parental_consent`. Если нужен документ не из списка — добавить его в `notes_for_reviewer`.

## Формат черновика страны

```json
{
  "schema_version": 1,
  "collected_at": "2026-10-05",
  "country": "GE",
  "currency": "GEL",
  "academic_year_start": "09",
  "study_visa": { "summary": { "ru": "<кратко>", "en": "<short>" }, "official_url": "https://<…>" },
  "work_during_study": { "allowed": null, "summary": { "ru": "<…>", "en": "<…>" } },
  "post_study_work_visa": { "available": null, "summary": { "ru": "<…>", "en": "<…>" } },
  "cost_of_living": [
    { "city": { "original": "<…>", "en": "<…>", "ru": "<…>" }, "amount_per_month": null, "currency": "GEL" }
  ],
  "diploma_recognition": { "summary": { "ru": "<…>", "en": "<…>" }, "official_url": null },
  "application_systems": [ { "name": "<…>", "url": "https://<…>" } ],
  "sources": [
    { "field": "study_visa", "url": "https://<…>", "accessed_at": "2026-10-05", "confidence": "high" }
  ],
  "notes_for_reviewer": "<…>"
}
```
