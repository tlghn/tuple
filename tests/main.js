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
            "use strict";
            var keyA = tuple(1, 2, "a", "b");
            var keyB = tuple(1, 2, "a", "b");
            assert(keyA == keyB);
        });

        it('===', function () {
            "use strict";
            var keyA = tuple(1, 2, "a", "b");
            var keyB = tuple(1, 2, "a", "b");
            assert(keyA === keyB);
        });

        it('Object.is', function () {
            "use strict";
            var keyA = tuple(1, 2, "a", "b");
            var keyB = tuple(1, 2, "a", "b");
            assert(Object.is(keyA, keyB));
        });

        it('!=', function () {
            "use strict";
            var keyA = tuple(1, 2, "a", "b", "c");
            var keyB = tuple(1, 2, "a", "b");
            assert(keyA != keyB);
        });

        it('!==', function () {
            "use strict";
            var keyA = tuple(1, 2, "a", "b", "c");
            var keyB = tuple(1, 2, "a", "b");
            assert(keyA !== keyB);
        });

        it('!Object.is', function () {
            "use strict";
            var keyA = tuple(1, 2, "a", "b", "c");
            var keyB = tuple(1, 2, "a", "b");
            assert(!Object.is(keyA, keyB));
        });
    });

    describe('Usage in Map', function () {
        it('Map get/set', function () {
            var map = new Map();
            map.set(tuple(1, 2, 3, 4, 5), 'test');
            assert(map.get(tuple(1, 2, 3, 4, 5)) === 'test');
        });

        it('Map.has', function () {
            var map = new Map();
            map.set(tuple(1, 2, 3, 4, 5), 'test');
            assert(map.has(tuple(1, 2, 3, 4, 5)));
        });

        it('Map.delete', function () {
            var map = new Map();
            map.set(tuple(1, 2, 3, 4, 5), 'test');
            assert(map.delete(tuple(1, 2, 3, 4, 5)));
        });
    });
});