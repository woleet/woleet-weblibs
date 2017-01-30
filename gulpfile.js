var gulp = require("gulp"),
    babel = require('gulp-babel'),
    dest = require('gulp-dest'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

//uglify crypto
gulp.task("uglifyCrypto", () => {
    return gulp.src([
        'bower_components/crypto-js/core.js',
        'bower_components/crypto-js/sha256.js',
        'bower_components/crypto-js/lib-typedarrays.js'
    ])
        .pipe(concat('crypto.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest("./dist"));
});


//uglify worker
gulp.task("uglifyWorker", () => {
    return gulp.src("lib/worker.js")
        .pipe(uglify())
        .pipe(dest('dist', {ext: '.min.js'}))
        .pipe(gulp.dest("./"));
});

//uglify all
gulp.task("uglifyLib", () => {
    return gulp.src([
        'lib/woleet-api.js',
        'lib/woleet-chainpoint.js',
        'lib/woleet-verify.js',
        'lib/woleet-hashfile.js'
    ])
        .pipe(babel({
            presets: ['latest']
        }))
        .pipe(uglify())
        .pipe(dest('./', {ext: '.min.js'}))
        .pipe(gulp.dest("dist/splitted"))
        .pipe(concat('woleet-weblibs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest("dist/"));
});

gulp.task('default', [
    'uglifyCrypto',
    'uglifyWorker',
    'uglifyLib'
]);