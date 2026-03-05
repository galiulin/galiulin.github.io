---
title: "Frequently used bash commands"
date: 2022-10-14
description: "Шпаргалка по часто используемым командам: find с фильтрами, смена версии Java в Git Bash, подключение к PostgreSQL через psql."
tags:
  - Bash
  - Linux
  - Terminal
---
Commands which I often use and they are helpful for me.

## find

If you looking for some files:

```bash
find . -type f -iname '*filename*'
# or
find ./dir/path -name 'fullFileName.extension'
```

You can search and do something with the results:

```bash
find . -type f -iname '*.properties' -exec grep 'property.name' {} \;
```

## Changing the Java version in Git Bash

```bash
export JAVA_HOME='/c/soft/java/jdk-17.0.2/'
export PATH=$JAVA_HOME/bin:$PATH
```

and checking it out:

```bash
java -version
```

## psql

It may not belong to the Linux command category, but I use it very often.

```bash
PGPASSWORD='yourpassword' psql -h hostname -p 5432 -d dbname -U username -c 'drop schema schemaname cascade'
```
