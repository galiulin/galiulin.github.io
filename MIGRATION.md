# План миграции на hugo-PaperModX

Долгоживущий документ для последовательного выполнения работ между сессиями.
Обновляется после каждого завершённого шага.

## Решения (зафиксированные)

- **Тема:** базовый `reorx/hugo-PaperModX` + Nord-палитра через `custom.css` (mermaid/KaTeX через свои partial'ы)
- **Локали:** ru + en, как сейчас (`content/{ru,en}/`)

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

- [ ] Создать ветку `feat/papermodx` от `master`
- [ ] Удалить `themes/sand/` (`git rm -r themes/sand`, коммит)
- [ ] Удалить `_posts/` (`git rm -r _posts`, коммит)
- [ ] Удалить осиротевший submodule `hugo-theme-cleanwhite` (deinit + rm)
- [ ] Удалить `.hugo_build.lock` (он в .gitignore, но физически мешает)

## Фаза 1 — Установка темы

- [ ] `git submodule add https://github.com/reorx/hugo-PaperModX.git themes/PaperModX`
- [ ] В `hugo.toml`: `theme = "sand"` → `theme = "PaperModX"`
- [ ] Проверить локальную сборку: `hugo server -D`
- [ ] Если падает — фиксить, прежде чем идти дальше

## Фаза 2 — Конфигурация (`hugo.toml`)

- [ ] Скопировать структуру из `themes/PaperModX/exampleSite/config.default.yml`
- [ ] Адаптировать под двуязычный сайт (ru + en)
- [ ] Включить фичи: `ShowToc`, `ShowCodeCopyButtons`, `ShowReadingTime`,
      `ShowPostNavLinks`, `ShowBreadCrumbs`, `defaultTheme = "auto"`,
      `TocSide = "right"`, `EnableInstantClick`, `EnableImageZoom`
- [ ] `markup.goldmark.renderer.unsafe = true` (для якорей и mermaid)
- [ ] `markup.highlight.style = "monokai"` (или `github`/`nord`)
- [ ] `enableRobotsTXT = true`
- [ ] `outputs.home = ["HTML", "RSS", "JSON"]`
- [ ] `paginate = 10`
- [ ] Социальные иконки: github, telegram, rss (`socialIcons` через Simple Icons)
- [ ] `editPost.URL` → `https://github.com/galiulin/galiulin.github.io/edit/master/content`
- [ ] Проверить: `hugo server` — обе локали открываются, переключатель языков работает

## Фаза 3 — Контентные страницы (features PaperModX)

- [ ] Создать `content/{ru,en}/search.md` с `layout: "search"`
- [ ] Создать `content/{ru,en}/archives.md` с `layout: "archives"`
- [ ] Прогнать по всем постам: добавить `description` где отсутствует
- [ ] Включить `showToc: true` глобально (через `params.ShowToc`)
- [ ] Для поста про Flow добавить `mermaid: true` в frontmatter
- [ ] Опционально: cover-изображения в frontmatter для шеринга в OG

## Фаза 4 — Mermaid и KaTeX

⚠️ **Зависит от выбора темы:**
- Если nordish — пропустить, использовать встроенное.
- Если базовый — выполнить подфазы ниже.

### Фаза 4a — Mermaid (базовый PaperModX)

- [ ] Скачать `mermaid.min.js` → `static/js/mermaid.min.js`
- [ ] Создать `layouts/_default/_markup/render-codeblock-mermaid.html`:
      рендерит `<pre class="mermaid">…</pre>` из блока ` ```mermaid `
- [ ] Создать `layouts/partials/mermaid.html`:
      подключает скрипт и инициализирует `mermaid.initialize({startOnLoad:true})`
- [ ] Подключить partial в `layouts/_default/single.html` или через `head`
- [ ] Проверить на `content/{ru,en}/posts/2026-05-20-flow-lifecycle-guide.md`

### Фаза 4b — KaTeX (базовый PaperModX)

- [ ] Скачать `katex.min.js`, `katex.min.css`, `auto-render.min.js` → `static/`
- [ ] Создать `layouts/partials/math.html` с подключением
- [ ] Включать partial при `math: true` в frontmatter
- [ ] Проверить на тестовой формуле

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

### Сессия 2 — 2026-06-29
- Зафиксированы решения: базовый PaperModX + Nord, локали ru+en
- Начата Фаза 0: подготовка