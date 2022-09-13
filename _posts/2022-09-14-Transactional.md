---
title: "@Transactional"

header:
  image: assets/images/francesco-ungaro-qgZvBPM9Hm42-unsplash.jpg
  caption: "Photo by [**Francesco Ungaro**](https://unsplash.com/@francesco_ungaro) on [unsplash](https://unsplash.com/photos/qgZvBPM9Hm4)"

tags:
  - Transactional
  - Hibernate
  - Spring Data JPA
toc: true
toc_label: "Содержание"
toc_icon: "list"
---

**Статус статьи:** в процессе написания
{: .notice--danger}

## О чем статья?

- Детально рассмотрим аннотацию `@Transactional` и её свойства

## C чего обычно всё начинается?

Разработчик пишет программу, использует базу, подключает источник данных будь-то REST или Kafka 
и о многопоточности и конкурентности мало кто задумывается.
