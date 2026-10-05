# Что запускать в Supabase — полный список по порядку

Все файлы можно запускать **повторно без вреда** (они проверяют, что уже есть). Поэтому если запутались — просто пройдите список с начала.

**Как запускать каждый файл:** Supabase → **SQL Editor** → **New query** → откройте файл в папке проекта, скопируйте всё содержимое (Ctrl+A, Ctrl+C), вставьте в окно запроса → **Run**. Ожидаемо внизу: **Success** (для файлов с данными — «Success. No rows returned» тоже нормально).

Папка проекта: `C:\Users\Timur Dimitriev\Documents\YourHEI`.

## А. Структура базы (строго по порядку)

| № | Файл | Что делает |
|---|------|-----------|
| 1 | `supabase\migrations\0001_stage1.sql` | Таблицы заведений и типов, карта |
| 2 | `supabase\migrations\0002_accounts.sql` | Профили, документы, удаление аккаунта |
| 3 | `supabase\migrations\0003_reference_data.sql` | Страны, регионы, возрастные пороги |
| 4 | `supabase\migrations\0004_survey.sql` | Опрос |
| 5 | `supabase\migrations\0005_programs.sql` | Программы, стипендии, рейтинги, данные по странам |
| 6 | `supabase\migrations\0006_admin.sql` | **Админ-панель** (роль админа, журнал изменений) |

## Б. Заведения на карте (после пункта 5; порядок между ними любой)

| № | Файл |
|---|------|
| 7 | `supabase\data\institutions_region_01.sql` |
| 8 | `supabase\data\institutions_region_02.sql` |
| 9 | `supabase\data\institutions_region_03.sql` |
| 10 | `supabase\data\institutions_region_04.sql` |

## В. Подробные данные для подбора (по желанию)

| № | Файл | Когда |
|---|------|-------|
| 11 | `supabase\data\drafts_published.sql` | **Сначала прочитайте** `docs\review\REVIEW.md`. Если данные верны — запускайте: программы трёх вузов Грузии станут публичными и попадут в подбор. |
| — | `supabase\data\drafts.sql` | Вместо №11, если хотите сохранить данные скрытыми (черновиками) и опубликовать позже через админ-панель. |

## Что НЕ запускать

- `supabase\seed.sql` — старые тестовые заведения первого этапа. **Не нужен**: настоящие заведения — в файлах 7–10.

## Г. Настройки в Supabase (не SQL, руками в меню)

1. **Authentication → URL Configuration:** Site URL `http://localhost:3000`; Redirect URLs: `http://localhost:3000/**` и адрес сайта на Vercel с `/**`.
2. **Authentication → Sign In / Providers → Email:** вход по почте включён. Для проверок у себя можно **выключить Confirm email** (иначе упрётесь в лимит писем Supabase — «Слишком много попыток»). Перед запуском для людей включите обратно и подключите свою почтовую службу.
3. Минимальная длина пароля — **10**.

## Д. Как стать администратором

1. Зарегистрируйтесь на сайте обычным способом (своей почтой).
2. Supabase → **SQL Editor** → **New query**, вставьте (замените почту на свою) → **Run**:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'ваша-почта@example.com');
```

3. Ожидаемо: **Success. 1 row affected** (если 0 — почта написана с ошибкой или вы ещё не зарегистрировались).
4. Выйдите и войдите на сайте снова. В шапке появится кнопка **Admin** → откроется `/ru/admin`.

Другим людям админа **не давайте**: админ может менять и удалять любые заведения и программы.

## Е. Быстрая проверка, что всё встало

В **SQL Editor** выполните:

```sql
select
  (select count(*) from public.countries)      as countries,      -- 249
  (select count(*) from public.institutions)   as institutions,   -- около 640
  (select count(*) from public.programs)       as programs,       -- 25, если запускали №11
  (select public.min_age_for('GE'))            as min_age_ge;     -- 16
```
