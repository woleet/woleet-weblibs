module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        babel: {
            options: {
                sourceMap: false,
                presets: ['latest'],
                compact: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'lib/',
                    src: ['*.js'],
                    dest: 'dist/babel',
                    ext: '.js'
                }]
            }
        },
        uglify: {
            options: {
                //banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            verify: {
                src: [
                    'bower_components/crypto-js/core.js',
                    'bower_components/crypto-js/sha256.js',
                    'bower_components/crypto-js/lib-typedarrays.js',
                    'dist/babel/woleet-api.js',
                    'dist/babel/woleet-hashfile.js',
                    'dist/babel/woleet-chainpoint.js',
                    'dist/babel/woleet-verify.js'
                ],
                dest: 'dist/woleet-verify.min.js'
            },
            crypto: {
                src: [
                    'bower_components/crypto-js/core.js',
                    'bower_components/crypto-js/sha256.js',
                    'bower_components/crypto-js/lib-typedarrays.js'
                ],
                dest: 'dist/crypto.min.js'
            },
            worker: {
                src: [
                    'lib/worker.js'
                ],
                dest: 'dist/worker.min.js'
            }
        },
        clean: {
            build: {
                src: ['dist/babel']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-babel');

    // Default task(s).
    grunt.registerTask('default', ['babel', 'uglify']);
};