# Web Vitals Lab

[![CI](https://github.com/Momav215/web-vitals-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/Momav215/web-vitals-lab/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Публичная лаборатория frontend observability на Next.js (App Router). Собирает LCP, INP и CLS, пишет structured log со сквозным correlation id и отправляет события на `/api/telemetry`.

Это учебное демо. Оно не является продуктом работодателя и не содержит внутреннего кода.

## Что внутри

- пороги Good / Needs improvement / Poor для LCP, INP, CLS, FCP и TTFB
- `PerformanceObserver` для LCP, layout shift и event timing
- логгер с correlation id и `navigator.sendBeacon`
- синтетические сценарии: длинная задача и сдвиг макета
- smoke-тест Playwright и GitHub Actions

## Запуск

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm run test:e2e
```

Перед `test:e2e` нужен production-билд: Playwright поднимает `npm run start`.

## Лицензия

[MIT](LICENSE) © 2026 Владислав Окин
