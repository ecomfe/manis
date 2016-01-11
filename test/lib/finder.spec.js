/**
 * @file baidu reporter
 * @author chris<wfsr@foxmail.com>
 */

var path = require('path');

var mock = require('mock-fs');

var Finder = require('../../lib/finder');


describe('finder', function () {

    it('should be a constructor', function () {

        expect(typeof Finder).toBe('function');
        expect(Finder.prototype.constructor).toBe(Finder);

    });

    it('has a static method', function () {

        expect(typeof Finder.create).toBe('function');

    });

    it('should be have from method', function () {

        expect(typeof Finder.prototype.from).toBe('function');

    });

    describe('Finder#from', function () {
        afterEach(function () {
            mock.restore();
        });

        it('basic function', function () {
            var finder = Finder.create('foo.json');

            mock({
                'path/to/foo.json': '{"foo": true}'
            });

            var config = finder.from('path/to/');

            expect(config).toBeDefined();
            expect(config.foo).toBe(true);
        });

        it('merge up', function () {
            var finder = Finder.create('foo.json');

            mock({
                'path/foo.json': '{"foo": false, "bar": true}',
                'path/to/foo.json': '{"foo": true}'
            });

            var config = finder.from('path/to/');

            expect(config).toBeDefined();
            expect(config.foo).toBe(true);
            expect(config.bar).toBe(true);
        });


        it('should be cacheable', function () {
            var finder = new Finder({
                name: 'foo.json',
                cache: true
            });

            mock({
                'path/foo.json': '{"foo": false, "bar": true}',
                'path/to/foo.json': '{"foo": true}'
            });

            var config = finder.from('path/to/');

            expect(config.foo).toBe(true);
            finder.cached[path.resolve('path/to/')].foo = false;

            config = finder.from('path/to/');
            expect(config.foo).toBe(false);
        });

        it('custom getter - field name', function () {
            var finder = new Finder({
                name: 'foo.json',
                get: 'fecs'
            });

            mock({
                'path/foo.json': '{"fecs": {"foo": false, "bar": true}}',
                'path/to/foo.json': '{"fecs": {"foo": true}}'
            });

            var config = finder.from('path/to/');

            expect(config.foo).toBe(true);
            expect(config.bar).toBe(true);
        });

        it('custom getter - function', function () {
            var finder = new Finder({
                name: 'foo.json',
                get: function (json) {
                    return json.fecs;
                }
            });

            mock({
                'path/foo.json': '{"fecs": {"foo": false, "bar": true}}',
                'path/to/foo.json': '{"fecs": {"foo": true}}'
            });

            var config = finder.from('path/to/');

            expect(config.foo).toBe(true);
            expect(config.bar).toBe(true);
        });

        it('custom loader', function () {
            var finder = Finder.create({
                name: 'foo.json',
                loader: function (text) {
                    return {foo: false};
                }
            });

            mock({
                'path/foo.json': '{"foo": false, "bar": true}',
                'path/to/foo.json': '{"foo": true}'
            });

            var config = finder.from('path/to/');

            expect(config).toBeDefined();
            expect(config.foo).toBe(false);
            expect(config.bar).toBeUndefined();
        });

        it('custom loader - multi params', function () {
            var finder = Finder.create(
                'foo.json',
                true,
                null,
                function loader(text) {
                    return {foo: false};
                }
            );

            mock({
                'path/foo.json': '{"foo": false, "bar": true}',
                'path/to/foo.json': '{"foo": true}'
            });

            var config = finder.from('path/to/');

            expect(config).toBeDefined();
            expect(config.foo).toBe(false);
            expect(config.bar).toBeUndefined();
        });
    });

    it('custom stopper and ignore empty config', function () {
        var options;
        var finder = Finder.create({
            name: 'foo.json',
            stopper: function (start, root, configs) {
                options = configs;
                return start === root;
            }
        });

        mock({
            'path/to/foo.json': '{"foo": true}',
            'path/foo.json': '{}'
        });

        var config = finder.from('path/to/');

        expect(options).toBeDefined();
        expect(options.length).toBe(1);
        expect(config).toBeDefined();
        expect(config.foo).toBe(true);
    });

});
