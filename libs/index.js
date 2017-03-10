const JOIN = 'join',
DISMISS = 'dismiss',
STOP = 'stop',
Context = require('./context/Context'),
Reverse = require('./context/Reverse');


function get_context (type,_context,...args) {
    var i =0,j,ln,parts,part,strings,
    name,fn,timeout,context,resolve,reject;

    if (args && args.length) {
        if (Array.isArray(args[i])) {
            name = '';
            strings = args[i];
            parts = args.slice(i+1);
            for (i=0,j=0,ln=strings.length;i<ln;i++) {
                name += strings[i] + ((part = parts[j++]) !== undefined ? part : '');
            }
        } else {
            if (typeof args[i] === 'string' || typeof args[i] === 'symbol') {
                name = args[i++];
            } 
            if (typeof args[i] === 'function' || args[i] instanceof Promise) {
                fn = args[i++];
            } 
            timeout = args[i] | 0;
        }
    }

    context = new _context(function (res,rej) {
        resolve = res;
        reject = rej;
    });


    context.init({
        name,
        timeout,
        reject,
        resolve,
        fn,
        type
    });

    if (type && fn) {
        context[type](fn,timeout);
    }

    if (strings) {
        return  (...args) => context[type](...args);
    }

    return context;
};

function block (...args) {
    return get_context(DISMISS,Context,...args)
}
block.join = function (...args) {
    return get_context(JOIN,Context,...args)
};
block.stop = function (...args) {
    return get_context(STOP,Context,...args);
};
block.dismiss = function (...args) {
    return get_context(DISMISS,Context,...args);
};
block.reverse = function (...args) {
    return get_context(DISMISS,Reverse,...args);
};
block.reverse.join = block.join.reverse = function (...args) {
    return get_context(JOIN,Reverse,...args);
};
block.reverse.stop = block.stop.reverse = function (...args) {
    return get_context(STOP,Reverse,...args);
};
block.reverse.dismiss = block.dismiss.reverse = function (...args) {
    return get_context(DISMISS,Reverse,...args);
};

module.exports = block;


