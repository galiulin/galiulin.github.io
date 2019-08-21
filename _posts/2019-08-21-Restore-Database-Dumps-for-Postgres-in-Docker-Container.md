Заносим дамп БД postgres в контейнер.

1. Скопировать дамп внутрь контейнера `docker cp <path_to_volume_in_host> <container_name>:<path_to_volume>`.
2. Для удобства дальнейшего ввода команд подключиться к контейнеру `docker exec -it <container_name> bash`.
3. Развернуть дамп `pg_restore -U postgres -v -d postgres <dump_file>

Вот и всё.
Мне для моего дампа пришлось воссоздавать пользователей:
внутри контейнера подключаемся к psql: `psql -U postgres` и создаем пользователя `CREATE USER <user_name> WITH PASSWORD <password>`.