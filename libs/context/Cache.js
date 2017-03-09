const constants = require('./Constants'),
JOIN = constants.JOIN,
STOP = constants.STOP,
DISMISS = constants.DISMISS,
DISMISSED = constants.DISMISSED;

class Cache {
    constructor () {
        this.contexts = {};
    }
    add (context) {
        var name = context._name,
        c;
        if (name !== undefined) {
            this.prune(name);
            if (c = this.contexts[name]) {
                if (typeof c.promises === 'undefined') {
                    c.promises = context;
                } else if (Array.isArray(c.promises)) {
                    c.promises.push(context);
                } else {
                    c.promises = [c.promises, context];
                }
            } else {
                this.contexts[name] = {
                    lock : 0,
                    promises : context
                };
            }
        }
    }
    prune (name) {
        var 
        context,
        promises,
        reduced,
        promise,
        type;
        if ((context = this.contexts[name]) && (promises=context.promises)) {
            reduced = [];
            if (Array.isArray(promises)) {
                for (var i=0,ln=promises.length;i<ln;i++) {
                    promise = promises[i];
                    type = promise._type;
                    if (type !== JOIN) {
                        type === DISMISS && promise._reject(DISMISSED);
                    } else {
                        reduced.push(promise);
                    }
                }
            } else {
                if (promises._type !== JOIN) {
                    promises._type === DISMISS && promises._reject(DISMISSED);
                } else {
                    reduced.push(promises);
                }
            }
            context.promises = reduced;
        }
    }
}

module.exports = new Cache();
