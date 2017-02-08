var gulp = require("gulp"),
    babel = require('gulp-babel'),
    dest = require('gulp-dest'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps');

// Uglify crypto
gulp.task("uglifyCrypto", () => {
    var crypto = gulp.src([
        'bower_components/crypto-js/core.js',
        'bower_components/crypto-js/sha256.js',
        'bower_components/crypto-js/lib-typedarrays.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('crypto.js'))
        .pipe(gulp.dest("./dist"));

    var crypto_min = crypto
        .pipe(uglify())
        .pipe(dest('./', {ext: '.min.js'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("./dist"));
});


// Uglify hashfile worker
gulp.task("uglifyWorker", () => {
    var worker = gulp.src("lib/woleet-hashfile-worker.js")
        .pipe(sourcemaps.init())
        .pipe(gulp.dest("./dist"));

    var worker_min = worker
        .pipe(uglify())
        .pipe(dest('dist', {ext: '.min.js'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("./"));
});

// Uglify other Woleet libraries
gulp.task("uglifyLib", () => {
    var src = gulp.src([
        'lib/woleet-api.js',
        'lib/woleet-chainpoint.js',
        'lib/woleet-verify.js',
        'lib/woleet-hashfile.js'])
        .pipe(sourcemaps.init())
        .pipe(babel({presets: ['latest']}));

    var splitted = src
        .pipe(dest('./', {ext: '.js'}))
        .pipe(gulp.dest("dist/"));

    var splitted_min = splitted
        .pipe(uglify())
        .pipe(dest('./', {ext: '.min.js'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("dist/"));

    var weblibs = src
        .pipe(concat('woleet-weblibs.js'))
        .pipe(gulp.dest("dist/"));

    var weblibs_min = weblibs
        .pipe(uglify())
        .pipe(dest('./', {ext: '.min.js'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("dist/"));
});

gulp.task('default', [
    'uglifyCrypto',
    'uglifyWorker',
    'uglifyLib'
]);