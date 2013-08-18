# Rope library

A rope library for fast string splicing.
~10x faster than JS strings at doing small 5-char splices in a 200k string.

It's not really a rope though, it's an array of strings, not a binary tree. 

The Rope class implements all of the String prototype methods, so it can be used as a drop-in replacement for String.
Read the performance notes before you do though.


## Installation

  npm install rope


## What's this?

The rope data structure keeps the string in 5kB segments.
The data structure has no index for fast access so access is ~O(n/5k).

Splicing uses one access to find the insertion point, then splices the string into the segment at the insertion point.
Splicing potentially removes emptied segments and splits up the extended segment into 2.5k segments if needed.

Push pushes a string as a new segment to the rope.

toString joins the segments together and returns the resulting string.


## Performance notes

The rope structure helps with inserting and deleting data in the middle of large strings. 
Most of the other operations are slowed down by having to manage the rope structure.

Specifically, if you're handling strings less than 5k in size, the rope is going to slow you down.
The rope comes into its own when you're dealing with large strings. With 10k strings, 5-char splices are just ~1.5x faster on the rope. 
But with 1MB strings, the speedup is 340x.

The Rope class implements all of the String prototype methods. Some methods take advantage of the rope structure,
some are slowed down by the rope and some are slow convenience methods that cast to string for their operations.

Fast methods: splice, push, concat

Should be mostly unaffected: slice, substr, substring, trim, trimLeft, trimRight

Slowed down: charAt, charCodeAt, indexOf, lastIndexOf, to(Locale)?(Upper|Lower)Case

Slow methods: localeCompare, match, replace, search, split

In-place methods: splice, push, trimInPlace, trimLeftInPlace, trimRightInPlace, to(Locale)?(Upper|Lower)CaseInPlace


## Usage

    var r = new Rope(['Hello,', 'or', ' no']);
    r.push("!");
    r.splice(6, 5, ' World');
    r.toString();
    // "Hello, World!"
    r.slice(7).toString();
    // "World!"

    r.charAt(7);
    // "W"
    r.charCodeAt(7);
    // 87

    r.toUpperCase().toString();
    // "HELLO, WORLD!"
    r.toLowerCase().toString();
    // "hello, world!"

    new Rope("  foobar ").trim().toString();
    // "foobar"
    new Rope("  foobar ").trimLeft().toString();
    // "foobar "
    new Rope("  foobar ").trimRight().toString();
    // "  foobar"


    // Convenience methods (slow)

    // Replace does internally new Rope(r.toString().replace(...))
    r.replace(/[A-Z]/g, 'X').toString();
    // "Xello, Xorld!"

    // Ditto for match: r.toString().match(...)
    r.match(/\S+/g);
    // ["Hello,", "World!"]


## Test

    npm test


## Run benchmark

The benchmark does 100k small edit operations on a ~100 kB string.
It's intended to simulate a person typing into a document.

    npm run-script benchmark


## Possible performance improvements

- Cache toString results if you have read-heavy parts in your application.
- Speed up access (i.e. "get me the segment with the Nth character")
  - Maintain an index of segment positions, tree with subtree size as node value: log n to update, log n read
- Regexp engine that operates on ropes


License: MIT

(c) Ilmari Heikkinen 2013