module.exports = function Generator (generator) {
    var resolve,reject;
    const gen = new GeneratorPromise((res,rej) => {
        resolve = res;
        reject = rej;
    });
    gen.init({
        resolve,
        reject,
        generator
    });
    return gen;
}

class GeneratorPromise extends Promise {
    init ({resolve,reject,generator}) {
        var error_cnt = 0;
        const it = generator(),
        errors = [],
        results = [],
        step = () => {
            var result;
            try {
                result = it.next();
            } catch (err) {
                error_cnt++;
                errors.push(err);
                results.push(null);
                next({done:true});
                return;
            }
            if (result.value instanceof Promise) {
                result.value.then((value) => {
                    results.push(value);
                    errors.push(null);
                    next(result);
                }).catch((err) => {
                    error_cnt++;
                    errors.push(err);
                    results.push(null);
                    next(result);
                });
            } else {
                results.push(result.value);
                errors.push(null);
                next(result);
            }
        },
        next = (result) => {
            if (!result.done) {
                if (typeof process !== 'undefined') {
                    process.nextTick(step);
                } else {
                    setTimeout(step);
                }
            } else if (error_cnt) {
                reject(errors);
            } else {
                resolve(results);
            }
        };
        step();
    }
}
