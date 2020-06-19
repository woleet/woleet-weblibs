const gulp = require('gulp'),
  browserify = require('browserify'),
  babel = require('gulp-babel'),
  minify = require('gulp-minify'),
  rename = require('gulp-rename'),
  strip = require('gulp-strip-comments'),
  buffer = require('vinyl-buffer'),
  source = require('vinyl-source-stream');

gulp.task('worker', (done) => {
  const worker = gulp.src('lib/browser/woleet-hashfile-worker.js')
    .pipe(gulp.dest('./dist'))
    .pipe(babel())
    .pipe(strip());

  const worker_min = worker
    .pipe(minify({ ext: { min: '.min.js' } }))
    .pipe(gulp.dest('dist/'))
    .on('error', done)
    .on('end', done);
});

function build(standalone, input, output, done) {

  const params = {
    entries: input,
    standalone: standalone,
    insertGlobals: false
  };

  const weblibs = browserify(params)
    .bundle()
    .pipe(source(input))
    .pipe(buffer())
    .pipe(rename(output))
    .pipe(strip())
    .pipe(gulp.dest('dist/'));

  const weblibs_min = weblibs
    .pipe(minify({ ext: { min: '.min.js' } }))
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

gulp.task('default', gulp.parallel('worker', 'crypto', 'lib'));
