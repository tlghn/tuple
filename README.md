# tupl
Reusable key generator especially for ES6's Map objects

### Installation
```
    npm i tupl --save
```

### Usage

```
    const tupl = require('tupl');
    var key = tupl(...args);
```

### Example

```
    const tupl = require('tupl');
    var map = new Map();
    map.set(tupl('some', 'key', 1.2345, true, this), {name: 'Test'});
    console.log(map.get(tupl('some', 'key', 1.2345, true, this)).name);
    // Output: Test
```

### tupl API

- ***tupl(...args)***
    Returns input dependent unique key for passed arguments
    
    ```
        var key1 = tupl(1, 2, 3);
        var key2 = tupl(1, 2, 3);
        var key3 = tupl(1, 2, 3, 4);
        
        assert(key1 === key2);
        assert(key1 !== key3);
    ```

- ***tupl.create(ns)***
    Creates a namespace bounded tupl generator. 
    - @param ns: This parameter accepts all kind of types (such as number, string, symbol, object or array instances, ...etc).
    When ns is `undefined` then it returns global tupl generator.
    
    ```
        const CUSTOM_NAMESPACE = Symbol('SomeCustomValue');
        var myTupl = tupl.create(CUSTOM_NAMESPACE);
        
        assert(tupl('a') !== myTupl('a'));
    ```
    
    > Since I've added destroy() feature to Key API, it may cause some unwanted issues between modules which used *tupl* on runtime.
    So, if you decided to use tupl on your own npm module, I highly recommend using a namespace bounded tupl generator.
    
- ***tupl.keys(ns)***
    Returns an iterator whic iterates used keys in given namespace
    When ns is `undefined` then it returns keys of global tupl generator.
    
    ```
        const CUSTOM_NAMESPACE = Symbol('SomeCustomValue');
        var myTupl = tupl.create(CUSTOM_NAMESPACE);
        
        var key1 = tupl(1);
        var key2 = tupl(1, 'a');
        
        var myKey1 = myTupl(1, 'a', 'b'); 
        
        var keys = [...tupl.keys()];
        var myKeys = [...tupl.keys(CUSTOM_NAMESPACE)];
        
        assert(keys.length === 2);
        assert(keys[0] === key1);
        assert(keys[1] === key2);
        
        assert(myKeys.length === 1);
        assert(myKeys[0] === myKey1);
    ```

### Key API

```
    const tupl = require('tupl');
    let key = tupl('a', 'b', 'c', 'd');
```


- Event '***destroy***' *(new in 1.2)*
    Emitted when key is destroyed
    
    ```
    var key = tupl(1, 2, 3);
    key.root.on('destroy', function (eventTarget) {
        assert(eventTarget.raw === 1);
        done();
    });
    key.destroy();
    ```
    
- Event '***ref***' *(new in 1.2)*
    Emitted when key is generated 
    ```
    var key = tupl(1, 2, 3);
    key.parent.on('ref', function (eventTarget) {
        assert(eventTarget.raw === 2);
        done();
        eventTarget.destroy();
        key.destroy();
    });
    tupl(1, 2);
    ```
    
- Event '***descendant***' *(new in 1.2)*
    Emitted when sub key is generated
    ```
    var key = tupl(1, 2);
    key.root.on('descendant', function (newRef, eventTarget) {
        assert(newRef.raw === 5);
        assert(eventTarget.raw === 1);
        done();
        key.destroy();
        newRef.destroy();
    });
    
    tupl(1, 2, 3, 4, 5);
    ```
    
- Event '***ancestor***' *(new in 1.2)*
    Emitted when one of ancestors is generated
    ```
    var key = tupl(1, 2, 3, 4, 5);
    key.on('ancestor', function (newRef, eventTarget) {
        assert(newRef.raw === 3);
        assert(eventTarget.raw === 5);
        done();
        eventTarget.destroy();
        newRef.destroy();
    });

    tupl(1, 2, 3);
    ```

- key.***root*** *(new in 1.2)*
    Returns the root key

- key.***events*** *(new in 1.2)*
    Returns attached EventEmitter instance
    
- key.***on(name, callback)*** *(new in 1.2)*
    Adds an event listener
    
- key.***once(name, callback)*** *(new in 1.2)*
    Adds an event listener for one time call
    
    
- key.***off(name = undefined, callback = undefined)*** *(new in 1.2)*
    - if @name and @callback parameters are defined then removes specific listener
    - if only @name is defined then removes all @name listeners 
    - if none of both parameters are undefined then removes all attached event listeners

    
- key.***ancestors()*** *(new in 1.2)*
    Returns an iterator which iterates the ancestors (parent, parent.parent, ...)
    
- key.***descendants()*** *(new in 1.2)*
    Returns an iterator which iterates the descendants (children(), children().children(), ...)

- key.***parent***
    Returns the parent key. 
    
- key.***raw***
    Refers to given argument

    ``console.log(key.raw)`` Output: d
    ``console.log(key.parent.raw)`` Output: c

- key.***destroy()***
    Destroys the current key and its unreferenced ancestors.
    
    - **Unreferenced ancestor example**
    ```
        let parent = key.parent;
        key.destroy();
        assert(key.destroyed);
        assert(parent.destroyed);
    ```
    - **Referenced ancestor example**
    ```
        let parent = key.parent;
        let key2 = tupl('a', 'b', 'c');
        key.destroy();
        assert(parent === key2);
        assert(key.destroyed);
        assert(!parent.destroyed);
    ``` 
    
- key.***destroyed***
    returns true if current key is destroyed
    
- key.***children()***
    returns an iterator which iterates the referenced child keys
    
    ```
        let parent = tupl('a');
        let used = tupl('a', 'b', 'c', 'd');
        let otherUsed = tupl('a', 'b', 'c', 'd', 'e', 'f');
        let children = [...parent.children()];

        assert(children.length === 2);
        assert(children[0] === used);
        assert(children[1] === otherUsed);
    ``` 


- key.***hasRef***
    returns true if key is generated directly;

    ```
        let used = tupl('a', 'b', 'c', 'd');
        let parentParent = tupl('a', 'b');
        
        assert(used.hasRef);
        assert(!used.parent.hasRef);
        assert(used.parent.parent === parentParent);
        assert(used.parent.parent.hasRef);
    ``` 




### Notes
*Please see tests for other examples*

### Change Log
- 1.1.0 New API features 
- 1.0.0 Initial release