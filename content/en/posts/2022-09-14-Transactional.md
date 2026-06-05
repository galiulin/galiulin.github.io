---
title: "@Transactional"
date: 2022-09-14
description: "A breakdown of Spring's @Transactional annotation: transactions, ACID isolation levels, dirty reads and phantom phenomena, and the Proxy mechanism."
tags:
  - Transactional
  - Hibernate
  - Spring Data JPA
  - Java
---
## What is this article about?

- Understanding what transactions are and why they matter
- A detailed look at the `@Transactional` annotation and its properties

## Where does it usually start?

A developer writes a program, uses a database, connects a data source — be it REST or Kafka — and barely anyone thinks about multithreading and concurrency. As the load grows, they start noticing that data in some cases no longer matches reality and business requirements. Let's explore the possible problems and how to solve them.

### JTA

Java Transaction API, better known as JTA, is an API for transaction management in Java. It supports starting (start), committing (commit), and rolling back (rollback) transactions in a resource-agnostic way.

The true power of JTA lies in its ability to manage multiple resources (e.g., databases, messaging services) within a single transaction.

### Transaction

A transaction is a group of sequential database operations that represents a logical unit of work with data. A transaction must either complete fully and successfully, **preserving data integrity** and **independent of** concurrently running **other transactions**, or not execute at all — in which case it must produce no effect. [wikipedia.org](https://en.wikipedia.org/wiki/Database_transaction)

## Transaction requirements

These are defined by the [ACID](https://en.wikipedia.org/wiki/ACID) set. I'll focus on `I` — `Isolation`, since that requirement is directly relevant to our topic.

## Isolation

During the execution of a transaction, concurrent transactions must not affect its result. Full isolation is an expensive requirement, so isolation levels exist that define to what degree inconsistent data is allowed.

### Isolation levels and phenomena

Each subsequent level is designed to solve the problem of the previous one. There are four levels in total.

#### Read Uncommitted — Dirty read

The level with the worst data consistency but the highest speed. Each transaction sees the uncommitted changes of another transaction, which may subsequently be rolled back.

#### Read Committed — Non-repeatable read and phantom reads

Concurrently executed transactions only see the committed changes of other transactions. Protects against dirty reads. The following phenomena can still occur:

1. **Non-repeatable read** — when re-reading within the same transaction, previously read data has changed.

| Transaction 1 | Transaction 2 |
|---|---|
| | SELECT f2 FROM tbl1 WHERE f1=1; |
| UPDATE tbl1 SET f2=f2+3 WHERE f1=1; | |
| COMMIT | |
| | SELECT f2 FROM tbl1 WHERE f1=1; |

2. **Phantom read** — when re-reading, the same query returns a different set of rows.

| Transaction 1 | Transaction 2 |
|---|---|
| | SELECT SUM(f2) FROM tbl1; |
| INSERT INTO tbl1 (f1,f2) VALUES (15,20); | |
| COMMIT | |
| | SELECT SUM(f2) FROM tbl1; |

#### Repeatable Read

A reading transaction does not "see" changes to data it has already read. Prevents the non-repeatable read phenomenon. Rows inserted by another transaction are still visible. ([psql](https://www.postgresql.org/docs/current/transaction-iso.html), [mysql](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_repeatable_read))

#### Serializable

The highest isolation level — transactions are completely isolated from each other, each executing as if no concurrent transactions exist.

## How does @Transactional work?

Spring dynamically creates a `Proxy` for classes annotated with `@Transactional`. This proxy allows additional actions to be wired "before", "during", and "after" calls to methods of the wrapped object.

When wrapping using Spring AOP, proxies can be created via JDK or CGLIB. Detailed answers in this [article](https://habr.com/ru/post/347752/).

## Sources

- [Guide to Jakarta EE JTA — baeldung.com](https://www.baeldung.com/jee-jta)
- [Transactions in Spring Framework — Kirill Sereda on medium.com](https://medium.com/@kirill.sereda/%D1%82%D1%80%D0%B0%D0%BD%D0%B7%D0%B0%D0%BA%D1%86%D0%B8%D0%B8-%D0%B2-spring-framework-a7ec509df6d2)
- [Data Access — Spring Framework Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html)
- [Spring AOP — habr.com](https://habr.com/ru/post/347752/)
- [@Transactional in Spring under the hood — habr.com](https://habr.com/ru/post/532000/)
- [Transaction isolation levels — wikipedia.org](https://en.wikipedia.org/wiki/Isolation_(database_systems))
