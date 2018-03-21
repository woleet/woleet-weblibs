const gulp = require("gulp"),
  browserify = require("gulp-browserify"),
  babel = require('gulp-babel'),
  dest = require('gulp-dest'),
  strip = require('gulp-strip-comments'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify');

// Uglify hashfile worker
gulp.task("worker", (done) => {
  const worker = gulp.src("lib/woleet-hashfile-worker.js")
    .pipe(gulp.dest("./dist"))
    .pipe(babel())
    .pipe(strip());

  const worker_min = worker
    .pipe(uglify())
    .pipe(dest('dist', {ext: '.min.js'}))
    .pipe(gulp.dest("./"))
    .on('end', done);
});

// Uglify other Woleet libraries
gulp.task("standalone", (done) => {

  const sources = [
    {file: './lib/woleet-api.js', out: 'woleet'},
    {file: './lib/woleet-crypto.js', out: 'woleet.crypto'},
    {file: './lib/woleet-chainpoint.js', out: 'woleet.receipt.validate'},
    {file: './lib/woleet-hashfile.js', out: 'woleet.file'},
    {file: './lib/woleet-verify.js', out: 'woleet.verify'},
    {file: './lib/woleet-signature.js', out: 'woleet.signature'}
  ];

  sources.reduce((acc, src) => new Promise((resolve, reject) => {

    const params = {
      standalone: src.out,
      insertGlobals: false
    };

    const standalone = gulp.src(src.file)
      .pipe(browserify(params))
      .pipe(strip())
      .pipe(gulp.dest("dist/"))
      .on('error', reject);

    const standalone_min = standalone
      .pipe(uglify())
      .pipe(dest('./', {ext: '.min.js'}))
      .pipe(gulp.dest("dist/"))
      .on('end', resolve)
      .on('error', reject)

  }), Promise.resolve()).then(done).catch(done);

});

// Uglify other Woleet libraries
gulp.task("lib", ['standalone'], (done) => {

  const sources = [
    {file: './dist/woleet-api.js'},
    {file: './dist/woleet-crypto.js'},
    {file: './dist/woleet-chainpoint.js'},
    {file: './dist/woleet-hashfile.js'},
    {file: './dist/woleet-verify.js'},
    {file: './dist/woleet-signature.js'}
  ];

  const weblibs = gulp.src(sources.map((s) => s.file))
    .pipe(concat('woleet-weblibs.js'))
    .pipe(gulp.dest("dist/"));

  const weblibs_min = weblibs
    .pipe(uglify())
    .pipe(dest('./', {ext: '.min.js'}))
    .pipe(gulp.dest("dist/"))
    .on('end', done);

});

gulp.task('default', [
  'worker',
  'standalone',
  'lib'
]);
