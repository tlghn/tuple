/**
 * Created by tolgahan on 04.11.2016.
 */
const chai = require('chai');
const assert = chai.assert;
const tupl = require('../');

"use strict";

describe('Main', function () {

    describe('Keys', function () {
        it('Should create undefined key', function () {
            assert(tupl() === void 0);
        });

        it('Should return exact passed value for single key requests', function () {
            assert(tupl(1) === 1);
            assert(tupl(true) === true);
            assert(tupl(false) === false);
            assert(tupl(null) === null);
            assert(tupl(void 0) === void 0);
            assert(tupl('test') === 'test');
            var obj = {};
            assert(tupl(obj) === obj);
        });

        it('namespace bound generator', function () {
            const ns1 = Symbol('ns1');
            const ns2 = Symbol('ns2');
            const ns1Tupl = tupl.create(ns1);
            const ns2Tupl = tupl.create(ns2);

            var ns1Key = ns1Tupl(1, 2, 3);
            var ns2Key = ns2Tupl(1, 2, 3);

            assert(ns1Key !== ns2Key);

            ns1Key.destroy();
            ns2Key.destroy();
        });

    });

    describe('Equality Comparison', function () {
        it('==', function () {
            var keyA = tupl(1, 2, "a", "b");
            var keyB = tupl(1, 2, "a", "b");
            assert(keyA == keyB);
            keyA.destroy();
        });

        it('===', function () {
            var keyA = tupl(1, 2, "a", "b");
            var keyB = tupl(1, 2, "a", "b");
            assert(keyA === keyB);
            keyA.destroy();
        });

        it('Object.is', function () {
            var keyA = tupl(1, 2, "a", "b");
            var keyB = tupl(1, 2, "a", "b");
            assert(Object.is(keyA, keyB));
            keyA.destroy();
        });

        it('!=', function () {
            var keyA = tupl(1, 2, "a", "b", "c");
            var keyB = tupl(1, 2, "a", "b");
            assert(keyA != keyB);
            keyA.destroy();
        });

        it('!==', function () {
            "use strict";
            var keyA = tupl(1, 2, "a", "b", "c");
            var keyB = tupl(1, 2, "a", "b");
            assert(keyA !== keyB);
            keyA.destroy();
            keyB.destroy();
        });

        it('!Object.is', function () {
            "use strict";
            var keyA = tupl(1, 2, "a", "b", "c");
            var keyB = tupl(1, 2, "a", "b");
            assert(!Object.is(keyA, keyB));
            keyA.destroy();
            keyB.destroy();
        });
    });

    describe('Usage in Map', function () {
        it('Map get/set', function () {
            var map = new Map();
            map.set(tupl(1, 2, 3, 4, 5), 'test');
            assert(map.get(tupl(1, 2, 3, 4, 5)) === 'test');
            tupl(1, 2, 3, 4, 5).destroy();
        });

        it('Map.has', function () {
            var map = new Map();
            map.set(tupl(1, 2, 3, 4, 5), 'test');
            assert(map.has(tupl(1, 2, 3, 4, 5)));
            tupl(1, 2, 3, 4, 5).destroy();
        });

        it('Map.delete', function () {
            var map = new Map();
            map.set(tupl(1, 2, 3, 4, 5), 'test');
            assert(map.delete(tupl(1, 2, 3, 4, 5)));
            tupl(1, 2, 3, 4, 5).destroy();
        });
    });

    describe('destroy()', function () {
        
        it('New key will be created for the same target when destroy called on previously created key', function () {
            var keyA = tupl(1, 2, 3);
            keyA.destroy();
            var keyB = tupl(1, 2, 3);
            assert(keyA !== keyB);
            keyB.destroy();
        });

        it('Key ancestors will be destroyed in case there are no more children or ref', function () {
            let key4 = tupl(1, 2, 3, 4);
            let key1 = key4.parent.parent.parent;
            assert(key1.destroyed === false);
            key4.destroy();
            assert(key1.destroyed === true);
        });

        it('Key ancestors will not be destroyed if current key has ref', function () {
            let key4 = tupl(1, 2, 3, 4);
            let key3 = tupl(1, 2, 3);
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

    describe('tupl.keys()', function () {
        it('Method will return used keys only', function () {
            let key4 = tupl(1, 2, 3, 4);
            let keys = [...tupl.keys()];

            assert(keys.length === 1);
            assert(keys[0] === key4);
        });

        it('Method will return used keys in argument order', function () {
            
            let key4 = tupl(1, 2, 3, 4);
            let key3 = tupl(1, 2, 3);
            let keys = [...tupl.keys()];

            assert(keys.length === 2);
            assert(keys[0] === key3);
            assert(keys[1] === key4);
        })
    });
    
    describe('Events', function () {
        it('destroy', function (done) {
            var key = tupl(1, 2, 3);
            key.root.on('destroy', function (eventTarget) {
                assert(eventTarget.raw === 1);
                done();
            });
            key.destroy();
        });

        it('ref', function (done) {
            var key = tupl(1, 2, 3);
            key.parent.on('ref', function (eventTarget) {
                assert(eventTarget.raw === 2);
                done();
                eventTarget.destroy();
                key.destroy();
            });
            tupl(1, 2);
        });
        
        it('descendant', function (done) {
            var key = tupl(1, 2);
            key.root.on('descendant', function (newRef, eventTarget) {
                assert(newRef.raw === 5);
                assert(eventTarget.raw === 1);
                done();
                key.destroy();
                newRef.destroy();
            });
            
            tupl(1, 2, 3, 4, 5);
        });

        it('ancestor', function (done) {
            var key = tupl(1, 2, 3, 4, 5);
            key.on('ancestor', function (newRef, eventTarget) {
                assert(newRef.raw === 3);
                assert(eventTarget.raw === 5);
                done();
                eventTarget.destroy();
                newRef.destroy();
            });

            tupl(1, 2, 3);
        });
    });
});