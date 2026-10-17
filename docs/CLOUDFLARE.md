# Сайт на Cloudflare (вместо Vercel)

Сайт собирается для Cloudflare Workers адаптером OpenNext (`@opennextjs/cloudflare`). Платный план Workers ($5 в месяц)
нужен, потому что бесплатный даёт 10 мс процессорного времени на запрос, а страницы заведений строятся на сервере.

## Что где лежит
- `open-next.config.ts` — кэш страниц: R2 + региональный кэш Cloudflare + очередь (Durable Object) для обновления по таймеру.
- `wrangler.jsonc` — имя сайта (`yourhei`), привязки: R2-корзина `yourhei-cache`, очередь, ссылка на самого себя.
- `public/_headers` — кэш файлов карты.
- Команды: `npm run cf:preview` (собрать и открыть на своём компьютере), `npm run cf:deploy` (собрать и выложить; нужен вход `npx wrangler login`).

## Переменные (вписываются в настройках Cloudflare, раздел Build → Variables and secrets)
Они «вшиваются» в сайт при сборке, поэтому должны быть заданы в настройках СБОРКИ:

| Имя | Значение |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | адрес проекта Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | публичный (publishable) ключ Supabase |
| `NEXT_PUBLIC_SITE_URL` | `https://www.yourhei.com` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | почта для связи |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | ключ виджета Turnstile (если используется) |

Секретный ключ `service_role` сюда НЕ вписывается никогда.

## Подключение (пошагово, делает владелец)
1. Cloudflare → R2 Object Storage → Create bucket → имя `yourhei-cache`.
2. Cloudflare → Workers & Pages → Create → Import a repository → GitHub `<владелец>/yourhei`, ветка `main`.
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx opennextjs-cloudflare deploy`
   - Переменные из таблицы выше.
3. Первая сборка занимает 3–6 минут. Результат сначала открывается на адресе `yourhei.<ваш-поддомен>.workers.dev`.
4. Домен: Cloudflare → Add a site → `yourhei.com` (план Free) → в Namecheap (Domain List → Manage → Nameservers → Custom DNS) указать два сервера имён, которые покажет Cloudflare. Старые записи Vercel (A `@`, CNAME `www`) в Cloudflare не переносить.
5. Cloudflare → Workers & Pages → yourhei → Settings → Domains & Routes → Add → Custom domain: `www.yourhei.com` и `yourhei.com`.
6. Supabase → Authentication → URL Configuration: Site URL и Redirect URLs (адреса `https://www.yourhei.com/**`, `https://yourhei.com/**`); Cloudflare Turnstile → Hostnames: те же домены.

## Что проверено
Сборка проходит; на локальном движке Workers (wrangler dev) прошли 236 e2e-тестов (главная на 16 языках, регистрация и профиль,
сообщество, опрос, подборка, админка). Размер сборки 2,5 МБ в сжатом виде (лимит платного плана 10 МБ).
`proxy.ts` (переключение языка) в Cloudflare считается экспериментальным у адаптера: работает, но после обновления Next.js
или адаптера его нужно перепроверить (`npm run cf:preview`, затем e2e).
