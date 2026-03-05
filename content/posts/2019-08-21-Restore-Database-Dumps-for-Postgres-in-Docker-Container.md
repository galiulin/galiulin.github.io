---
title: "Restore Database Dumps for Postgres in Docker Container"
date: 2019-08-21
description: "Пошаговая инструкция: как скопировать дамп PostgreSQL внутрь Docker-контейнера и развернуть его через pg_restore."
tags:
  - Docker
  - PostgreSQL
---
Заносим дамп БД postgres в контейнер.

1. Скопировать дамп внутрь контейнера:

```bash
docker cp <path_to_volume_in_host> <container_name>:<path_to_volume>
```

2. Подключиться к контейнеру:

```bash
docker exec -it <container_name> bash
```

3. Развернуть дамп:

```bash
pg_restore -U postgres -v -d postgres <dump_file>
```

Вот и всё.
Мне для моего дампа пришлось воссоздавать пользователей — внутри контейнера подключаемся к psql:

```bash
psql -U postgres
```

и создаем пользователя:

```sql
CREATE USER <user_name> WITH PASSWORD <password>;
```
