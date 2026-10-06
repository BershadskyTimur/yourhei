# Как выложить YourHEI в интернет (пошагово)

Код уже лежит на GitHub: `https://github.com/BershadskyTimur/yourhei`. Осталось подключить Vercel и настроить ключи. Всё делается в браузере.

## 1. Vercel: создать проект (если ещё нет)

1. Зайдите на https://vercel.com и войдите через GitHub.
2. **Add New… → Project** → найдите репозиторий **yourhei** → **Import**.
3. Ничего не меняйте в «Framework Preset» (должен быть **Next.js**). **Пока не нажимайте Deploy**: сначала шаг 2.

Если проект уже есть: откройте его → вкладка **Deployments**. После моего последнего `git push` там должна появиться новая сборка (Building → Ready).

## 2. Vercel: переменные окружения (самое важное)

Проект → **Settings → Environment Variables**. Добавьте (Environment: все три галочки Production, Preview, Development):

| Имя | Значение | Обязательно |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | то же, что в вашем `.env.local` | да |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | то же, что в `.env.local` | да |
| `NEXT_PUBLIC_CONTACT_EMAIL` | почта для страницы «Контакты» | да, чтобы работала связь |
| `NEXT_PUBLIC_SITE_URL` | адрес сайта, например `https://yourhei.vercel.app` (потом домен) | рекомендуется |
| `NEXT_PUBLIC_GOOGLE_AUTH` | `true` — только после шага 5 | нет |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | ключ сайта Cloudflare Turnstile (шаг 6) | нет |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` из Google Analytics (шаг 7) | нет |

⚠️ **Секретный ключ `SUPABASE_SERVICE_ROLE_KEY` в Vercel НЕ добавляйте.** Он нужен только для загрузочных скриптов на вашем компьютере.

После добавления переменных: **Deployments → … у последней сборки → Redeploy** (переменные подхватываются только при новой сборке).

## 3. Supabase: разрешить адрес сайта

Supabase → **Authentication → URL Configuration**:
- **Site URL**: адрес сайта на Vercel, например `https://yourhei.vercel.app`.
- **Redirect URLs** → Add: `https://yourhei.vercel.app/**` и `http://localhost:3000/**` (чтобы работало и у вас на компьютере).

Без этого ссылки из писем (подтверждение почты, сброс пароля) не сработают.

## 4. Supabase: новые файлы базы

SQL Editor → вставить → Run, по порядку (если ещё не запускали): `0006_admin.sql`, `0007_favorites.sql`, `0008_oauth.sql`. Полный список — в `docs/SUPABASE_FILES.md`.

## 5. Вход через Google (по желанию)

1. https://console.cloud.google.com → создайте проект → **APIs & Services → OAuth consent screen** (тип External, название YourHEI, ваша почта).
2. **Credentials → Create credentials → OAuth client ID → Web application**.
   - **Authorized redirect URIs**: адрес из Supabase: **Authentication → Providers → Google** (там написан «Callback URL», вида `https://xxxx.supabase.co/auth/v1/callback`).
3. Скопируйте **Client ID** и **Client secret** → вставьте в Supabase → Providers → Google → включите **Enable** → Save.
4. В Vercel добавьте `NEXT_PUBLIC_GOOGLE_AUTH` = `true` → Redeploy. На странице входа появится кнопка «Продолжить через Google».

Человек, пришедший через Google, при первом входе обязан указать дату рождения и страну (для проверки возраста): сайт сам отправит его в профиль.

## 6. Защита от ботов Cloudflare Turnstile (по желанию, бесплатно)

1. https://dash.cloudflare.com → **Turnstile → Add widget** → домен вашего сайта (и `localhost` для проверок) → создайте.
2. **Site key** → в Vercel `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
3. **Secret key** → в Supabase: **Authentication → Attack Protection → Enable CAPTCHA protection** → провайдер Turnstile → вставьте секрет → Save.
4. Redeploy в Vercel. На страницах входа, регистрации и «Забыли пароль» появится проверка.

Включать нужно **оба шага** (3 и 2): иначе регистрация перестанет работать.

## 7. Аналитика (по желанию)

Google Analytics 4 создаёт идентификатор вида `G-XXXXXXXXXX`; впишите его в Vercel как `NEXT_PUBLIC_GA_ID`. Скрипт загружается только после того, как посетитель нажал «Принять все» в баннере cookie.

## 8. Своя почта для писем (нужно до настоящих пользователей)

Встроенная почта Supabase отправляет очень мало писем в час. Решение: Resend (бесплатный тариф 3000 писем в месяц).

1. https://resend.com → зарегистрируйтесь → **Domains → Add Domain** → ваш домен → добавьте DNS-записи, которые покажет Resend (у регистратора домена).
2. **API Keys → Create** → скопируйте ключ.
3. Supabase → **Authentication → Emails → SMTP Settings → Enable custom SMTP**: Host `smtp.resend.com`, Port `465`, Username `resend`, Password = API-ключ, Sender email = `noreply@ваш-домен`, Sender name = YourHEI → Save.

Без своего домена письма с Resend можно слать только на вашу собственную почту.

## 9. Свой домен

Vercel → проект → **Settings → Domains → Add** → ваш домен → добавьте DNS-записи у регистратора. Потом обновите `NEXT_PUBLIC_SITE_URL`, **Site URL / Redirect URLs в Supabase** и Redirect URI в Google (если включали) на новый адрес.

## 10. Проверка опубликованного сайта

- [ ] Главная открывается, карта показывает точки, переключатель темы и языка работают.
- [ ] Страница заведения (например, Ilia State University) показывает программы.
- [ ] Регистрация: письмо приходит, ссылка из письма ведёт на ваш сайт, а не на localhost.
- [ ] Вход, опрос, «Моя подборка», «Мой список», сравнение.
- [ ] Баннер cookie появляется при первом визите и запоминает выбор.
- [ ] Всё открывается с телефона.
