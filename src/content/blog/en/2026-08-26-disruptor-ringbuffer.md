---
title: "Java LMAX Disruptor. Part 1: Preallocated RingBuffer"
description: "A regular queue allocates a new object for every message and puts pressure on the GC. We look at how the LMAX Disruptor preallocates the entire RingBuffer and reuses event objects, taking allocations out of the producer's hot path."
pubDate: 2026-08-26
lang: en
translationId: disruptor-ringbuffer
tags:
  - Java
  - Kotlin
  - Concurrency
  - Performance
draft: false
---

> Code examples are in Kotlin. The Disruptor is a Java library, but it's fully accessible from Kotlin through regular interop, and everything below applies 1:1 to Java code too. Only the syntax differs.

---

The same stream of messages on the same processor can process several times slower, just because of how the queue stores its elements in memory.

Take `LinkedBlockingQueue`. It creates a new wrapper node for every message. At high frequency, that's constant pressure on the GC: short-lived objects pile up in the young generation, the collector wakes up more often, and pauses grow. On top of that, each node lives in a linked list, and those nodes end up scattered across the heap. The processor chases pointers (pointer chasing) instead of reading memory sequentially, and cache misses eat up what should have been a fast read.

The Disruptor solves this by dropping allocations altogether. On startup, it allocates a `RingBuffer` of fixed size and fills it right away with event objects through an `EventFactory`. The producer doesn't create a new object per message. It gets an index into the buffer and mutates the object already sitting at that index. The buffer size has to be a power of two: that way the index is computed with `& (bufferSize - 1)` instead of `% bufferSize`, a bitwise operation is faster than integer division.

```kotlin
data class OrderEvent(var orderId: Long = 0)

val ringBuffer = RingBuffer.createSingleProducer(
    { OrderEvent() },
    1024 // power of two
)

ringBuffer.publishEvent { event, sequence ->
    event.orderId = orderId
}
```

`publishEvent` doesn't create an `OrderEvent`. It grabs the next slot and passes the existing object into the lambda. For as long as the producer runs, not a single new allocation happens in the hot path, and the data in the buffer sits contiguously instead of being scattered across the heap.

The result: predictable latency with no GC pauses, and sequential memory access instead of pointer chasing.

Pointer chasing is covered in more detail in a separate article: [Pointer chasing](https://galiulin.github.io/blog/pointer-chasing/).

Reusing objects creates its own problem: several threads now regularly write to memory regions that sit physically close to each other. In the next post, I'll dig into why this can slow code down several times over, even when the threads don't logically get in each other's way.
