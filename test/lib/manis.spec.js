/**
 * @file baidu reporter
 * @author chris<wfsr@foxmail.com>
 */

var path = require('path');

var mock = require('mock-fs');

var Manis = require('../../lib/manis');


describe('manis', function () {

    it('should be a constructor', function () {

        expect(typeof Manis).toBe('function');
        expect(Manis.prototype.constructor).toBe(Manis);

    });


    it('should be have from method', function () {

        expect(typeof Manis.prototype.from).toBe('function');

    });

    describe('Mains#setDefault', function () {
        afterEach(function () {
            mock.restore();
        });

        it('normal usage', function () {
            mock({
                '/default/path/to/.fecsrc': '{"foo": true}',
                '/path/to/.fecsrc': '{"bar": true}'
            });

            var manis = new Manis('.fecsrc');
            manis.setDefault('/default/path/to/.fecsrc');

            var config = manis.from('/path/to/foo.js');

            expect(config.foo).toBe(true);
            expect(config.bar).toBe(true);
        });

        it('invalid arguments', function () {

            var manis = new Manis('.fecsrc');

            var sendInvalidPath = function () {
                manis.setDefault('/default/path/to/');
            };

            var sendInvalidType = function () {
                manis.setDefault(['/default/path/to/.fecsrc']);
            };

            expect(sendInvalidPath).toThrow();
            expect(sendInvalidType).toThrow();
        });

        it('config new finder', function () {
            mock({
                '/default/path/to/.fecsrc': '{"fecs": {"foo": true}}',
                '/path/to/.fecsrc': '{"bar": true}'
            });

            var manis = new Manis('.fecsrc');
            manis.setDefault('/default/path/to/.fecsrc', {get: 'fecs'});

            var config = manis.from('/path/to/foo.js');

            expect(config.foo).toBe(true);
            expect(config.bar).toBe(true);
        });

        it('no default config file', function () {
            mock({
                '/default/path/to/.fecsrc': '{"fecs": {"foo": true}}',
                '/path/to/.fecsrc': '{"bar": true}'
            });

            var manis = new Manis('.fecsrc');
            manis.setDefault('/default/path/.fecsrc', {get: 'fecs'});

            expect(manis.defaultValue).toEqual(Object.create(null));

            var config = manis.from('/path/to/foo.js');

            expect(config.foo).toBeUndefined();
            expect(config.bar).toBe(true);
        });

        it('get from existing finder but another name', function () {
            mock({
                '/default/path/to/fecs.json': '{"foo": true}',
                '/path/to/.fecsrc': '{"bar": true}'
            });

            var manis = new Manis('.fecsrc');
            manis.setDefault('/default/path/to/fecs.json');

            var config = manis.from('/path/to/foo.js');

            expect(config.foo).toBe(true);
            expect(config.bar).toBe(true);
        });

        it('set defaultValue directly', function () {
            mock({
                '/path/to/.fecsrc': '{"bar": true}'
            });

            var manis = new Manis('.fecsrc');
            manis.setDefault({foo: true});

            var config = manis.from('/path/to/foo.js');

            expect(config.foo).toBe(true);
            expect(config.bar).toBe(true);
        });

    });

    describe('Manis#from', function () {
        afterEach(function () {
            mock.restore();
        });

        it('basic function', function () {
            var manis = new Manis('foo.json');

            mock({
                'path/to/foo.json': '{"foo": true}'
            });

            var config = manis.from('path/to/hello-world.js');

            expect(config).toBeDefined();
            expect(config.foo).toBe(true);
        });

        it('merge up', function () {
            var manis = new Manis('foo.json');

            mock({
                'path/foo.json': '{"foo": false, "bar": true}',
                'path/to/foo.json': '{"foo": true}'
            });

            var config = manis.from('path/to/hello-world.js');

            expect(config).toBeDefined();
            expect(config.foo).toBe(true);
            expect(config.bar).toBe(true);
        });

        it('should be cacheable', function () {
            var manis = new Manis({
                files: 'foo.json',
                cache: true
            });

            mock({
                'path/foo.json': '{"foo": false, "bar": true}',
                'path/to/foo.json': '{"foo": true}'
            });

            var config = manis.from('path/to/hello-world.js');

            expect(config.foo).toBe(true);
            manis.cached[path.resolve('path/to/')].foo = false;

            config = manis.from('path/to/hello-world.js');
            expect(config.foo).toBe(false);
        });

        it('no cache', function () {
            var manis = new Manis({
                files: 'foo.json',
                cache: false
            });

            mock({
                'path/foo.json': '{"foo": false, "bar": true}',
                'path/to/foo.json': '{"foo": true}'
            });

            var config = manis.from('path/to/hello-world.js');

            expect(config.foo).toBe(true);

            var setCache = function () {
                manis.cached[path.resolve('path/to/')].foo = false;
            };

            expect(setCache).toThrow();
            expect(config.foo).toBe(true);
        });

        it('find foo.json and bar.json', function () {
            var manis = new Manis(['foo.json', 'bar.json']);

            mock({
                'path/foo.json': '{"foo": 0, "bar": true}',
                'path/bar.json': '{"foo": 1, "baz": true}',
                'path/to/foo.json': '{"foo": 2}',
                'path/to/bar.json': '{"foo": 3}'
            });

            var config = manis.from('path/to/hello.js');

            expect(config.foo).toBe(2);
            expect(config.bar).toBe(true);
            expect(config.baz).toBe(true);

            config = manis.from('path/world.js');
            expect(config.foo).toBe(0);
        });

        it('find foo.json and bar.json - no merge', function () {
            var manis = new Manis({
                files: ['bar.json', 'foo.json'],
                merge: false
            });

            mock({
                'path/foo.json': '{"foo": 0, "bar": true}',
                'path/bar.json': '{"foo": 1, "baz": true}',
                'path/to/foo.json': '{"foo": 2}',
                'path/to/bar.json': '{"foo": 3}'
            });

            var config = manis.from('path/to/hello.js');

            expect(config.foo).toBe(3);
            expect(config.bar).toBeUndefined();
            expect(config.baz).toBe(true);

            config = manis.from('path/world.js');
            expect(config.foo).toBe(1);
        });

        it('custom getter - field name', function () {
            var manis = new Manis([{
                name: 'foo.json',
                get: 'fecs'
            }]);

            mock({
                'path/foo.json': '{"fecs": {"foo": false, "bar": true}}',
                'path/to/foo.json': '{"fecs": {"foo": true}}'
            });

            var config = manis.from('path/to/hello-world.js');

            expect(config.foo).toBe(true);
            expect(config.bar).toBe(true);
        });

        it('custom getter - function', function () {
            var manis = new Manis([{
                name: 'foo.json',
                get: function (json) {
                    return json.fecs;
                }
            }]);

            mock({
                'path/foo.json': '{"fecs": {"foo": false, "bar": true}}',
                'path/to/foo.json': '{"fecs": {"foo": true}}'
            });

            var config = manis.from('path/to/hello-world.js');

            expect(config.foo).toBe(true);
            expect(config.bar).toBe(true);
        });

        it('custom loader', function () {
            var manis = new Manis({
                files: 'foo.json',
                loader: function (text) {
                    return {foo: false};
                }
            });

            mock({
                'path/foo.json': '{"foo": false, "bar": true}',
                'path/to/foo.json': '{"foo": true}'
            });

            var config = manis.from('path/to/hello-world.js');

            expect(config).toBeDefined();
            expect(config.foo).toBe(false);
            expect(config.bar).toBeUndefined();
        });
    });

});
