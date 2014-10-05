'use strict';

var gulp = require('gulp');
var gulpRename = require('gulp-rename');
var gulpAutoprefixer = require('gulp-autoprefixer');
var gulpLess = require('gulp-less');
var gulpJade = require('gulp-jade');

var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('browserify', function() {
  return browserify('./frontend/scripts/script.js')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./frontend/build/'));
});

gulp.task('fonts', function () {
  return gulp.src('./frontend/font-awesome/**/*.*')
    .pipe(gulp.dest('./frontend/build/font-awesome'));
});

gulp.task('less', function () {
  return gulp.src('./frontend/styles/style.less')
    .pipe(gulpLess({ paths: ['./frontend/styles'] }))
    .pipe(gulpAutoprefixer('last 5 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulpRename('style.css'))
    .pipe(gulp.dest('./frontend/build/'));
});

gulp.task('jade', function () {
  return gulp.src('./frontend/templates/index.jade')
    .pipe(gulpJade())
    .pipe(gulpRename('index.html'))
    .pipe(gulp.dest('./frontend/'));
});

gulp.task('default', [ 'browserify', 'less', 'fonts', 'jade' ]);

//// WATCH
gulp.task('watch', [ 'default' ], function () {
  gulp.watch('./frontend/styles/*', ['less']);
  gulp.watch('./frontend/scripts/*', ['browserify']);
  gulp.watch('./frontend/templates/*', ['jade']);
});