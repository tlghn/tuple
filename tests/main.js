/**
 * Created by tolgahan on 04.11.2016.
 */
const chai = require('chai');
const assert = chai.assert;
const tuple = require('../');

"use strict";

describe('Main', function () {

    describe('Keys', function () {
        it('Should create undefined key', function () {
            assert(tuple() === void 0);
        });

        it('Should return exact passed value for single key requests', function () {
            assert(tuple(1) === 1);
            assert(tuple(true) === true);
            assert(tuple(false) === false);
            assert(tuple(null) === null);
            assert(tuple(void 0) === void 0);
            assert(tuple('test') === 'test');
            var obj = {};
            assert(tuple(obj) === obj);
        });
    });

    describe('Equality Comparison', function () {
        it('==', function () {
            var keyA = tuple(1, 2, "a", "b");
            var keyB = tuple(1, 2, "a", "b");
            assert(keyA == keyB);
            keyA.destroy();
        });

        it('===', function () {
            var keyA = tuple(1, 2, "a", "b");
            var keyB = tuple(1, 2, "a", "b");
            assert(keyA === keyB);
            keyA.destroy();
        });

        it('Object.is', function () {
            var keyA = tuple(1, 2, "a", "b");
            var keyB = tuple(1, 2, "a", "b");
            assert(Object.is(keyA, keyB));
            keyA.destroy();
        });

        it('!=', function () {
            var keyA = tuple(1, 2, "a", "b", "c");
            var keyB = tuple(1, 2, "a", "b");
            assert(keyA != keyB);
            keyA.destroy();
        });

        it('!==', function () {
            "use strict";
            var keyA = tuple(1, 2, "a", "b", "c");
            var keyB = tuple(1, 2, "a", "b");
            assert(keyA !== keyB);
            keyA.destroy();
            keyB.destroy();
        });

        it('!Object.is', function () {
            "use strict";
            var keyA = tuple(1, 2, "a", "b", "c");
            var keyB = tuple(1, 2, "a", "b");
            assert(!Object.is(keyA, keyB));
            keyA.destroy();
            keyB.destroy();
        });
    });

    describe('Usage in Map', function () {
        it('Map get/set', function () {
            var map = new Map();
            map.set(tuple(1, 2, 3, 4, 5), 'test');
            assert(map.get(tuple(1, 2, 3, 4, 5)) === 'test');
            tuple(1, 2, 3, 4, 5).destroy();
        });

        it('Map.has', function () {
            var map = new Map();
            map.set(tuple(1, 2, 3, 4, 5), 'test');
            assert(map.has(tuple(1, 2, 3, 4, 5)));
            tuple(1, 2, 3, 4, 5).destroy();
        });

        it('Map.delete', function () {
            var map = new Map();
            map.set(tuple(1, 2, 3, 4, 5), 'test');
            assert(map.delete(tuple(1, 2, 3, 4, 5)));
            tuple(1, 2, 3, 4, 5).destroy();
        });
    });

    describe('destroy()', function () {
        
        it('New key will be created for the same target when destroy called on previously created key', function () {
            var keyA = tuple(1, 2, 3);
            keyA.destroy();
            var keyB = tuple(1, 2, 3);
            assert(keyA !== keyB);
            keyB.destroy();
        });

        it('Key ancestors will be destroyed in case there are no more children or ref', function () {
            let key4 = tuple(1, 2, 3, 4);
            let key1 = key4.parent.parent.parent;
            assert(key1.destroyed === false);
            key4.destroy();
            assert(key1.destroyed === true);
        });

        it('Key ancestors will not be destroyed if current key has ref', function () {
            let key4 = tuple(1, 2, 3, 4);
            let key3 = tuple(1, 2, 3);
            let key2 = key3.parent;
            let key1 = key2.parent;

            assert(key4.destroyed === false);
            assert(key3.destroyed === false);
            assert(key2.destroyed === false);
            assert(key1.destroyed === false);

            key4.destroy();

            assert(key4.destroyed === true);
            assert(key3.destroyed === false);
            assert(key2.destroyed === false);
            assert(key1.destroyed === false);

            key3.destroy();

            assert(key4.destroyed === true);
            assert(key3.destroyed === true);
            assert(key2.destroyed === true);
            assert(key1.destroyed === true);
        });
    });

    describe('tuple.keys()', function () {
        it('Method will return used keys only', function () {
            let key4 = tuple(1, 2, 3, 4);
            let keys = [...tuple.keys()];

            assert(keys.length === 1);
            assert(keys[0] === key4);
        });

        it('Method will return used keys in argument order', function () {
            
            let key4 = tuple(1, 2, 3, 4);
            let key3 = tuple(1, 2, 3);
            let keys = [...tuple.keys()];

            assert(keys.length === 2);
            assert(keys[0] === key3);
            assert(keys[1] === key4);
        })
    });
});