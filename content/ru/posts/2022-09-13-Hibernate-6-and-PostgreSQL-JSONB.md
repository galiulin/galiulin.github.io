---
title: "Использование jsonb в Hibernate 6"
date: 2022-09-13
description: "Как работать с типом JSONB в PostgreSQL через Hibernate 6: аннотация @JdbcTypeCode, маппинг Map и кастомных классов."
tags:
  - Hibernate
  - Spring Data JPA
  - PostgreSQL
  - Java
---
В Hibernate 6 был реализован [маппинг JSON](https://docs.jboss.org/hibernate/orm/6.1/userguide/html_single/Hibernate_User_Guide.html#basic-mapping-json). Всё, что теперь требуется — над полем со своей сущностью проставить аннотацию `@JdbcTypeCode` и установить тип `SqlTypes.JSON`.

Пример с полем типа Map:

```java
class Example {
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> payload;
}
```

Пример с своими классами — `SomeEntity` с полем типа `SomeJson`:

```java
//file SomeEntity.java
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;

@Data
@Entity
public class SomeEntity {

    @Id
    @GeneratedValue
    private Long id;

    @JdbcTypeCode(SqlTypes.JSON)
    private SomeJson jsonField;
}
```

```java
//file SomeJson.java
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SomeJson implements Serializable {
    private Long longValue;
    private String stringValue;
    private Map<String, String> customValues;
}
```

#### upd:

На [habr вышла статья про это](https://habr.com/ru/company/otus/blog/688714/),
для более ранних версий рекомендуют ознакомиться с библиотекой [hibernate-types](https://github.com/vladmihalcea/hibernate-types).
