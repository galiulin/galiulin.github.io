# Инструкция по работе с блогом

## Новая статья

Создать файл в `content/posts/` с именем вида `YYYY-MM-DD-slug.md`:

```
content/posts/2026-03-05-my-new-post.md
```

Шаблон front matter:

```markdown
---
title: "Заголовок статьи"
date: 2026-03-05
tags:
  - Tag1
  - Tag2
---
Текст статьи...
```

Поля:
- `title` — заголовок (обязательно)
- `date` — дата публикации (обязательно, формат `YYYY-MM-DD`)
- `tags` — теги (опционально)

---

## Локальный просмотр

```bash
hugo server
```

Открыть в браузере: http://localhost:1313/

Сервер следит за изменениями и перезагружает страницу автоматически.
Остановить: `Ctrl+C`

Запустить в фоне:

```bash
hugo server &
```

Остановить фоновый сервер:

```bash
pkill -f "hugo server"
```

---

## Сборка и деплой на GitHub Pages

### Автоматически (рекомендуется)

Любой push в ветку `master` запускает GitHub Actions, который собирает и публикует сайт.

```bash
git add content/posts/2026-03-05-my-new-post.md
git commit -m "add post: my new post"
git push
```

Статус деплоя: https://github.com/galiulin/galiulin.github.io/actions

### Первоначальная настройка (один раз)

В настройках репозитория: **Settings → Pages → Source → GitHub Actions**

---

## Ручная сборка (опционально)

```bash
hugo
```

Результат — в папке `public/`. Она не коммитится (добавлена в `.gitignore`).
