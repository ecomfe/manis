/**
 * @file baidu reporter
 * @author chris<wfsr@foxmail.com>
 */

var util = require('../../lib/util');

describe('util', function () {

    it('extend', function () {
        var foo = {foo: 1};
        var bar = {bar: 1};
        var baz = {foo: 0, baz: 1};

        var foobar = util.extend(foo, bar);

        expect(foobar.foo).toBe(foo.foo);
        expect(foobar.bar).toBe(bar.bar);

        var foobaz = util.extend(foo, baz);

        expect(foobaz.foo).toBe(baz.foo);
        expect(foobaz.baz).toBe(baz.baz);
    });

    it('deep extend', function () {
        var foo = {fecs: {foo: 1}};
        var bar = {fecs: {bar: 1}};
        var baz = {fecs: {foo: 0, baz: 1}};

        var foobar = util.extend(foo, bar);

        expect(foobar.fecs.foo).toBe(foo.fecs.foo);
        expect(foobar.fecs.bar).toBe(bar.fecs.bar);

        var foobaz = util.extend(foo, baz);

        expect(foobaz.fecs.foo).toBe(baz.fecs.foo);
        expect(foobaz.fecs.baz).toBe(baz.fecs.baz);
    });

    it('extend should ignore property from prototype', function () {
        var foo = {foo: 1};
        var bar = Object.create({bar: 1});

        var foobar = util.extend(foo, bar);

        expect(foobar.foo).toBe(foo.foo);
        expect(foobar.bar).toBeUndefined();
    });

    it('mix', function () {
        var foo = {foo: 1};
        var bar = {bar: 1};
        var baz = {foo: 0, baz: 1};

        var foobaz = util.mix(foo, bar, baz, null, undefined);


        expect(foobaz.foo).toBe(baz.foo);
        expect(foobaz.baz).toBe(baz.baz);
    });

    /* eslint-disable no-new-wrappers */
    it('typeOf', function () {
        expect(util.typeOf('')).toBe('string');
        expect(util.typeOf(new String())).toBe('string');

        expect(util.typeOf(true)).toBe('boolean');
        expect(util.typeOf(new Boolean(true))).toBe('boolean');

        expect(util.typeOf(0)).toBe('number');
        expect(util.typeOf(NaN)).toBe('number');

        expect(util.typeOf(undefined)).toBe('undefined');
        expect(util.typeOf(null)).toBe('null');

        expect(util.typeOf([])).toBe('array');
        expect(util.typeOf(new Array(5))).toBe('array');

        expect(util.typeOf(describe)).toBe('function');
        expect(util.typeOf(new Function())).toBe('function');

        expect(util.typeOf(/foo/)).toBe('regexp');
        expect(util.typeOf(new RegExp('foo'))).toBe('regexp');

        expect(util.typeOf(new Date())).toBe('date');
    });
    /* eslint-enable no-new-wrappers */

});
