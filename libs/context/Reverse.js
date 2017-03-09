const 
Context = require('./Context'),
cache = require('./Cache'),
constants = require('./Constants'),
contexts = cache.contexts,
DISMISSED = constants.DISMISSED,
JOIN = constants.JOIN;


class Reverse extends Context {
    join (...args) {
        var name = this._name,
        context;
        if ((context=contexts[name]) && (context.promises)) {
            this.type(JOIN);
            cache.add(this);
            return this;
        } 
        return super.join(...args);
    }
    dismiss (...args) {
        if (contexts[this._name]) {
            this._reject(DISMISSED);
            return this;
        } 
        return super.dismiss(...args);
    }
    stop (...args) {
        if (contexts[this._name]) {
            return this;
        } 
        return super.stop(...args);
    }
    call (...args) {
        return super.call(...args);
    }
}
module.exports = Reverse;
