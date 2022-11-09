---
title: "Frequently used bash commands"

header:
  image: assets/images/francesco-ungaro-qgZvBPM9Hm42-unsplash.jpg
  caption: "Photo by [**Francesco Ungaro**](https://unsplash.com/@francesco_ungaro) on [unsplash](https://unsplash.com/photos/qgZvBPM9Hm4)"

last_modified_at: 2022-11-10T15:28:00+03:00

tags:
  - Bash
  - Linux
  - Command
  - Terminal
toc: true
toc_label: "Content"
toc_icon: "list"
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

## changing the java version in git bush

```bash
export JAVA_HOME='/c/soft/java/jdk-17.0.2/'
export PATH=$JAVA_HOME/bin:$PATH
```
and checking it out

```bash
java -version
```

## psql

It may not belong to the Linux command category, but I use it very often.

```bash
PGPASSWORD='yourpassword' psql -h hostname -p 5432 -d dbname -U username -c 'drop schema schemaname cascade'
```

