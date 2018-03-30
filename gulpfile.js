const gulp = require('gulp'),
  browserify = require('gulp-browserify'),
  babel = require('gulp-babel'),
  dest = require('gulp-dest'),
  strip = require('gulp-strip-comments'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename');

// Uglify hashfile worker
gulp.task('worker', (done) => {
  const worker = gulp.src('lib/browser/woleet-hashfile-worker.js')
    .pipe(gulp.dest('./dist'))
    .pipe(babel())
    .pipe(strip());

  const worker_min = worker
    .pipe(uglify())
    .pipe(dest('dist', {ext: '.min.js'}))
    .pipe(gulp.dest('./'))
    .on('error', done)
    .on('end', done);
});

function build(standalone, input, output, done) {

  const params = {
    standalone: standalone,
    insertGlobals: false
  };

  const weblibs = gulp.src(input)
    .pipe(rename(output))
    .pipe(browserify(params))
    .pipe(strip())
    .pipe(gulp.dest('dist/'));

  const weblibs_min = weblibs
    .pipe(uglify())
    .pipe(dest('./', {ext: '.min.js'}))
    .pipe(gulp.dest('dist/'))
    .on('error', done)
    .on('end', done);

}

gulp.task('lib', (done) => {

  build('woleet', './lib/browser/index.js', 'woleet-weblibs.js', done);

});

gulp.task('crypto', (done) => {

  build('woleet.crypto', './lib/browser/woleet-crypto.js', 'woleet-crypto.js', done);

});

gulp.task('default', [
  'worker',
  'crypto',
  'lib'
]);
