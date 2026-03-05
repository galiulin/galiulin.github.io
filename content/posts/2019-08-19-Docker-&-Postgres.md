---
title: "Docker & Postgres"
date: 2019-08-19
description: "Как поднять контейнер с PostgreSQL в Docker, подключиться к нему и создать базу данных."
tags:
  - Docker
  - PostgreSQL
---
Создаем контейнер с базой данных PostgreSQL:

```bash
docker run -d -p 5432:5432 --name postgre -e POSTGRES_PASSWORD=mysecretpassword postgres
```

Открываем порт `-p <host_port>:<container_port>`

Соединяемся с контейнером:

```bash
docker exec -it postgre bash
```

Теперь мы внутри контейнера. Подключаемся к postgres:

```bash
psql -U postgres
```

Создаем базу данных:

```sql
CREATE DATABASE mytestdb;
```

Основные шаги пройдены. Дальше можем выйти `\q` и вернуться к локальной машине.
