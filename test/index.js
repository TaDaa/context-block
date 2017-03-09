const block = require('../libs'),
constants = require('../libs/context/Constants'),
DISMISSED = constants.DISMISSED,
assert = require('assert'),
expect = {
    success : function (a,done,optionalFn) {
        return {
            then : (b) => {
                assert(a === b);
                optionalFn && optionalFn();
                done();
            },
            catch : () => assert(false)
        };
    },
    failure : function (a,done,optionalFn) {
        return {
            then : () => assert(false),
            catch : (b) => {
                assert(a === b);
                optionalFn && optionalFn();
                done();
            }
        };
    }
};

function resolve (obj,...names) {
    for (var i=0,ln=names.length;i<ln;i++) {
        obj = obj[names[i]];
    }
    return obj;
}

function test (...name) {
    return {
        async : ({each}) => test_async({name,each}),
        generator : ({each}) => test_generator({name,each}),
        detect : ({each}) => test_detect({name,each}),
        collision : ({each}) => test_collision({name,each}),
        nocollision : ({each}) => test_nocollision({name,each})
    };
}

function test_async ({name,each}) {
    describe('test async',function () {
        function test_expectations (type) {
            it('works with undefined result',function (next) {
                const expected = expect[type](undefined,next);
                resolve(block,...name)('test',async () => {
                    if (type !== 'success') {
                        throw undefined;
                    }
                    return undefined;
                })
                .then(expected.then).catch(expected.catch);
            });
            it('works with falsy result',function (next) {
                const expected = expect[type](0,next);
                resolve(block,...name)('test',async () => {
                    if (type !== 'success') {
                        throw 0
                    }
                    return 0;
                })
                .then(expected.then).catch(expected.catch);
            });
            it('works with truthy result',function (next) {
                const expected = expect[type](1,next);
                resolve(block,...name)('test',async () => {
                    if (type !== 'success') {
                        throw 1;
                    } 
                    return 1;
                })
                .then(expected.then).catch(expected.catch)
            });
            it('works with await',function (next) {
                const expected = expect[type](1,next);
                async function other () {
                    return new Promise((res,rej) => {
                        setTimeout(() => type === 'success' ? res(1) : rej(1),20);
                    });
                }
                resolve(block,...name)('test',async () => {
                    return await other();
                }).then(expected.then).catch(expected.catch);
            });
            it('works with reject+resolve',function (next) {
                const expected = expect[type](1,next);
                resolve(block,...name)('test',async ({resolve,context,reject}) => {
                    assert(context && true);
                    setTimeout(() => type === 'success' ? resolve(1) : reject(1),20);
                }).then(expected.then).catch(expected.catch);
            });
        }
        describe('then condition',function () {
            test_expectations('success');
        });
        describe('catch condition',function () {
            test_expectations('failure');
        });


    });
}

function test_generator ({name,each}) {
    describe('test generator',function () {
        function test_expectations (type) {
            it('works with only return value',function (next) {
                const expected = expect[type](1,next);
                resolve(block,...name)('test',function * () {
                    if (type === 'failure') {
                        throw 2;
                    }
                    return 1;
                }).then((v) => {
                    assert(v[0] === 1);
                    next();
                }).catch((v) => {
                    assert(v[0] === 2);
                    next();
                });
            });
            it('works with values yielded',function (next) {
                const expected = expect[type](1,next);
                resolve(block,...name)('test',function * () {
                    yield 10;
                    yield 1;
                    if (type === 'failure') {
                        throw 2;
                    }
                    yield 5;
                    return 1;
                }).then((v) => {
                    assert(v[0] === 10);
                    assert(v[1] === 1);
                    assert(v[2] === 5);
                    assert(v[3] === 1);
                    next();
                }).catch((v) => {
                    assert(v[2] === 2);
                    next();
                });
            });
            it('works with promises yielded',function (next) {
                const expected = expect[type](1,next,() => {
                    assert(v === 90);
                });
                var v=0;
                resolve(block,...name)('test',function * () {
                    yield new Promise((res,rej) => {setTimeout(() => {v += 20;res(1)}),20});
                    yield new Promise((res,rej) => {setTimeout(() => {v += 20;(type === 'failure' ? rej : res) (2)}),20});
                    yield new Promise((res,rej) => {setTimeout(() => {v += 50;res(3)}),20});
                    return 1;
                }).then((a) => {
                    assert(a[0] === 1);
                    assert(a[1] === 2);
                    assert(a[2] === 3);
                    assert(a[3] === 1);
                    assert(v === 90);
                    next();
                }).catch((v) => {
                    assert(v[1] === 2);
                    next();
                });
            });
            it('works with promise returned',function (next) {
                const expected = expect[type](1,next,() => {
                    assert(v === 90);
                });
                var v=0;
                resolve(block,...name)('test',function * () {
                    yield new Promise((res,rej) => {setTimeout(() => {v += 20;res(1)}),20});
                    yield new Promise((res,rej) => {setTimeout(() => {v += 20;res(2)}),20});
                    yield new Promise((res,rej) => {setTimeout(() => {v += 50;res(3)}),20});
                    return new Promise((res,rej) => {
                        (type === 'failure' && rej || res) (1);
                    });
                }).then((a) => {
                    assert(a[0] === 1);
                    assert(a[1] === 2);
                    assert(a[2] === 3);
                    assert(a[3] === 1);
                    assert(v === 90);
                    next();
                }).catch((v) => {
                    assert(v[3] === 1);
                    next();
                });
            });
        }
        describe('then condition',function () {
            test_expectations('success')
        });
        describe('catch condition',function () {
            test_expectations('failure')
        });
    });
}


describe('block.dismiss',function () {
    const dismiss = test('dismiss');
    var cnt = 0;
    dismiss.async({});
    dismiss.generator({});
    it('works with collisions',function (next) {
        block.dismiss('test',() => {
            return new Promise((res,rej) => {
                setTimeout(()=>res(20),20);
            });
        }).then((v) => {
            assert(false);
        }).catch((v) => {
            assert(v === DISMISSED);
            ++cnt === 2 && next();
        });
        block.dismiss('test',() => {
            return new Promise((res,rej) => {
                setTimeout(()=>res(40),20);
            });
        }).then((v) => {
            assert(v === 40);
            ++cnt === 2 && next();
        }).catch((v) => {
            assert(false);
        });
    });
});
describe('block.reverse.dismiss',function () {
    const dismiss = test('reverse','dismiss');
    var cnt = 0;
    dismiss.async({});
    dismiss.generator({});
    it('works with collisions',function (next) {
        block.reverse.dismiss('test',() => {
            return new Promise((res,rej) => {
                setTimeout(()=>res(20),20);
            });
        }).then((v) => {
            assert(v === 20);
            ++cnt === 2 && next();
        }).catch((v) => {
            assert(false);
        });
        block.reverse.dismiss('test',() => {
            return new Promise((res,rej) => {
                setTimeout(()=>res(40),20);
            });
        }).then((v) => {
            assert(false);
        }).catch((v) => {
            assert(v === DISMISSED);
            ++cnt === 2 && next();
        });
    });
});
describe('block.join',function () {
    const join = test('join');
    join.async({});
    join.generator({});
    var cnt = 0;

    it('works with collisions',function (next) {
        block.join('test',() => {
            return new Promise((res,rej) => {
                setTimeout(() => res(20),20);
            });
        }).then((v) => {
            assert(v == 99);
            ++cnt === 2 && next();
        }).catch((v) => {
            assert(false)
        });
        block.join('test',() => {
            return new Promise((res,rej) => {
                setTimeout(() => res(99),20);
            });
        }).then((v) => {
            assert(v === 99);
            ++cnt === 2 && next();
        }).catch((v) => {
            assert(false);
        });
    });
});
describe('block.reverse.join',function () {
    const join = test('reverse','join');
    join.async({});
    join.generator({});
    var cnt = 0;

    it('works with collisions',function (next) {
        block.reverse.join('test',() => {
            return new Promise((res,rej) => {
                setTimeout(() => res(20),20);
            });
        }).then((v) => {
            assert(v == 20);
            ++cnt === 2 && next();
        }).catch((v) => {
            assert(false)
        });
        block.reverse.join('test',() => {
            return new Promise((res,rej) => {
                setTimeout(() => res(99),20);
            });
        }).then((v) => {
            assert(v === 20);
            ++cnt === 2 && next();
        }).catch((v) => {
            assert(false);
        });
    });
});

describe('block.stop',function () {
    const stop = test('stop');
    stop.async({});
    stop.generator({});
    var cnt=0;

    it('works with collisions',function (next) {
        block.stop('test',() => {
            return new Promise((res,rej) => {
                setTimeout(()=>res(20),20);
            });
        }).then((v) => {
            assert(false);
        }).catch((v) => {
            assert(false);
        });
        block.stop('test',() => {
            return new Promise((res,rej) => {
                setTimeout(()=>res(40),20);
            });
        }).then((v) => {
            assert(v === 40);
            setTimeout( next ,10);
        }).catch((v) => {
            assert(false);
        })
    });
});
describe('block.reverse.stop',function () {
    const stop = test('reverse','stop');
    stop.async({});
    stop.generator({});
    var cnt=0;

    it('works with collisions',function (next) {
        block.reverse.stop('test',() => {
            return new Promise((res,rej) => {
                setTimeout(()=>res(20),20);
            });
        }).then((v) => {
            assert(v === 20);
            setTimeout( next ,10);
        }).catch((v) => {
            assert(false);
        });
        block.reverse.stop('test',() => {
            return new Promise((res,rej) => {
                setTimeout(()=>res(40),20);
            });
        }).then((v) => {
            assert(false);
        }).catch((v) => {
            assert(false);
        })
    });
});

describe('alternate invocation',function () {
    it('works with tagged literal',function (next) {
        block.reverse.stop `test` (({reject,resolve}) => {
            setTimeout(() => resolve(10))
        }).then((v) => {
            assert(v === 10);
            setTimeout(next,10);
        }).catch(() => {
            assert(false);
        });
        block.reverse.stop `test` (({reject,resolve}) => {
            setTimeout(() => resolve(10))
        }).then(() => {
            assert(false);
        }).catch(() => {
            assert(false);
        });
    });
    it('works with only name',function (next) {
        block.reverse('test').stop(({reject,resolve}) => {
            setTimeout(() => resolve(10))
        }).then((v) => {
            assert(v === 10);
            setTimeout(next,10);
        }).catch(() => {
            assert(false);
        });
        block.reverse('test').stop(({reject,resolve}) => {
            setTimeout(() => resolve(10))
        }).then(() => {
            assert(false);
        }).catch(() => {
            assert(false);
        });
    });
});

describe('integrates as Promise',function () {
    it('works with Promise.all',function (next) {
        Promise.all([
            block `test1` (({reject,resolve}) => {
                setTimeout(() => resolve(10),0);
            }).then((v) => {
            }),
            block `test2` (({reject,resolve}) => {
                setTimeout(() => resolve(20),0);
            })
        ]).then((v) => {
            assert(v[0] === undefined)
            assert(v[1] === 20);
            assert(v.length === 2);
            next();
        });

    });
    it('works with Promise.race',function (next) {
        Promise.race([
            block.dismiss `test1` (({reject,resolve}) => {
                setTimeout(() => resolve(10),0);
            }),
            block.dismiss `test2` (({reject,resolve}) => {
                setTimeout(() => resolve(20),20);
            })
        ]).then((v) => {
            assert(v === 10);
            next();
        });
    });
});
