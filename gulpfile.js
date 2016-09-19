var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var copy = require('gulp-copy');

gulp.task('package-main', function () {
  var b = browserify({
    entries: './src/index.js' 
  });

  return b
    .transform(babelify)
    .bundle()
    .pipe(source('jasmine-promises.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('package-karma', function () {
  return gulp.src('./src/karma.js')
          .pipe(copy('./', {prefix: 1}));
});

gulp.task('package', ['package-main', 'package-karma'], function () {
});
