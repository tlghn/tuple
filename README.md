# tuple
Reusable key generator especially for ES6's Map objects

### Installation
```
    npm i tupl --save
```

### Usage

```
    const tuple = require('tupl');
    var key = tuple(...args);
```

### Example

```
    const tuple = require('tupl');
    var map = new Map();
    map.set(tuple('some', 'key', 1.2345, true, this), {name: 'Test'});
    console.log(map.get(tuple('some', 'key', 1.2345, true, this)).name);
    // Output: Test
```
