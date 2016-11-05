/**
 * Created by tolgahan on 04.11.2016.
 */

"use strict";
const RAW = Symbol('raw');
const PARENT = Symbol('parent');
const REF = Symbol('ref');
const EVENTS = Symbol('events');
const CACHE = new Map();
const EE = require('events');

class Key extends Map {
    constructor(parent, key){
        super();
        this[RAW] = key;
        this[PARENT] = parent;
    }

    /**
     * @returns Key
     */
    get parent(){
        return this[PARENT];
    }

    get raw(){
        return this[RAW];
    }

    /**
     *
     * @returns {Key}
     * @private
     */
    _ref(){
        this[REF] = true;
        this.emit('ref');
        for(let p of this.ancestors()){
            p.emit('descendant', this);
        }
        for(let c of this.descendants()) {
            c.emit('ancestor', this);
        }
        return this;
    }

    /**
     *
     * @returns {Key}
     * @private
     */
    _unRef(){
        delete this[REF];
        return this;
    }

    /**
     *
     * @returns {boolean}
     */
    get hasRef(){
        return !!this[REF];
    }

    *children(){
        for(let child of this.values()){
            if(child instanceof Key) {
                yield child;
            }
        }
    }

    /**
     *
     * @returns {boolean}
     */
    get hasChildren(){
        return !!this.children().next().value;
    }

    delete(key){
        var result = super.delete(key);
        if(result && !this.hasChildren && !this.hasRef){
            this.destroy();
        }
        return result;
    }

    destroy(){
        this.emit('destroy')
            .off()
            ._unRef().parent.delete(this.raw);
        delete this[PARENT];
        delete this[RAW];
        delete this[EVENTS];
    }

    /**
     *
     * @returns {boolean}
     */
    get destroyed(){
        return !this[PARENT];
    }

    get root(){
        var parent = this.parent;
        if(!(parent instanceof Key)){
            return this;
        }
        return parent.root;
    }

    *ancestors() {
        var parent = this.parent;
        if(!(parent instanceof Key)){
            return;
        }
        yield parent;
        for(let grandPa of parent.ancestors()){
            yield grandPa;
        }
    }

    *descendants() {
        for(let child of this.children()){
            yield child;

            for(let grandChild of child.descendants()) {
                yield grandChild;
            }
        }
    }

    /**
     * @returns EE
     */
    get events(){
        return this[EVENTS] || (this[EVENTS] = new EE());
    }

    on(name, callback){
        this.events.on(name, callback);
        return this;
    }

    once(name, callback) {
        this.events.once(name, callback);
        return this;
    }

    off(name = void 0, callback = void 0){
        if(!this[EVENTS]){
            return this;
        }

        if(name){
            if(callback){
                this.events.removeListener(name, callback);
            } else {
                this.events.removeAllListeners(name, callback);
            }
        } else {
            this.events.removeAllListeners();
        }

        return this;
    }

    emit() {
        if(!this[EVENTS]) {
            return this;
        }

        var events = this.events;
        var args = Array.prototype.slice.call(arguments);
        if(!args.length || args[args.length - 1] !== this){
            args.push(this);
        }
        events.emit.apply(events, args);
        return this;
    }
}

/**
 * @callback build
 * @returns Key
 */
function build(ns) {
    var args = Array.prototype.slice.call(arguments, 1);
    if (args.length < 2) {
        return args[0];
    }
    return args.reduce(function (prev, cur) {
        if (prev.has(cur)) {
            return prev.get(cur);
        }
        var key = new Key(prev, cur);
        prev.set(cur, key);
        return key;
    }, CACHE.get(ns))._ref();
}

function *getKeys(key) {
    if(key.hasRef) {
        yield key;
    }

    for(let child of key.children()){
        for(let grandChild of getKeys(child)){
            yield grandChild;
        }
    }
}

function create(ns) {
    if(!CACHE.has(ns)){
        CACHE.set(ns, new Map());
    }
    return build.bind(null, ns);
}

/**
 * @var {build} callback
 */
var tuple = create();

tuple.create = create;
tuple.Key = Key;
tuple.keys = function *(ns) {
    if(!CACHE.has(ns)){
        return;
    }
    for(let key of CACHE.get(ns).values()) {
        for(let value of getKeys(key)){
            yield value;
        }
    }
};

module.exports = tuple;