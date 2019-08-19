Создаем контейнер с базой данных PostgreSql

    $ docker run -d -p 5432:5432 --name postgre -e POSTGRES_PASSWORD=mysecretpassword postgres

Открываем порт `-p <host_port>:<container_port>`

Соединяемся с контейнером `docker exec -it postgre bash`. Теперь мы внутри контейнера. Подключаемся к postgres `root@e82f6cc99cfd:/# psql -U postgres`. Теперь можем создать базу данных `postgres=# CREATE DATABASE mytestdb;`

Основные шаги пройдены. Дальше можем выйти `\q` и пройти к локальной машине.