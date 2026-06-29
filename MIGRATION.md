# План миграции на hugo-PaperModX

Долгоживущий документ для последовательного выполнения работ между сессиями.
Обновляется после каждого завершённого шага.

## Решения (зафиксированные)

- **Тема:** базовый `reorx/hugo-PaperModX` + Nord-палитра через `custom.css` (mermaid/KaTeX через свои partial'ы)
- **Локали:** ru + en, как сейчас (`content/{ru,en}/`)
- **Стратегия переводов:** en-посты становятся основными; в будущем русские посты переводятся на en (а не наоборот). Сейчас в en лежат 3 перевода существующих русских постов — фронтматтер выравниваем под русский шаблон, контент оставляем как есть

## Стартовое состояние

- Hugo extended `v0.157.0+` установлен локально (`/opt/homebrew/bin/hugo`)
- Репозиторий: `/Users/g_arthur/IdeaProjects/galiulin.github.io`
- Ветка по умолчанию: `master`
- Сборка и деплой: GitHub Actions → GitHub Pages
- Текущая тема: `sand` (собственная минималистичная, в `themes/sand/`)
- Контент:
  - `content/ru/posts/` — 13 постов
  - `content/en/posts/` — 3 поста
  - `content/{ru,en}/about/` — about-страницы
- Мусор в репо:
  - `_posts/` — старая папка Jekyll-стиля, Hugo не использует
  - `.git/modules/themes/hugo-theme-cleanwhite/` — осиротевший submodule (папки в `themes/` нет, `.gitmodules` тоже)
  - `.hugo_build.lock` — исключён `.gitignore`, но физически лежит в корне
  - `themes/sand/` — целиком уйдёт при миграции

---

## Фаза 0 — Подготовка

- [x] Создать ветку `feat/papermodx` от `master`
- [x] Удалить `themes/sand/` (`git rm -r themes/sand`, коммит)
- [x] Удалить `_posts/` (`git rm -r _posts`, коммит)
- [x] Удалить осиротевший submodule `hugo-theme-cleanwhite` (deinit + rm)
- [x] Удалить `.hugo_build.lock` (его нет в репо, в .gitignore)

## Фаза 1 — Установка темы

- [x] `git submodule add https://github.com/reorx/hugo-PaperModX.git themes/PaperModX`
- [x] В `hugo.toml`: `theme = "sand"` → `theme = "PaperModX"`
- [x] Проверить локальную сборку: `hugo` ✅ собирается

## Фаза 2 — Конфигурация (`hugo.toml`)

- [x] Переписан `hugo.toml` целиком под PaperModX + i18n
- [x] `paginate = 10`, `enableRobotsTXT`, `enableInlineShortcodes`
- [x] `outputs.home = ["HTML", "RSS", "JSON"]`
- [x] Фичи: `ShowToc`, `ShowCodeCopyButtons`, `ShowReadingTime`, `ShowPostNavLinks`,
      `ShowBreadCrumbs`, `TocSide = "right"`, `EnableInstantClick`, `EnableImageZoom`,
      `defaultTheme = "auto"`, `displayFullLangName`
- [x] `markup.goldmark.renderer.unsafe = true`
- [x] `markup.highlight.style = "nord"`
- [x] `socialIcons` (github, telegram, rss), `editPost`
- [x] `menu.main` для обеих локалей (Archive/Tags/Search/About)

### Обнаружено и зафиксировано: несовместимость PaperModX ↔ Hugo 0.157

В Hugo 0.156+ удалены/депрекейтнуты API, которые PaperModX ещё использует.
Сделаны оверрайды в нашем `layouts/`:

- `layouts/partials/social_quote_tweet.html` — no-op (использовал `getJSON`)
- `layouts/shortcodes/tweet-ref.html` — no-op (использовал `getJSON`)
- `layouts/_default/rss.xml` — вырезаны упоминания `site.Author.*` (deprecated)

Эти шорткоды/partial'ы в блоге не используются → безопасные no-op.

## Фаза 3 — Контентные страницы (features PaperModX)

- [x] Создать `content/{ru,en}/search.md` с `layout: "search"`
- [x] Создать `content/{ru,en}/archives.md` с `layout: "archives"`
- [x] Прогнать по всем постам: добавить `description` где отсутствует — **не требуется, все посты уже в эталонном стиле**
- [x] Включить `showToc: true` глобально (через `params.ShowToc`) — сделано в Фазе 2
- [ ] Для поста про Flow добавить `mermaid: true` в frontmatter — в Фазе 4
- [ ] Опционально: cover-изображения в frontmatter для шеринга в OG — отложено

**Замечание:** en-посты (3 файла) уже в едином с ru стиле frontmatter —
выравнивать нечего, переводы сделаны позже и сразу по эталону.

## Фаза 4 — Mermaid и KaTeX

⚠️ **Зависит от выбора темы:**
- Если nordish — пропустить, использовать встроенное.
- Если базовый — выполнить подфазы ниже.

### Фаза 4a — Mermaid (базовый PaperModX)

- [x] Скачать `mermaid.min.js` → `assets/js/mermaid.min.js` (v11, ~3.5 MB)
- [x] Создать `layouts/_default/_markup/render-codeblock-mermaid.html`:
      рендерит `<pre class="mermaid">…</pre>` из блока ` ```mermaid `
- [x] Создать `layouts/partials/mermaid.html`:
      подключает `mermaid.min.js` + `mermaid-init.js` через `resources.Get`
      + `js.Build` + fingerprint (только при наличии `<pre class="mermaid">` в `.Content`)
- [x] Оверрайд `layouts/_default/single.html`: расширяет `body_end` блок,
      `main` блок — копия из темы
- [x] Init-скрипт `assets/js/mermaid-init.js`: использует `globalThis.mermaid`,
      реагирует на `instantclick:newpage` для InstantClick-совместимости,
      поддерживает смену темы (light/dark)
- [x] Проверить на `content/{ru,en}/posts/2026-05-20-flow-lifecycle-guide.md` — OK

### Фаза 4b — KaTeX (базовый PaperModX)

- [ ] **ОТЛОЖЕНО** — в блоге пока нет формул. Включается по запросу.

## Фаза 5 — Внешний вид

- [ ] Создать `assets/css/extended/custom.css`
- [ ] Палитра: Nord (`#2e3440` фон, `#88c0d0` акцент) или своя
- [ ] Шрифт кода: `JetBrains Mono` локально через `@font-face`
- [ ] Шрифт UI: системный sans-serif (`-apple-system, …`)
- [ ] Подкрутить `--post-width: 860px` (если Nord-стиль, оставить 800)
- [ ] Favicon: `static/favicon.svg` + `params.assets.favicon`
- [ ] OG-картинка по умолчанию: `static/og-default.png` 1200×630

## Фаза 6 — CI/CD

- [ ] В `.github/workflows/hugo.yml` к шагу `actions/checkout@v4` добавить `with: submodules: true`
- [ ] Проверить: локальный `hugo --minify` собирается без ошибок
- [ ] Push в `feat/papermodx`, дождаться зелёного деплоя в Actions
- [ ] Проверить https://galiulin.github.io в инкогнито

## Фаза 7 — Документация

- [ ] Переписать `BLOG.md` под новую структуру (многоязычные пути,
      новые поля frontmatter, mermaid/math/showtoc)
- [ ] Удалить `personal-info.md`, если его содержимое ушло в `content/about.md`
- [ ] Обновить `README.md`, если есть

## Фаза 8 — Гигиена репозитория

- [ ] `git rm -r themes/sand _posts` (если не сделано в фазе 0)
- [ ] `.gitignore`: убедиться, что `public/`, `resources/_gen/`, `.hugo_build.lock` исключены
- [ ] Проверить: `git status` чист, `git submodule status` показывает `themes/PaperModX`
- [ ] Squash коммиты в один PR или разбить на логичные коммиты по фазам — на усмотрение

---

## Что НЕ нужно делать (PaperModX закрывает сам)

- ❌ Подсветка синтаксиса (Chroma встроен)
- ❌ TOC-шаблон (`ShowToc` + `TocSide`)
- ❌ Кнопка copy (`ShowCodeCopyButtons`)
- ❌ Переключатель языков (`displayFullLangName` + `languageAltTitle`)
- ❌ OG / Twitter Cards (генерируются при `env: production`)
- ❌ RSS (`outputs.home`)
- ❌ robots.txt (`enableRobotsTXT`)
- ❌ Тёмная тема (`defaultTheme: auto`)
- ❌ Поиск (Fuse.js + `search.md`)
- ❌ Архив / теги (layout'ы)
- ❌ Scroll-to-top, access keys (встроены)
- ❌ Pagination (встроена)

## Что остаётся на ручную работу

- ✋ Кастомизация палитры и шрифтов (`custom.css`)
- ✋ Mermaid-partial (если не nordish)
- ✋ Favicon и OG-картинка
- ✋ Проверка каждой статьи: `description`, при необходимости `showToc` / `mermaid`

## Лог сессий

### Сессия 5 — 2026-06-29
- Визуальная проверка: поднят `hugo server` на порту 4123,
  сняты 7 скриншотов через puppeteer-core + Chrome 149 в headless-режиме.
  Скриншоты сохранены в `.shots/` (в .gitignore)
- **Mermaid проверен:** на обоих постах про Flow `<pre class="mermaid">`
  заменён на `<svg id="mermaid-...">` после рендера — `svg=1, pre_remaining=0`
- Headless Chrome не дожидался асинхронного `mermaid.render()` даже с
  `virtual-time-budget=30s`. Puppeteer с явным `waitForFunction` решил проблему.
- Сервер остановлен, `.shots/` добавлен в `.gitignore`
- KaTeX отложен до появления формул в постах
- Уточнена стратегия переводов: en-посты становятся первичными
- Завершена Фаза 3: search/archives добавлены, TOC работает,
  frontmatter в порядке
- Начата Фаза 4: Mermaid. Скачан mermaid v11, написаны render-hook,
  init-скрипт с поддержкой InstantClick и смены темы, partial с условной
  загрузкой через `resources.Get`. Оверрайднут single.html для расширения
  `body_end` блока.
- **Важно:** при оверрайде single.html пришлось скопировать `main` блок
  из темы — иначе Hugo отдаёт пустые страницы (контент не рендерится).
  Это создаёт точку синхронизации с апстримом, зафиксировано в коде.
- Коммит `607f2377`
- **Открыто:** KaTeX (Фаза 4b), внешний вид (Фаза 5), CI submodules (Фаза 6)
- Завершены Фазы 1 + 2 (объединены, т.к. конфиг переписывался целиком)
- PaperModX подключён как submodule (`846feebb`)
- Локальная сборка `hugo` проходит, EN+RU обе локали отдают страницы
- Зафиксирована несовместимость PaperModX с Hugo 0.157:
  удалены `getJSON`/`data.GetJSON`, депрекейтнуты `site.Author.*`.
  Сделаны оверрайды в `layouts/` (no-op для tweet-partial'ов, RSS без Author)
- Меню в шапке (Archive/Tags/Search/About) работает для обеих локалей
- OG / Twitter / canonical / hreflang / RSS / JSON — генерируются автоматически
- Коммит `257b4116`
- **Открыто:** пост про Flow содержит ` ```mermaid `, рендерится как обычный код →
  подключение partial'а в Фазе 4