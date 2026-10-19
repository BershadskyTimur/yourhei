# Письма Supabase на 16 языках

Готовые шаблоны лежат в `docs/email-templates/`. Один шаблон на каждый вид письма: язык выбирается сам по полю `ui_locale`,
которое форма регистрации сохраняет в аккаунте (аккаунты без него получают английский).
Тексты переведены машиной: перед большим наплывом людей их стоит показать носителям языков.

## Как поставить (10 минут)
Supabase → **Authentication → Emails → Templates**. Для каждого из четырёх видов письма:

| Вид письма в Supabase | Файл шаблона | Тема (Subject) |
|---|---|---|
| Confirm sign up | `confirm-signup.html` | блок `confirm-signup` из `SUBJECTS.md` |
| Reset password | `recovery.html` | блок `recovery` |
| Change email address | `email-change.html` | блок `email-change` |
| Reauthentication | `reauthentication.html` | блок `reauthentication` |

1. Откройте нужный вид письма.
2. В поле **Subject heading** вставьте тему из `SUBJECTS.md`. Если Supabase покажет ошибку шаблона, впишите просто `YourHEI`.
3. В поле **Message body** (режим Source / HTML) удалите всё и вставьте содержимое файла целиком.
4. **Save changes**.
5. Остальные виды (Magic link, Invite) не используются, их не трогайте.

## Проверка
Зарегистрируйтесь на `www.yourhei.com/ru/register` новой почтой: письмо придёт на русском. То же на `/en/register` (английский) и т.д.
«Забыли пароль» пишет на языке, с которым человек регистрировался.

## Как пересобрать
Тексты лежат в `scripts/make-email-templates.mjs`. После правки: `node scripts/make-email-templates.mjs` и снова вставить файлы в Supabase.
