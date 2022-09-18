---
title: "Использование jsonb в Hibernate 6"

last_modified_at: 2022-09-18T15:28:00+03:00

tags:
  - Transactional
  - Hibernate
  - Spring Data JPA
---
В Hibernate 6 был реализован [маппинг JSON](https://docs.jboss.org/hibernate/orm/6.1/userguide/html_single/Hibernate_User_Guide.html#basic-mapping-json). Всё, что теперь требуется, над полем со своей сущностью, проставить аннотацию @JdbcTypeCode и установить тип SqlTypes.JSON.

Пример с полем типа Map:

```java
class Example {
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> payload;
}
```

Пример с своим классами: 
`SomeEntity` с полем типа `SomeJson`
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

на [habr вышла статья про это](https://habr.com/ru/company/otus/blog/688714/),
для более ранних версий рекомендуют ознакомиться с библиотекой [hibernate-types](https://github.com/vladmihalcea/hibernate-types).
Как-то давно, где-то  я её использовал, вот только не помню где 
