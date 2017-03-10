const 
detect = require('detect-arguments'),
constants = require('./Constants'),
cache = require('./Cache'),
GeneratorPromise = require('./GeneratorPromise'),
contexts = cache.contexts,
DISMISSED = constants.DISMISSED,
JOIN = constants.JOIN,
DISMISS = constants.DISMISS,
STOP = constants.STOP;

class Context extends Promise {
    init (config={name,timeout,reject,resolve,fn,type}) {
        this._config = config;
        if (config.name !== undefined) {
            this.name(config.name);
        }
        if (config.type !== undefined) {
            this.type(config.type);
        }
        this._reject = config.reject;
        this._resolve = config.resolve;
    }
    then (...args) {
        const result = super.then(...args);
        result._reject = this._reject;
        result._resolve = this._resolve;
        result._name = this._name;
        result._type = this._type;
        result._config = this._config;
        return result;
    }
    catch (...args) {
        const result = super.catch(...args);
        result._reject = this._reject;
        result._resolve = this._resolve;
        result._name = this._name;
        result._type = this._type;
        result._config = this._config;
        return result;
    }
    name (name) {
        return arguments.length ? (this._name = name,this) : this._name;
    }
    type (type) {
        return arguments.length ? (this._type = type,this) : this._type;
    }
    join (...args) {
        cache.add(this);
        this.type(JOIN);
        this.call(...args);
        return this;
    }
    dismiss (...args) {
        cache.add(this);
        this.type(DISMISS);
        return this.call(...args);
    }
    stop (...args) {
        cache.add(this);
        this.type(STOP);
        this.call(...args);
        return this;
    }
    call (fn,timeout) {
        const 
        name = this._name,
        context = contexts[name],
        lock = context && ++context.lock;
        var promise;

        if (!fn) {
            throw INVALID_ARGUMENTS;
        } 

        if (fn.constructor.name === 'GeneratorFunction') {
            promise = new GeneratorPromise(fn);
        } else if (typeof fn === 'function') {
            promise = new Promise((resolve,reject) => {
                const do_promise = () => {
                    const active_context = contexts[name];
                    if (active_context !== context || lock !== active_context.lock) {
                        return;
                    }

                    const detector = detect({resolve,reject,context:this});
                    var result;
                    try {
                        result = fn(detector);
                    } catch (e) {
                        reject(ex);
                        return;
                    }
                    if (!detector.any()) {
                        if (result && result instanceof Promise) {
                            result.then(resolve).catch(reject);
                        } else {
                            resolve(result);
                        }
                    }
                };
                (process !== 'undefined' && !timeout) ? process.nextTick(do_promise) : setTimeout(do_promise,timeout|0);
            });
        } else if (fn instanceof Promise) {
            promise = fn;
        }

        const dispatch = (fnName,v) => {
            const active_context = contexts[name];
            if (active_context !== context || active_context.lock !== lock) {
                return;
            } 
            var promises = name !== undefined ? contexts[name] : this;
            contexts[name] && (delete contexts[name]);
            if (promises && (promises = promises.promises)) {
                if (Array.isArray(promises)) {
                    for (var i=0,ln=promises.length;i<ln;i++) {
                        promises[i][`_${fnName}`](v);
                    }
                } else {
                    promises[`_${fnName}`](v);
                }
            }
        };
        promise.then((v) => dispatch('resolve',v)).catch((v) => dispatch('reject',v));
        return this;
    }
}
module.exports = Context;
