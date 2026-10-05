# YourHEI

Карта и подбор вузов, колледжей и школ. Техническое задание — [SPEC.md](SPEC.md), ход работы — [PROGRESS.md](PROGRESS.md), пошаговая инструкция для владельца — [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md).

## Команды

```bash
npm run dev        # запустить сайт на http://localhost:3000
npm run build      # собрать для публикации
npm run lint       # проверка кода
npm run typecheck  # проверка типов
npm test           # юнит-тесты (Vitest)
npm run test:e2e   # браузерные тесты (Playwright)
npm run seed:build # пересобрать тестовые данные из data/seed/raw_wikidata.json
```

Данные заведений: Wikidata (CC0). Карта: © участники OpenStreetMap, OpenFreeMap.
