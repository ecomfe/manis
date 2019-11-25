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
        expect(foobar.bar).toBe(bar.bar);
    });

    it('mix', function () {
        var foo = {foo: 1};
        var bar = {bar: 1};
        var baz = {foo: 0, baz: 1};

        var foobaz = util.mix(foo, bar, baz, null, undefined);


        expect(foobaz.foo).toBe(baz.foo);
        expect(foobaz.baz).toBe(baz.baz);
    });

    it('pick', function () {
        var foo = {};
        var bar = {foo: 1, bar: 1};
        var baz = {foo: 0, baz: 1};


        var pickBar = util.pick([foo, bar, baz]);
        expect(pickBar).toBe(bar);
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

describe('Get user\'s home directory', function () {

    var processObj = {
        env: {
            HOME: '',
            LOGNAME: '',
            USER: '',
            LNAME: '',
            USERNAME: '',
            USERPROFILE: '',
            HOMEDRIVE: '',
            HOMEPATH: ''
        },
        platform: '',
        getuid: null
    };

    describe('win32', function () {
        var obj = util.mix(processObj, {platform: 'win32', env: {HOME: 'path/to/home/'}});

        it('use env.HOME', function () {
            expect(util.getHome(obj)).toBe(obj.env.HOME);
        });

        it('use env.USERPROFILE', function () {
            obj.env.USERPROFILE = 'path/to/profile/';

            expect(util.getHome(obj)).toBe(obj.env.USERPROFILE);
        });

        it('use env.HOMEDRIVE and env.HOMEPATH', function () {
            obj.env.USERPROFILE = '';
            obj.env.HOMEDRIVE = 'path/to/home-driver/';
            obj.env.HOMEPATH = 'path/to/home-path/';

            expect(util.getHome(obj)).toBe(obj.env.HOMEDRIVE + obj.env.HOMEPATH);
        });

    });

    describe('darwin', function () {
        var obj = util.mix(processObj, {platform: 'darwin', env: {HOME: 'path/to/home/'}});

        it('use env.HOME', function () {
            expect(util.getHome(obj)).toBe(obj.env.HOME);
        });

        it('use /Users/USERNAME', function () {
            obj.env.HOME = '';
            obj.env.USERNAME = 'chris';
            expect(util.getHome(obj)).toBe('/Users/' + obj.env.USERNAME);
        });

        it('use /Users/LNAME', function () {
            obj.env.HOME = '';
            obj.env.LNAME = 'chris';
            expect(util.getHome(obj)).toBe('/Users/' + obj.env.LNAME);
        });

        it('use /Users/USER', function () {
            obj.env.HOME = '';
            obj.env.USER = 'chris';
            expect(util.getHome(obj)).toBe('/Users/' + obj.env.USER);
        });

        it('use /Users/LOGNAME', function () {
            obj.env.HOME = '';
            obj.env.LOGNAME = 'chris';
            expect(util.getHome(obj)).toBe('/Users/' + obj.env.LOGNAME);
        });
    });

    describe('linux', function () {
        var obj = util.mix(processObj, {platform: 'linux', env: {HOME: 'path/to/home/', LOGNAME: 'chris'}});

        it('use env.HOME', function () {
            obj.env.HOME = 'path/to/home/';
            expect(util.getHome(obj)).toBe(obj.env.HOME);
        });

        it('use /home/user', function () {
            obj.env.HOME = '';
            obj.getuid = function () {
                return 1;
            };

            expect(util.getHome(obj)).toBe('/home/chris');
        });

        it('use /root', function () {
            obj.env.HOME = '';
            obj.getuid = function () {
                return 0;
            };

            expect(util.getHome(obj)).toBe('/root');
        });

    });

});

describe('default loader', function () {

    it('JSON file', function () {
        var config = util.loader('{"foo": false, "bar": true}', 'path/foo.json');

        expect(config.foo).toBe(false);
        expect(config.bar).toBe(true);
    });

    it('invalid JSON file', function () {

        var reading = function () {
            util.loader('{"foo": false, "bar": true', 'path/foo.json');
        };

        expect(reading).toThrow();
    });

    it('YAML file', function () {

        var config = util.loader('foo: false\nbar: true', 'path/foo.yml');

        expect(config.foo).toBe(false);
        expect(config.bar).toBe(true);
    });

    it('invalid YAML file', function () {

        var reading = function () {
            util.loader('foo: false\nbar:[', 'path/foo.yml');
        };

        expect(reading).toThrow();
    });

});
