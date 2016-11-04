/**
 * Created by tolgahan on 04.11.2016.
 */
"use strict";
const CACHE = new Map();

module.exports = function () {
    if (arguments.length < 2) {
        return arguments[0];
    }
    return Array.prototype.reduce.call(arguments, function (prev, cur) {
        if (prev.has(cur)) {
            return prev.get(cur);
        }
        var map = new Map();
        prev.set(cur, map);
        return map;
    }, CACHE);
};