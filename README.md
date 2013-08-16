# Rope library

A rope library for fast string splicing.
~10x faster than JS strings at doing small 5-char splices in a 200k string.
~30-300x faster on 500k strings.

The rope data structure keeps the string in 5kB segments.
The data structure has no index for fast access so access is ~O(n/5k).

Splicing uses one access to find the insertion point, then splices the string into the segment at the insertion point.
Splicing potentially removes emptied segments and splits up the extended segment into 2.5k segments if needed.

Push pushes a string as a new segment to the rope.

toString joins the segments together and returns the resulting string.


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


    // Convenience methods (slow)

    // Replace does internally new Rope(r.toString().replace(...))
    r.replace(/[A-Z]/g, 'X').toString();
    // "Xello, Xorld!"

    // Ditto for match: r.toString().match(...)
    r.match(/\S+/g);
    // ["Hello,", "World!"]


## Test

    node -e 'require("./rope").test()';


## Possible improvements:

- Cache toString results if you have read-heavy parts in your application.
- Speed up access
  - Maintain an index of segment positions
    - Tree with subtree size as node value: log n to update, log n read
- Regexp engine :|


License: MIT

(c) Ilmari Heikkinen 2013