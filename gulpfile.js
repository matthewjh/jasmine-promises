var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

gulp.task('package', function () {
  var b = browserify({
    entries: './src/index.js' 
  });

  return b
    .transform(babelify)
    .bundle()
    .pipe(source('jasmine-promises.js'))
    .pipe(gulp.dest('dist'));
});
