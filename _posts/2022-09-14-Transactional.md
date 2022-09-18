---
title: "@Transactional"

header:
  image: assets/images/francesco-ungaro-qgZvBPM9Hm42-unsplash.jpg
  caption: "Photo by [**Francesco Ungaro**](https://unsplash.com/@francesco_ungaro) on [unsplash](https://unsplash.com/photos/qgZvBPM9Hm4)"

last_modified_at: 2022-09-18T15:28:00+03:00

tags:
  - Transactional
  - Hibernate
  - Spring Data JPA
toc: true
toc_label: "Содержание"
toc_icon: "list"
---

**Статья** в процессе написания
{: .notice--danger}

## О чем статья?

- Разберемся что такое транзакции и зачем они нужны
- Детально рассмотрим аннотацию `@Transactional` и её свойства

## C чего обычно всё начинается?  
  
Разработчик пишет программу, использует базу, подключает источник данных будь-то REST или Kafka   
и о многопоточности и конкурентности мало кто думает.

### JTA
Java Transaction API, более известное как JTA, это API для управления транзакциями в Java. Оно поддерживает открытие (start), завершение с сохранением (commit) и откат (rollback) транзакции ресурсонезависимым способом (?) .

Истинная сила JTA заключается в его способности управлять несколькими ресурсами (например, базами данных, службами обмена сообщениями) в рамках одной транзакции.

## Определение транзакции

Транзакция (англ. transaction) - это группа последовательных операций с базой данных, которая представляет собой логическую единицу работы с данными. Транзакция может быть выполнена либо целиком и успешно, **соблюдая целостность** данных и **независимо от** параллельно идущих **других транзакций**, либо не выполнена вообще, и тогда она не должна произвести никакого эффекта. [wikipedia.org](https://ru.wikipedia.org/wiki/%D0%A2%D1%80%D0%B0%D0%BD%D0%B7%D0%B0%D0%BA%D1%86%D0%B8%D1%8F_(%D0%B8%D0%BD%D1%84%D0%BE%D1%80%D0%BC%D0%B0%D1%82%D0%B8%D0%BA%D0%B0))

### Требования к транзакциям

обеспечивается набором [ACID](https://ru.wikipedia.org/wiki/ACID). Пока не буду останавливаться на всех составляющих, разберу лишь `I` - `isolation`. Т.к. это требование как раз и относится к нашей теме.

### Isolation
Во время выполнения транзакции параллельные транзакции не должны оказывать влияния на её результат. Полная изолированность — требование дорогое поэтому, для экономии ресурсов, существуют [уровни изолированности](https://ru.wikipedia.org/wiki/%D0%A3%D1%80%D0%BE%D0%B2%D0%B5%D0%BD%D1%8C_%D0%B8%D0%B7%D0%BE%D0%BB%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D0%BE%D1%81%D1%82%D0%B8_%D1%82%D1%80%D0%B0%D0%BD%D0%B7%D0%B0%D0%BA%D1%86%D0%B8%D0%B9 "Уровень изолированности транзакций") определяющие в какой мере в результате выполнения параллельных транзакций допускается получение несогласованных данных. Чем ниже уровень - тем больше транзакций могут работать одновременно и тем хуже данные согласованы, и наоборт, более высокий уровень может снижать количество параллельных транзакций но данные лучше согласованы. 


### Важность транзакций

### Как работает аннотация @Transactional?

Spring динамически (если не настроено compile-time weaving) создает `Proxy` для классов, объявленных аннотацией `@Transactional`. Он имеет тот же тип что и целевой объект. Он позволяет накручивать дополнительные действия программы "до", "во время" и "после" вызовов методов обернутого собой объекта. 
В упрощённом варианте выглядит так: 

![proxy](/assets/images/proxy-1.jpg){: .align-center}

Это оборачивание происходит неявно. Другими словами, в промежуток между вызовом и работой метода добавляется дополнительные элементы цепочки в которых и осуществляется работа с транзакционностью.
На [картинке](https://docs.spring.io/spring-framework/docs/current/reference/html/images/tx.png)  из [документации](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html) это можно увидеть в более развёрнутом виде.

![spring_transactions](/assets/images/spring-transactions-1.png){: .align-center}

И в [статье](https://habr.com/ru/post/532000/) описано как это всё работает под капотом. 
 
#### Способы оборачивания
 
 При оборачивание с использованием Spring AOP, прокси могут создаваться через JDK или с CGLIB, а еще возможно, что CTW (compile-time weaving) и LTW (load-time weaving) подключили. Тут есть над чем задуматься. Развернутые ответы нашёл в этой [статье](https://habr.com/ru/post/347752/).

###
 
 





## Источники:
[Guide to Jakarta EE JTA - baeldung.com](https://www.baeldung.com/jee-jta)

[Транзакции в Spring Framework - Kirill Sereda на medium.com](https://medium.com/@kirill.sereda/%D1%82%D1%80%D0%B0%D0%BD%D0%B7%D0%B0%D0%BA%D1%86%D0%B8%D0%B8-%D0%B2-spring-framework-a7ec509df6d2)

[Data Access - Spring Framework Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html)

[Spring AOP. Маленький вопросик с собеседования - dmitryk100 на habr.com](https://habr.com/ru/post/347752/)

[@Transactional в Spring под капотом - pyltsinm на habr.com](https://habr.com/ru/post/532000/ )