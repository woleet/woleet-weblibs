module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                //banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            verify: {
                src: [
                    'bower_components/crypto-js/core.js',
                    'bower_components/crypto-js/sha256.js',
                    'bower_components/crypto-js/lib-typedarrays.js',
                    'lib/woleet-api.js',
                    'lib/woleet-hashfile.js',
                    'lib/woleet-chainpoint.js',
                    'lib/woleet-verify.js'
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);
};