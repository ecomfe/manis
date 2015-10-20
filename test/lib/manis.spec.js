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


    it('should be having `from` method', function () {

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

            expect(manis.defaultConfig).toEqual(Object.create(null));

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

        it('set defaultConfig directly', function () {
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

    describe('Mains#setUserConfig', function () {
        afterEach(function () {
            mock.restore();
        });

        it('normal usage', function () {
            var home = process.env.HOME;
            var mockConfig = {
                '/default/path/to/.fecsrc': '{"foo": true, "id": 1}',
                '/path/to/.fecsrc': '{"bar": true, "id": 3}'
            };

            mockConfig[home + '/.fecsrc'] = '{"baz": true, "id": 2}';
            mock(mockConfig);

            var manis = new Manis('.fecsrc');
            manis.setDefault('/default/path/to/.fecsrc');
            manis.setUserConfig(home + '/.fecsrc');

            var config = manis.from('/path/to/foo.js');

            expect(config.id).toBe(3);
            expect(config.foo).toBe(true);
            expect(config.bar).toBe(true);
            expect(config.baz).toBe(true);
        });

        it('use `~` should be equal as expect', function () {
            var home = process.env.HOME;
            var mockConfig = {
                '/default/path/to/.fecsrc': '{"foo": true, "id": 1}',
                '/path/to/.fecsrc': '{"bar": true, "id": 3}'
            };

            mockConfig[home + '/.fecsrc'] = '{"baz": true, "id": 2}';
            mock(mockConfig);

            var manis = new Manis('.fecsrc');
            manis.setDefault('/default/path/to/.fecsrc');
            manis.setUserConfig('~/.fecsrc');

            var config = manis.from('/path/to/foo.js');

            expect(config.id).toBe(3);
            expect(config.foo).toBe(true);
            expect(config.bar).toBe(true);
            expect(config.baz).toBe(true);
        });

        it('no user config file', function () {
            mock({
                '/path/to/.fecsrc': '{"bar": true}'
            });

            var manis = new Manis('.fecsrc');
            manis.setUserConfig('.fecsrc', {get: 'fecs'});

            expect(manis.userConfig).toEqual(Object.create(null));

            var config = manis.from('/path/to/foo.js');

            expect(config.foo).toBeUndefined();
            expect(config.bar).toBe(true);
        });

        it('get from existing finder but another name', function () {
            var home = process.env.HOME;
            var mockConfig = {
                '/path/to/.fecsrc': '{"bar": true}'
            };

            mockConfig[home + '/fecs.json'] = '{"foo": true}';
            mock(mockConfig);

            var manis = new Manis('.fecsrc');
            manis.setUserConfig('fecs.json');

            var config = manis.from('/path/to/foo.js');

            expect(config.foo).toBe(true);
            expect(config.bar).toBe(true);
        });

        it('call userConfig withou param', function () {
            var home = process.env.HOME;
            var userConfig = {
                '/path/to/.fecsrc': '{"bar": true}'
            };

            userConfig[home + '/.fecsrc'] = '{"foo": true}';
            mock(userConfig);

            var manis = new Manis('.fecsrc');
            manis.setUserConfig();

            var config = manis.from('/path/to/foo.js');

            expect(config.foo).toBe(true);
            expect(config.bar).toBe(true);
        });

        it('set userConfig directly', function () {
            mock({
                '/path/to/.fecsrc': '{"bar": true}'
            });

            var manis = new Manis('.fecsrc');
            manis.setUserConfig({foo: true});

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
            var manis = new Manis({files: ['foo.json', 'bar.json'], merge: true});

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


        it('orphan', function () {
            var manis = new Manis({
                orphan: true,
                files: ['bar.json', 'foo.json']
            });

            mock({
                'path/foo.json': '{"foo": 0, "bar": true}',
                'path/bar.json': '{"foo": 1, "baz": true}',
                'path/to/foo.json': '{"foo": 2, "bar": 0}',
                'path/to/bar.json': '{"foo": 3}'
            });

            var config = manis.from('path/to/hello.js');

            expect(config.foo).toBe(3);
            expect(config.bar).toBeUndefined();
            expect(config.baz).toBeUndefined();

            config = manis.from('path/world.js');
            expect(config.foo).toBe(1);
        });

        it('orphan but config file not found', function () {
            var manis = new Manis({
                orphan: true,
                files: 'bar.json'
            });

            mock({
                'path/foobar.json': '{"foo": 0, "bar": true}'
            });

            manis.setDefault({
                foo: 3
            });
            var config = manis.from('path/to/hello.js');

            expect(config.foo).toBe(3);
            expect(config.bar).toBeUndefined();
            expect(config.baz).toBeUndefined();
        });


        it('enableRoot with `root`', function () {
            var manis = new Manis({
                enableRoot: true,
                files: ['foo.json']
            });

            mock({
                'path/foo.json': '{"foo": 1, "baz": true}',
                'path/to/foo.json': '{"root": true, "foo": 3}'
            });

            manis.setDefault({foo: 2, bar: 0});
            var config = manis.from('path/to/hello.js');

            expect(config.foo).toBe(3);
            expect(config.bar).toBe(0);
            expect(config.baz).toBeUndefined();
        });

        it('enableRoot with `bar`', function () {
            var manis = new Manis({
                rootName: 'bar',
                enableRoot: true,
                files: ['foo.json']
            });

            mock({
                'path/foo.json': '{"foo": 1, "baz": true}',
                'path/to/foo.json': '{"foo": 3}'
            });

            manis.setDefault({foo: 2, bar: 0});
            var config = manis.from('path/to/hello.js');

            expect(config.foo).toBe(3);
            expect(config.bar).toBe(0);
            expect(config.baz).toBe(true);
        });


        it('no lookup', function () {
            var manis = new Manis({
                lookup: false,
                files: ['foo.json']
            });

            mock({
                'path/foo.json': '{"foo": 1, "baz": true}',
                'path/to/foo.json': '{"foo": 3}'
            });

            manis.setDefault({foo: 2, bar: 0});
            var config = manis.from('path/to/hello.js');

            expect(config.foo).toBe(2);
            expect(config.bar).toBe(0);
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

        it('custom stopper', function () {
            var manis = new Manis({
                files: 'foo.json',
                stopper: function (start, root, configs) {
                    return configs.length > 1;
                }
            });

            mock({
                'path/foo.json': '{"foo": false, "bar": false, "baz": true}',
                'path/to/foo.json': '{"foo": false, "bar": true}',
                'path/to/the/foo.json': '{"foo": true}'
            });

            var config = manis.from('path/to/the/hello-world.js');

            expect(config.foo).toBe(true);
            expect(config.bar).toBe(true);
            expect(config.baz).toBeUndefined();
        });
    });

});
