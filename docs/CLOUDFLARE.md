# Сайт на Cloudflare (вместо Vercel): подробная инструкция для владельца

Сайт собирается для Cloudflare Workers адаптером OpenNext. Нужен платный план Workers ($5 в месяц, он у вас уже оплачен):
на бесплатном даётся 10 мс процессорного времени на запрос, а страницы заведений строятся на сервере.
Названия кнопок в панели Cloudflare иногда меняются: ищите похожие по смыслу, при сомнении присылайте скриншот.

## Что понадобится заранее (соберите в блокнот)
1. `NEXT_PUBLIC_SUPABASE_URL`: Supabase → Project Settings → API → Project URL (вида `https://xxxx.supabase.co`).
2. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: там же, «Publishable key» (начинается с `sb_publishable_`). Это публичный ключ. Ключ `service_role` / `secret` НЕ брать.
3. `NEXT_PUBLIC_CONTACT_EMAIL`: почта для связи (на Vercel сейчас стоит ваша Gmail).
4. `NEXT_PUBLIC_SITE_URL`: `https://www.yourhei.com`.
Все эти значения уже есть в Vercel (проект → Settings → Environment Variables, глазок покажет значение).

## Шаг 1. Хранилище для кэша страниц (R2)
1. dash.cloudflare.com → слева **R2 Object Storage** (или Storage & databases → R2).
2. Если просит включить R2, нажмите Enable / Purchase R2 (бесплатный объём большой, но на аккаунте должна быть карта, она у вас уже есть).
3. **Create bucket** → имя ровно `yourhei-cache` → местоположение Automatic → Create bucket.

## Шаг 2. Подключить GitHub к Cloudflare
1. Слева **Workers & Pages** (Compute → Workers & Pages) → **Create application**.
2. Выберите **Import a repository** (Connect to Git). Войдите в GitHub и разрешите Cloudflare доступ к репозиторию `<владелец>/yourhei` (Only select repositories → yourhei).
3. Выберите репозиторий `yourhei`, нажмите Next / Begin setup.
4. Заполните поля (остальные оставьте по умолчанию):
   - **Project name / Worker name:** `yourhei` (важно, имя должно совпасть с файлом `wrangler.jsonc`).
   - **Production branch:** `main`.
   - **Root directory:** пусто.
   - **Build command:** `npx opennextjs-cloudflare build`
   - **Deploy command:** `npx opennextjs-cloudflare deploy`
5. Откройте **Advanced settings → Variables** (или Build variables and secrets) и добавьте 4 переменные из блока «Что понадобится заранее»: Name и Value, тип Plaintext (обычный текст).
6. Нажмите **Save and Deploy**.

## Шаг 3. Дождаться сборки и открыть сайт
1. Сборка идёт 3–8 минут. Журнал показывается на экране (Build logs). В конце должно быть «Success».
2. Рабочий адрес появится вида `https://yourhei.<ваш-поддомен>.workers.dev` (смотрите в разделе Workers & Pages → yourhei → Settings → Domains & Routes или на странице деплоя).
3. Откройте этот адрес в браузере. Должна открыться главная. Откройте `/ru`, каталог, страницу заведения.
4. Если сборка упала (Failed), скопируйте последние 30 строк журнала сборки и пришлите мне.

## Шаг 4. Перенести домен yourhei.com на Cloudflare
(Делаем только когда адрес из шага 3 работает.)
1. dash.cloudflare.com → **Add a domain** (Onboard a domain) → введите `yourhei.com` → выберите **Free** план.
2. Cloudflare попробует скопировать существующие DNS-записи. **Удалите** найденные записи, связанные с Vercel (A-запись `@` на `216.198.79.1` и CNAME `www` на `...vercel-dns-017.com`) и заглушку Namecheap, они больше не нужны. Запись TXT с SPF (`v=spf1 include:spf.efwd.registrar-servers.com ~all`) можно оставить, она для пересылки почты Namecheap.
3. Cloudflare покажет **два сервера имён**, вида `xxx.ns.cloudflare.com` и `yyy.ns.cloudflare.com`. Запишите их.
4. Namecheap → Domain List → рядом с `yourhei.com` **Manage** → блок **Nameservers** → выберите **Custom DNS** → впишите два сервера Cloudflare → сохраните (зелёная галочка).
5. Вернитесь в Cloudflare, нажмите **Check nameservers**. Активация занимает от 5 минут до нескольких часов (обычно до часа). Придёт письмо «yourhei.com is now active».

## Шаг 5. Привязать домен к сайту
1. Workers & Pages → **yourhei** → **Settings** → **Domains & Routes** → **Add** → **Custom domain**.
2. Впишите `www.yourhei.com` → Add domain. Повторите для `yourhei.com` (без www).
3. Cloudflare сам создаст DNS-записи и сертификат HTTPS (до 15 минут).
4. Чтобы `yourhei.com` перенаправлялся на `www`: Cloudflare → ваш домен → **Rules → Redirect Rules** → Create rule → «If hostname equals `yourhei.com`, then redirect to `https://www.yourhei.com/${path}` (Dynamic), код 301». Это необязательно, но рекомендую.

## Шаг 6. Настроить вход и защиту для нового места
1. **Supabase** → Authentication → URL Configuration: Site URL `https://www.yourhei.com`; в Redirect URLs добавьте `https://www.yourhei.com/**` и `https://yourhei.com/**` (и адрес `https://yourhei.<ваш-поддомен>.workers.dev/**` на время проверки). Save.
2. **Cloudflare Turnstile** → ваш виджет → Hostnames: добавьте `yourhei.com` и `www.yourhei.com`.
3. Если вы настроили вход через Google: в Google Cloud Console (OAuth) менять ничего не нужно, редирект идёт через Supabase.

## Шаг 7. Проверка после переключения (10 минут)
Откройте `https://www.yourhei.com`: главная, смена языка, смена темы, карта (проскрольте до неё), каталог, страница заведения, регистрация (капча), вход, письмо сброса пароля. Если что-то не работает, пришлите скриншот и адрес страницы.
Затем Vercel можно отключить: Settings → Domains → удалить домены (или оставить проект как резерв).

## Если что-то пошло не так
- «Сайт не открывается по `www.yourhei.com`»: подождите ещё 15 минут, проверьте, что серверы имён у Namecheap именно от Cloudflare, статус домена в Cloudflare Active.
- «Ошибка сборки»: журнал сборки в Workers & Pages → yourhei → Deployments → последний → View build logs.
- Откат: серверы имён в Namecheap можно вернуть на «Namecheap BasicDNS», а на Vercel записи A/CNAME как раньше (если проект Vercel снова включён).

## Что где лежит в проекте
- `open-next.config.ts`: кэш страниц (R2 + региональный кэш Cloudflare + очередь обновления по таймеру).
- `wrangler.jsonc`: имя `yourhei`, R2-корзина `yourhei-cache`, очередь, ссылка на самого себя.
- `public/_headers`: кэш файлов карты.
- Команды для вашего компьютера: `npm run cf:preview` (собрать и открыть локально), `npm run cf:deploy` (собрать и выложить; нужен вход `npx wrangler login`).

## Что проверено
Сборка проходит; на локальном движке Workers прошли 236 e2e-теста (главная на 16 языках, регистрация и профиль, сообщество,
опрос, подборка, админка). Размер сборки 2,5 МБ в сжатом виде (лимит платного плана 10 МБ).
`proxy.ts` (переключение языка) в Cloudflare у адаптера экспериментальный: после обновления Next.js или адаптера его
нужно перепроверить (`npm run cf:preview`, затем e2e).
