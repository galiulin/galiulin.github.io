---
title: "Pointer Chasing: Why a Linked List Loses to an Array Even Though Both Are O(n)"
description: "Swap a linked list for an array without touching the algorithm — and you get a speedup of several times. A JMH benchmark digs into why: cache misses, the dependency chain between reads, and just how much slower pointer chasing really is."
pubDate: 2026-08-26
lang: en
translationId: pointer-chasing
tags:
  - Java
  - Kotlin
  - Performance
  - JMH
  - Concurrency
featured: true
---

# What is pointer chasing

Swap a linked list for an array without touching the algorithm — and you get a speedup. Both structures give you O(n) traversal, but the CPU reads them very differently.

## Why a linked list is slow

`LinkedBlockingQueue` stores elements as a chain of nodes, and each node is a separate object on the heap. The address of the next node is only known after you've read the current node and its `next` field — it can't be computed ahead of time. The CPU can't load the next node until it has the current one. Memory accesses form a dependency chain and happen one after another, not in parallel.

Between the CPU and RAM sits a cache — small but fast memory right on the die. If the data you need is already there, that's a cache hit, and the read takes a handful of cycles. If it's not there, that's a cache miss: the CPU has to go to RAM, which is orders of magnitude slower than the cache.

The CPU has a hardware prefetcher — it watches the memory access pattern and pulls data into the cache ahead of time. That works great with an array: addresses are predictable, element N+1 sits right after element N. With a linked list the prefetcher is powerless: the next address is data, not arithmetic, and there's no way to predict it. Every hop through `next` is very likely a cache miss, and on a modern CPU a single miss costs on the order of hundreds of cycles of memory wait.

```kotlin
class Node(val value: Long, var next: Node? = null)

fun sumLinked(head: Node?): Long {
    var sum = 0L
    var n = head
    while (n != null) {
        sum += n.value   // we only learn the next node's address right now
        n = n.next
    }
    return sum
}

fun sumArray(values: LongArray): Long {
    var sum = 0L
    for (v in values) sum += v   // addresses are predictable in advance
    return sum
}
```

Both functions are linear in complexity. In practice, on large volumes of data `sumArray` outpaces `sumLinked` by several times — precisely because memory doesn't have to be waited on: the prefetcher manages to pull the data in before it's needed.

The approach of a flat array of preallocated events is exactly what Disruptor's Ring Buffer uses. Traversal for both the producer and the consumer is `sumArray`, not `sumLinked`. That kind of memory access is hardware-friendly.

## Checking the numbers

Everything above is a "textbook" summary, and it can easily turn out to be inaccurate in practice: modern allocators, the JIT, and the cache hierarchy don't always behave the way the diagrams suggest. So let's run a measurement: the same pair of functions, run through a warmed-up microbenchmark on real hardware.

Timing `System.currentTimeMillis()` around a loop is a bad idea: the first calls to a method are interpreted rather than JIT-compiled, GC can kick in mid-measurement, and a single run says nothing about variance. The tool for this is a microbenchmark harness (I used JMH), which:

- "warms up" the code several times (gives the JIT time to compile the hot path) before it starts timing anything;
- repeats the measurement many times across several separately started JVMs (forks), to average out and see the spread;
- can measure time down to the nanosecond and protects the benchmark from the compiler simply throwing away "useless" code that has no effect on anything (dead code elimination) — a classic trap in hand-rolled measurements.

Specific settings: 5 warmup iterations of 300 ms + 5 measurement iterations of 500 ms, repeated across 3 separate JVMs — that's 15 independent measurements per data point with a warmed-up JIT. Run on JDK 25 (plain OpenJDK), bytecode under the JIT, the way most Java/Kotlin code runs in production. Hardware: a MacBook Pro with Apple M2 Max — a P-core has 128 KB of L1 cache, the P-core cluster shares a 16 MB L2, and there's 32 GB of RAM.

The full benchmark sources are on GitHub: [`galiulin/jvm-benchmarks`](https://github.com/galiulin/jvm-benchmarks), module [`pointer-chasing/`](https://github.com/galiulin/jvm-benchmarks/tree/main/pointer-chasing). There you'll find the data structures and summation functions ([`PointerChasing.kt`](https://github.com/galiulin/jvm-benchmarks/blob/main/pointer-chasing/src/main/kotlin/io/github/galiulin/benchmarks/pointerchasing/PointerChasing.kt)), the JMH benchmark itself ([`PointerChasingBenchmark.java`](https://github.com/galiulin/jvm-benchmarks/blob/main/pointer-chasing/src/jmh/java/io/github/galiulin/benchmarks/pointerchasing/PointerChasingBenchmark.java)), correctness tests for the builders ([`PointerChasingTest.kt`](https://github.com/galiulin/jvm-benchmarks/blob/main/pointer-chasing/src/test/kotlin/io/github/galiulin/benchmarks/pointerchasing/PointerChasingTest.kt)), the raw results this post uses (`results/results.json` and `run.log`), and the [module README](https://github.com/galiulin/jvm-benchmarks/blob/main/pointer-chasing/README.md) with the exact command to reproduce the run.

### Beyond array and list — two more variants

To avoid conflating "cache miss" with "linked list in general," the measurement adds two more structures between the two extremes.

The first addition is a "friendly" linked list: the same `Node` nodes as before, but created and linked in the same order, first to last:

```kotlin
fun buildSequentialLinkedList(size: Int): Node {
    val nodes = Array(size) { Node(it.toLong()) }
    for (i in 0 until size - 1) nodes[i].next = nodes[i + 1]
    return nodes[0]
}
```

The allocator places objects created back-to-back almost right next to each other in memory — so the physical addresses of the nodes here are nearly as predictable as an array's. The only difference from an array is that each value still has to be fetched through an extra pointer hop.

The second addition is a shuffled list: the same nodes (created in the same order 0..N-1, sitting at the same addresses), but `next` now links them in random order — a single cycle built with a Fisher–Yates shuffle, so the traversal still visits every node exactly once.

```kotlin
fun buildShuffledLinkedList(size: Int, seed: Long): Node {
    val nodes = Array(size) { Node(it.toLong()) }
    val order = IntArray(size) { it }
    val random = Random(seed)
    for (i in size - 1 downTo 1) {           // Fisher–Yates shuffle
        val j = random.nextInt(i + 1)
        val tmp = order[i]; order[i] = order[j]; order[j] = tmp
    }
    for (i in 0 until size - 1) nodes[order[i]].next = nodes[order[i + 1]]
    return nodes[order[0]]
}
```

The Fisher–Yates shuffle is the standard way to get a random permutation of an array with no bias in the probabilities: a pass from the end of the array to the start, and at each step i the current element is swapped with a random element from the range 0..i inclusive. In one linear pass, any one of the N! possible orderings comes out with equal probability — unlike naive approaches such as "swap each element with a random other one," which in practice produce a skewed distribution.

Here it's needed not just for randomness, but so the traversal stays connected. The `order` array after shuffling is a permutation of the indices 0..N-1, and the code links the nodes with `next` references strictly in that order: `order[0] → order[1] → ... → order[N-1]`. That produces a single continuous path through all N nodes with no gaps and no repeats. If instead each node's `next` were assigned to a random other node independently, there'd be no such guarantee: the result could break into several separate cycles, some nodes might never be reachable from `head` at all, and others could end up inside a cycle that `sumLinked` would never exit. Fisher–Yates gives you randomly scattered addresses while still producing a list with exactly one pass through each node.

Here the address of the next node is no longer connected to the address of the current one in any way — this is pointer chasing, the thing described at the start of this piece.

The third addition is `ArrayList<Long>`. Formally this is also a flat array, but an array of references to objects: the numbers themselves are stored as boxed `Long`s, separate objects on the heap. It's an intermediate case: there's a dereference, but the physical layout is almost like the sequential list's, because the boxes are created back-to-back while the list is being filled.

Sizes were chosen to cross cache boundaries: 1,000 elements (a `long[]` of 8 KB — fits into L1 with room to spare), 100,000 (a `long[]` of 800 KB, nodes ≈3 MB — still fits into the 16 MB L2), and 10,000,000 (a `long[]` of 80 MB, nodes ≈320 MB — definitely larger than any cache on this machine).

### Results

Total time for one full traversal (nanoseconds per operation, ± is the half-width of the 99.9% confidence interval across 15 measurements):

|       size |                  array |          boxedArrayList |         linkedSequential |                 linkedShuffled |
| ---------: | ---------------------: | ----------------------: | -----------------------: | -----------------------------: |
|      1,000 |            276.6 ± 1.7 |             365.4 ± 1.9 |           1,760.0 ± 16.3 |                 1,767.1 ± 25.8 |
|    100,000 |       29,741.8 ± 256.5 |        42,790.5 ± 188.3 |      177,102.1 ± 2,220.1 |            604,718.1 ± 8,318.8 |
| 10,000,000 | 3,009,404.6 ± 31,933.9 | 5,638,869.1 ± 161,506.4 | 18,813,440.5 ± 203,512.8 | 1,079,262,844.5 ± 18,622,236.9 |

Per element (nanoseconds per element), the picture is clearer:

|       size | array | boxedArrayList | linkedSequential | linkedShuffled |
| ---------: | ----: | -------------: | ---------------: | -------------: |
|      1,000 |  0.28 |           0.37 |             1.76 |           1.77 |
|    100,000 |  0.30 |           0.43 |             1.77 |           6.05 |
| 10,000,000 |  0.30 |           0.56 |             1.88 |         107.93 |

### What it means

The main claim holds up, and then some. At 10 million elements, pointer chasing (`linkedShuffled`) is 359x slower than the array and 57x slower than the "friendly" list, despite all variants having the exact same O(n) complexity. The per-element gap between shuffled and sequential at this size is 107.93 − 1.88 ≈ 106 nanoseconds, and that's the pure cost of a single cache miss (a trip to RAM), with nothing else mixed in. At a clock speed of roughly 3.5–3.7 GHz, that's on the order of 370–390 cycles — a direct hit on the "hundreds of cycles" mentioned at the start.

But there's a nuance the original reasoning didn't cover. The ratio between the "friendly" list and the array stays flat at around 6–6.4x across all three sizes — both where the data clearly doesn't fit in cache and where 1,000 nodes fit entirely in L1. If this were purely about cache misses, that gap would grow with data size, the way it does for the shuffled variant. It doesn't. So the 6x penalty is the cost of the traversal's shape itself: to learn the next node's address, the CPU has to wait for the current one to finish loading first. It can't fire off several such reads in parallel and keep them "in flight" simultaneously, the way it can with array reads that are independent of each other. Even where the prefetcher isn't needed at all, because all the data is already hot in cache, the linked list still loses to the array by several times — purely because of the dependency chain between reads.

`ArrayList<Long>` is pointer chasing in a mild form. It also loses to the array, but by 25–87%, not by multiples, and the gap grows with data size (0.37 vs. 0.28 ns at 1,000 elements, 0.56 vs. 0.30 at 10 million). The reason is the same arithmetic: the value is boxed into a separate object, so each element costs two memory accesses — first for the reference in the array itself, then for the value inside the `Long`. As long as everything fits in cache, that second trip is almost always a hit; once the data outgrows the cache, it's increasingly a miss. The takeaway: speed comes down to how many independent memory accesses an element needs and how predictable their addresses are.

On small data there's barely any difference. At 1,000 elements, the "friendly" and shuffled lists are indistinguishable — 1,760 ns vs. 1,767 ns, that's measurement noise. The entire list of a thousand nodes (about 32 KB) fits into cache regardless of the order the nodes are linked in, so the address order literally has nothing to act on: there are no cache misses either way. The hundred-fold gap is an effect of large data volumes. On the small collections typical of backend work, the gap between a list and an array is 6x from the dependency chain — not the hundreds-fold gap that comes from the cache.
